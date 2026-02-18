# Repository Guidelines

## Project Structure & Module Organization

- App source lives in `src/`.
- `src/pages/` contains route-level screens (`HomePage.tsx`, `RoomPage.tsx`).
- `src/components/` contains reusable UI grouped by domain (`home/`, `room/`, `navbar/`, `common/`).
- `src/api/` holds backend clients, DTOs, and error handling.
- `src/auth/`, `src/ws/`, `src/query/`, and `src/state/` handle auth, WebSocket, server state, and
  local state.
- `src/i18n/` contains locale resources (`en.ts`, `it.ts`).

## Build, Test, and Development Commands

- `npm run dev`: start Vite dev server (default `http://localhost:3001`) with proxy for REST and WS.
- `npm run build`: run TypeScript project build (`tsc -b`) and production bundle.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across the repo.
- `npm run format` / `npm run format:check`: format or verify formatting with Prettier.

## Coding Style & Naming Conventions

- Language stack: TypeScript + React.
- Use 2-space indentation and keep files Prettier-clean.
- Components/pages use `PascalCase` (example: `RoomSharePanel.tsx`).
- Hooks use `camelCase` with `use` prefix (example: `useRoomTopic.ts`).
- Keep API types explicit; prefer small, focused modules by feature folder.
- Run `npm run lint` and `npm run format:check` before opening a PR.

## Testing Guidelines

- There is currently no dedicated automated test framework configured in `package.json`.
- Minimum validation for every change:
- `npm run lint`
- `npm run build`
- For UI/flow changes, manually verify affected pages in `npm run dev`.
- If you add tests, colocate them near the feature (for example `src/components/.../*.test.tsx`) and
  document any new command.

## Commit & Pull Request Guidelines

- Follow the existing commit style: conventional prefixes such as `feat:`, `fix:`, `chore:`,
  `revision:` with optional scopes (example: `feat(legal): ...`).
- Keep commits focused and explain user-visible impact.

## Architecture Overview

- Routing is defined in `src/router/index.tsx`; top-level pages live in `src/pages/`.
- REST requests are centralized in `src/api/` (`apiFetch.ts`, resource modules, typed contracts in
  `types.ts`).
- Authentication uses in-memory access tokens in `src/auth/tokenManager.ts`, refreshed through
  `/auth/refresh` with cookie session + CSRF.
- Server state is managed with React Query in `src/query/`.
- Real-time updates use STOMP WebSocket in `src/ws/useRoomTopic.ts` with JWT sent on CONNECT and
  room-query invalidation on topic events.
- UI preferences use Zustand in `src/state/`; translations are in `src/i18n/`.
