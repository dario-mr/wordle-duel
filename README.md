# Wordle Duel

React frontend for Wordle Duel.

## Prerequisites

- Node
- npm

## Setup

```bash
npm install
```

## Development

```bash
npm run dev
```

- Dev server runs on `http://localhost:3001`.
- In development, the app uses a Vite proxy to avoid CORS:
  - REST: requests to `/api/*` are proxied to `http://localhost:8088`.
  - WebSocket: `/ws` is proxied as a WebSocket to `http://localhost:8088`.

## Production build

```bash
npm run build
npm run preview
```

Notes:

- The production build is configured with `base: /wordle-duel/` (see `vite.config.ts`).
- In production, the frontend calls the backend through the gateway at:
  - REST: `/wordle-duel-service/api/v1/…`
  - WS: `/wordle-duel-service/ws`

## Scripts

- `npm run dev` – start Vite dev server
- `npm run build` – typecheck (`tsc -b`) and build
- `npm run preview` – serve the production build
- `npm run lint` – run ESLint
- `npm run format` / `npm run format:check` – run Prettier
