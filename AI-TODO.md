# AI-managed Todo (synced)

This file mirrors the assistant-managed todo list. It is updated when you ask the assistant to sync the in-memory todo into the repository.

Last synced: 2025-11-01

## Current tasks

- [x] Implement Teams-based `requireAdminRole` (done)

  - Replaced the `labels`-only admin check with an Appwrite Teams membership check in `server/utils/adminAuth.ts`.
  - Uses env var `APPWRITE_ADMIN_TEAM_ID` to identify the admin team and falls back to `user.labels` when unset.
  - Acceptance: admin endpoints return 403 for non-admins and 200 for admin members. Unit tests added at `tests/api/adminAuth.test.ts`.
    \

- [x] Add strict CORS Nitro middleware (done)

- Implemented `server/middleware/cors.ts` to enforce a whitelist of allowed origins (from `ALLOWED_ORIGINS`).
- Behavior: rejects credentialed requests from unknown origins, handles OPTIONS preflight with 204, and sets conservative CORS headers for allowed origins.
- Verified: unit tests ran after adding middleware — no regressions.

- [x] Enforce explicit admin label on server (done)

  - `server/utils/adminAuth.ts` now requires `user.labels` to include `'admin'` (committed).

- [x] Harden diagnostics endpoint (done)

  - `server/api/auth/diagnostics.get.ts` no longer leaks full session cookie or raw headers in production; development output is masked.

- [x] Add CI check to prevent devtools in production (done)

  - Added `scripts/check-devtools.js` which scans `nuxt.config.ts` for unconditional `devtools` enabling.
  - Integrated the check into the main CI workflow (`.github/workflows/ci.yml`) so the guard runs early in CI with NODE_ENV=production.
  - Running `pnpm run check:devtools` locally prints a helpful message; the CI job will fail if devtools is enabled in production.

- [ ] Audit environment variables exposure

  - Ensure server-only secrets (`APPWRITE_API_KEY`, etc.) are not bundled to the client. Add a scan/guard for `NUXT_PUBLIC_` prefix misuse.

- [ ] Persist audit logs for admin actions

  - Ensure `logAdminAction` writes to a durable append-only sink and includes operatorId, requestId, timestamp.

- [ ] Run unit and e2e tests and fix regressions

  - Run `pnpm test` (Vitest) and `pnpm e2e` (Playwright). Fix regressions from auth hardening.

- [ ] Document admin role mechanism and operational steps

- Update README/security doc with how admin membership is managed and env variables (`APPWRITE_ADMIN_TEAM_ID`, `ALLOWED_ORIGINS`).

---

If you'd like this file kept automatically in sync, reply "keep AI-TODO.md in sync" and I'll update it whenever the managed todo changes.
