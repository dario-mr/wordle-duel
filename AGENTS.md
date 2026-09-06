# Repository Guidelines

## Project Structure & Module Organization

- App source lives in `src/`.
- `src/app/` contains application wiring, routing, theme, query client, and the application shell.
- `src/features/` contains feature-owned UI, hooks, queries, APIs, and types grouped by domain.
- `src/shared/` contains dependency-light API infrastructure, configuration, hooks, and UI primitives.
- `src/pages/` contains small standalone route screens that do not belong to a larger feature.
- `src/state/` contains global UI preferences.
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

- Vitest unit and component tests mirror the source tree under `test/`.
- Cross-feature integration tests live in `test/integration/`; Playwright tests live in `test/e2e/`.
- Minimum validation for every change:
- `npm run lint`
- `npm run build`
- For UI/flow changes, manually verify affected pages in `npm run dev`.
- If you add tests, mirror the source path under `test/` and document any new command.

## Commit & Pull Request Guidelines

- Follow the existing commit style: conventional prefixes such as `feat:`, `fix:`, `chore:`,
  `revision:` with optional scopes (example: `feat(legal): ...`).
- Keep commits focused and explain user-visible impact.

## Architecture Overview

- Routing is defined in `src/app/router.tsx`; feature pages live with their owning feature.
- Shared REST transport is centralized in `src/shared/api/`; endpoint modules and contracts live
  with their owning feature.
- Authentication uses the server-backed session established by Google OAuth; REST and WebSocket
  requests use the session cookie, while unsafe REST requests retain CSRF protection.
- Server state is managed with feature-local React Query modules.
- Real-time room updates use STOMP WebSocket in `src/features/rooms/game/useRoomTopic.ts` with the
  browser session cookie and room-query invalidation on topic events.
- UI preferences use Zustand in `src/state/`; translations are in `src/i18n/`.
