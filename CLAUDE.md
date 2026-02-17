# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
repository.

## Project Overview

React SPA frontend for Wordle Duel — a multiplayer word-guessing game. The backend is a separate
service; this repo is frontend only.

## Commands

```bash
npm run dev           # Vite dev server on http://localhost:3001
npm run build         # tsc -b && vite build
npm run lint          # ESLint
npm run format        # Prettier (write)
npm run format:check  # Prettier (check only)
```

No test framework is configured.

## Architecture

### Tech Stack

React 19, TypeScript (strict), Vite, Chakra UI 3, Zustand, TanStack React Query, i18next (EN/IT),
STOMP WebSocket, React Router 7.

### State Management (three layers)

- **Server state**: TanStack React Query (`src/query/`) — rooms, user data. Query keys defined in
  `roomQueries.ts` and `meQueries.ts`.
- **Local UI state**: Zustand stores (`src/state/`) — theme mode and locale, persisted to
  localStorage.
- **Auth state**: Singleton token manager (`src/auth/tokenManager.ts`) — JWT access token held in
  memory, refresh via HttpOnly cookie.

### API Layer (`src/api/`)

- `wdsClient.ts` — central fetch wrapper. Attaches Bearer token, handles CSRF (`X-WD-XSRF-TOKEN`
  from cookie), auto-refreshes on 401.
- Resource modules (`rooms.ts`, `users.ts`, `auth.ts`) expose typed async functions.
- DTOs in `api/types.ts`.

### Real-time Updates (`src/ws/`)

- STOMP over WebSocket subscribes to `/topic/rooms/{roomId}`.
- On message receipt, invalidates React Query cache to trigger refetch.
- Auth via `Authorization` header in STOMP CONNECT frame; token refreshed in `beforeConnect`.

### Authentication Flow

OAuth2 Google login → backend sets HttpOnly refresh cookie → frontend calls `/auth/refresh` to get
JWT access token → token stored in memory with proactive refresh 30s before expiry. XSRF token
extracted from `WD-XSRF-TOKEN` cookie.

### Routing

Routes defined in `src/router/index.tsx`: `/`, `/login`, `/my-rooms`, `/rooms/:roomId`, `/legal`,
`*` (404). All wrapped in `AppLayout`.

### Dev vs Prod Paths

- Dev: Vite proxy forwards `/api/*`, `/ws`, `/oauth2/*`, `/auth/*`, `/logout/*` to `localhost:8088`.
- Prod: base path `/wordle-duel/`, backend at `/wordle-duel-service/api/v1/…` and
  `/wordle-duel-service/ws`.

### Theme

Chakra UI with Dracula color scheme, semantic tokens for light/dark mode. Dark mode flash prevented
by inline script in `index.html`.

## Code Conventions

- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`.
- ESLint with TypeScript strict + stylistic rules; curly braces always required.
- Prettier: single quotes, semicolons, 100-char line width.
- SVGs imported as React components via `vite-plugin-svgr`.
- Game constants in `src/constants.ts` (WORD_LENGTH=5, MAX_GUESS_ATTEMPTS=6).
