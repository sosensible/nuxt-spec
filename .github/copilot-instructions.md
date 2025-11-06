# nuxt-spec — Copilot / AI contributor guide

Auto-generated base + repository-specific notes. Last updated: 2025-10-31

## What this project is

- Nuxt 4 app (Vue 3 + Composition API) with TypeScript strict mode.
- UI: `@nuxt/ui`; state: Pinia (`@pinia/nuxt` + `app/stores`); image handling `@nuxt/image`.
- E2E tests use Playwright; unit tests use Vitest + @vue/test-utils.

## Quick commands (use pnpm or npm as you prefer)

- Install: `pnpm install` (project uses pnpm@10 in package.json)
- Dev server: `pnpm dev` -> runs `nuxt dev` (port 3000 by default)
- Build: `pnpm build` -> `nuxt build`
- Preview production build: `pnpm preview`
- Typecheck: `pnpm typecheck` (uses `nuxt typecheck` / vue-tsc)
- Lint: `pnpm lint`
- Unit tests: `pnpm test` (Vitest). Watch: `pnpm test:watch`.
- E2E: `pnpm e2e` (Playwright). Useful variants: `e2e:ui`, `e2e:headed`, `e2e:debug`.
- Copy env example for auth flows: `pnpm env:auth` (or `pnpm env:auth:ps` on PowerShell).

## Key files & patterns (examples)

- Routes / pages: `app/pages/` (including `app/pages/admin/**` and `app/pages/auth/**`).
- Layouts: `app/layouts/default.vue` and `app/layouts/admin.vue`.
- Components: `app/components/` e.g. `AppHeader.vue`, `AdminUsersList.vue`.
- Composables: `app/composables/useAuth.ts`, `usePagedUsers.ts` (prefixed `use*`).
- Stores: `app/stores/*.ts` (Pinia modules). Example: `app/stores/adminUsers.ts`.
- Middleware: `app/middleware/auth.ts` and `guest.ts` — follow these for route guards.
- Plugins: `app/plugins/auth.client.ts` (client-only auth integration).

## Architecture notes / conventions

- Route rules in `nuxt.config.ts` set `/admin/**` to client-side only (SSR disabled) and prerender selected static pages (see `routeRules`).
- Runtime public config lives in `nuxt.config.ts` under `runtimeConfig.public` (e.g. `NUXT_PUBLIC_APP_URL`).
- Theme preference: persisted to localStorage (search `ThemeToggle.vue` and `useLayoutState.ts`).
- Composables return plain functions/refs and are used across pages/components (no global side-effects).

## External integrations

- Appwrite SDK: `node-appwrite` appears in `package.json`. Examples: `scripts/test-appwrite-connection.ts`, `app/plugins/auth.client.ts` and `server/api/*` endpoints.
- Tests: `@nuxt/test-utils` is configured for integration/unit helpers; Playwright config in `playwright.config.ts`.

## Testing & CI hints

- Unit tests: use Vitest (see `vitest.config.ts`). Runs headless by default. Coverage via `pnpm test:coverage`. Use relative imports for test files over alias paths. (e.g. `import { useAuth } from '../../composables/useAuth'`).
- E2E: Playwright tests live under `tests/e2e/` and use `playwright.config.ts`.

## What to change in this file

- Keep the top section (Active Technologies) but add/refresh dates and the short list above.
- If you add repository-specific rules for an AI agent, write them between `<!-- MANUAL ADDITIONS START -->` and `<!-- MANUAL ADDITIONS END -->` so they persist across automated updates.

## Quick examples you can use in edits

- Guarded admin page uses `app/middleware/auth.ts` and `app/stores/adminUsers.ts` for state.
- To run the app locally with example env: `pnpm env:auth && pnpm dev` (PowerShell users may prefer `pnpm env:auth:ps`).

<!-- MANUAL ADDITIONS START -->
<!-- Add small, targeted repo-specific tips here (1–3 lines). -->
<!-- MANUAL ADDITIONS END -->
