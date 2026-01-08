# Frontend integration instructions (AI agent)

This document describes how to integrate this backend repo (`wordle-duel-service`) into the existing
frontend repo (`wordle-duel`, currently a minimal app).

Production deployment targets:

- Frontend: `https://dariolab.com/wordle-duel/`
- Backend: `https://dariolab.com/wordle-duel-service/`

The frontend already has these core dependencies:

- `react`, `react-dom`
- `react-router-dom`
- `@chakra-ui/react` + `@emotion/react` + `@emotion/styled` + `framer-motion`
- `@tanstack/react-query`
- `zustand`

The backend is Spring Boot (Java 21) and provides:

- REST API for room lifecycle + guess submission
- WebSocket (STOMP) events for live room updates
- Swagger/OpenAPI documentation

---

## 0) Backend contract (what the frontend must call)

### REST base URL

The frontend must support different backend base URLs per environment:

- Dev (local): `http://localhost:8088/`
- Prod (deployed): `https://dariolab.com/wordle-duel-service/`

REST API base (relative to the base URL above): `./api/v1`.

Example: prod rooms endpoint is `https://dariolab.com/wordle-duel-service/api/v1/rooms`.

### REST endpoints

All endpoints are under `/api/v1/rooms`:

- `POST /api/v1/rooms` → create a new room
- `POST /api/v1/rooms/{roomId}/join` → join an existing room
- `GET /api/v1/rooms/{roomId}` → fetch current room state
- `POST /api/v1/rooms/{roomId}/guess` → submit a guess

Request/response shapes (important fields):

- `POST /api/v1/rooms`
  - body: `{ "playerId": string, "language": string }`
  - success: `201` with `RoomDto`

- `POST /api/v1/rooms/{roomId}/join`
  - body: `{ "playerId": string }`
  - success: `200` with `RoomDto`

- `GET /api/v1/rooms/{roomId}`
  - success: `200` with `RoomDto`

- `POST /api/v1/rooms/{roomId}/guess`
  - body: `{ "playerId": string, "word": string }`
  - success: `200` with `{ "room": RoomDto }`

### Key response DTOs

- `RoomDto`
  - `id: string`
  - `language: "IT"` (currently the only supported value)
  - `status: "WAITING_FOR_PLAYERS" | "IN_PROGRESS" | "CLOSED"`
  - `players: Array<{ id: string; score: number }>`
  - `currentRound: RoundDto | null`

- `RoundDto`
  - `roundNumber: number`
  - `maxAttempts: number` (currently 6)
  - `guessesByPlayerId: Record<string, GuessDto[]>`
  - `statusByPlayerId: Record<string, string>` (values are derived from backend enum:
    `PLAYING | WON | LOST`)
  - `finished: boolean`

- `GuessDto`
  - `word: string`
  - `letters: Array<{ letter: string; status: "CORRECT" | "PRESENT" | "ABSENT" }>`
  - `attemptNumber: number`

### Error shape

On non-2xx responses, the backend returns:

```json
{
  "code": "SOME_CODE",
  "message": "Human readable message"
}
```

Common HTTP statuses/codes you must handle:

- `400` validation/guess issues (`INVALID_LENGTH`, `INVALID_CHARS`, `WORD_NOT_ALLOWED`,
  `NO_ATTEMPTS_LEFT`, `GENERIC_BAD_REQUEST`, ...)
- `403` player not allowed (`PLAYER_NOT_IN_ROOM`)
- `404` room not found (`ROOM_NOT_FOUND`)
- `409` room conflict (`ROOM_FULL`, `ROOM_NOT_READY`, `ROOM_CLOSED`)
- `500` unknown (`UNKNOWN_ERROR`, `DICTIONARY_EMPTY`)

### Guess rules (frontend should pre-validate)

The backend normalizes guesses by trimming and uppercasing, then enforces:

- length must be exactly 5 characters
- only letters `A-Z` are allowed
- guess must be in the dictionary

In the UI: uppercase on input, block non-letters, and disable submit until length is 5.

---

## 1) WebSocket contract (live updates)

### Endpoint

- STOMP endpoint path (relative to backend base URL): `./ws`
  - dev: `ws://localhost:8088/ws`
  - prod: `wss://dariolab.com/wordle-duel-service/ws`
- Topic prefix: `/topic`
- Room topic: `/topic/rooms/{roomId}`

### Event format

Messages on `/topic/rooms/{roomId}` are JSON:

```json
{
  "type": "ROUND_STARTED",
  "payload": {
    /* depends on type */
  }
}
```

Known `type` values:

- `ROOM_CREATED`
- `PLAYER_JOINED`
- `ROUND_STARTED`
- `ROUND_FINISHED`
- `SCORES_UPDATED`

Payloads:

- `ROOM_CREATED` payload is currently `PlayerJoinedPayload`
- `PLAYER_JOINED` payload: `{ "playerId": string, "players": string[] }`
- `ROUND_STARTED` payload: `{ "roundNumber": number, "maxAttempts": number }`
- `ROUND_FINISHED` payload: `{ "roundNumber": number }`
- `SCORES_UPDATED` payload: `{ "scores": Record<string, number> }`

Recommended frontend strategy: treat events as invalidation signals and refetch the room state via
`GET /api/v1/rooms/{roomId}`.

---

## 2) Run backend locally (for frontend dev)

From this repo (`wordle-duel-service`):

1. `cp .env.example .env`
2. Set `PROFILE=dev` in `.env` (uses in-memory H2)
3. Run: `mvn spring-boot:run`

Useful URLs:

- Swagger UI: `http://localhost:8088/swagger-ui/index.html`
- OpenAPI JSON: `http://localhost:8088/v3/api-docs`
- Health: `http://localhost:8088/actuator/health`

---

## 3) Frontend integration plan (what to implement in `wordle-duel`)

### 0) Frontend deployment + backend-target profiles

The frontend is deployed at:

- Prod frontend URL: `https://dariolab.com/wordle-duel/`

The frontend must be able to switch between these backend targets:

- Dev (local): `http://localhost:8088/`
- Prod backend URL: `https://dariolab.com/wordle-duel-service/`

Implement this as environment-based configuration in the frontend repo.

Important for routing in prod: because the app is served under `/wordle-duel/`, configure React Router
with a `basename` of `/wordle-duel` (or the equivalent setting in your router setup), so deep links
like `https://dariolab.com/wordle-duel/rooms/<roomId>` work on refresh.

If the frontend uses Vite:

- Create `.env.development` with `VITE_WDS_BASE_URL=http://localhost:8088/`
- Create `.env.production` with `VITE_WDS_BASE_URL=https://dariolab.com/wordle-duel-service/`

Then build URLs using relative joins (important for the `/wordle-duel-service/` path prefix):

- `apiBaseUrl = new URL('./api/v1', baseUrl)`
- `wsHttpUrl = new URL('./ws', baseUrl)` and map protocol `http→ws`, `https→wss`

If the frontend is not Vite, use the equivalent env mechanism (e.g. `REACT_APP_WDS_BASE_URL`)
with the same base URL values.

### A) Configure API base URL + dev proxy

Goal: avoid CORS problems during development.

Preferred approach (recommended): configure the frontend dev server to proxy `/api` to
`http://localhost:8088`.

- If using Vite: set `server.proxy["/api"]` in `vite.config.*`
- If using another dev server: use its equivalent proxy mechanism

Then your frontend can call relative URLs like `/api/v1/rooms`.

If you do NOT use a proxy, you will need backend-side CORS for REST (this backend currently only
configures WebSocket allowed-origins via `wds.websocket.allowed-origins`).

### B) Ensure WebSocket origin is allowed

When running the backend with `PROFILE=dev`, allowed origins are configured in
`src/main/resources/application-dev.yaml`:

- currently includes `http://localhost:3001`

---

## 4) Recommended frontend structure

Create (or adapt) these modules in the `wordle-duel` repo:

- `src/api/wdsClient.ts` (fetch wrapper + error parsing)
- `src/api/rooms.ts` (room-specific API functions)
- `src/api/types.ts` (TypeScript types matching DTOs)
- `src/query/queryClient.tsx` (React Query setup)
- `src/state/playerStore.ts` (Zustand: playerId persistence)
- `src/state/roomStore.ts` (optional: last roomId, etc.)
- `src/ws/useRoomTopic.ts` (WebSocket/STOMP subscription)
- `src/routes/HomePage.tsx` (create/join UI)
- `src/routes/RoomPage.tsx` (play UI)

Also ensure the app is wrapped with:

- `ChakraProvider`
- `QueryClientProvider`
- `BrowserRouter`

---

## 5) Implement the REST client (React Query friendly)

### A) Error handling contract

Implement a small `fetchJson` helper that:

- sets `Content-Type: application/json`
- on non-2xx, parses `{ code, message }` and throws a typed error (`{ status, code, message }`)
- on 204, returns `null`

Use this error in the UI to show a Chakra `Alert`.

### B) React Query keys + hooks

Use stable query keys:

- `['room', roomId]` for `GET /rooms/{roomId}`

Mutations:

- `createRoom({ playerId, language })`
- `joinRoom({ roomId, playerId })`
- `submitGuess({ roomId, playerId, word })`

Update strategy:

- On `createRoom` / `joinRoom`: navigate to the room route and seed the cache with the returned
  `RoomDto`.
- On `submitGuess`: update the cache with the returned room (from `GuessResponse.room`).

---

## 6) Implement player identity (Zustand)

Backend identity is a plain `playerId` string.

Frontend requirement:

- generate a stable `playerId` once (UUID or similar)
- store it in `localStorage`
- expose `playerId` via a Zustand store so all API calls can use it

Do not rely on “display name” only unless you want it to be the `playerId` (must be non-blank).

---

## 7) Implement the WebSocket subscriber

The backend speaks STOMP over WebSocket.

Recommended minimal dependency to add to the frontend:

- `@stomp/stompjs`

Connection details:

- local broker URL: `ws://localhost:8088/ws`
- subscribe destination: `/topic/rooms/{roomId}`

Implementation guidelines:

- connect when `RoomPage` mounts
- subscribe to the room topic
- on each message: `queryClient.invalidateQueries({ queryKey: ['room', roomId] })`
- handle reconnects (`reconnectDelay`)
- disconnect/unsubscribe on unmount

If you also want to support HTTPS deployments, compute the WS URL from the API base URL (switch
`http → ws`, `https → wss`).

---

## 8) UI flows to implement

### Home page

- “Create room”
  - ensure playerId exists
  - language selector (for now only `IT`)
  - call `POST /api/v1/rooms`
  - navigate to `/rooms/:roomId`

- “Join room”
  - roomId input
  - call `POST /api/v1/rooms/:roomId/join`
  - navigate to `/rooms/:roomId`

### Room page

- show room metadata: room id, players list + scores, status
- if waiting: show “waiting for opponent” and a shareable URL
- if in progress:
  - show per-player board using `currentRound.guessesByPlayerId[playerId]`
  - provide guess input for the current player
  - disable input when `statusByPlayerId[playerId] !== 'PLAYING'`

---

## 9) Practical checklists (so integration doesn’t get stuck)

### When REST calls fail in browser

- In prod, frontend and backend share the same origin (`https://dariolab.com`) so CORS should not be
  involved; verify you are calling `https://dariolab.com/wordle-duel-service/...` (note the path
  prefix).
- In dev, use a dev proxy so the frontend calls `/api/...` (no CORS), or add backend REST CORS
  configuration (not currently present).

### When WebSocket connect fails

- verify backend is running (`PROFILE=dev` recommended)
- verify you are connecting to `/ws` (not `/ws/`)
- verify your frontend origin is in `wds.websocket.allowed-origins`
- verify you’re using a STOMP client (not raw WebSocket)

### When guesses are rejected

- enforce uppercase `A-Z` and length 5 on the client
- display backend error message (`ErrorResponse.message`) to the user

---

## 10) Source of truth

Use Swagger/OpenAPI as the canonical contract for request/response fields:

- `http://localhost:8088/swagger-ui/index.html`

If anything in this document conflicts with Swagger, update the frontend to match Swagger.
