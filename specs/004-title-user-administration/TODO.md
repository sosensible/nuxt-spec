# TODO — 004-title-user-administration

Generated: 2025-10-24
Branch: 004-title-user-administration

This file mirrors the agent-managed todo list for transparency. Keep this file updated when tasks change. Use the managed todo list for in-progress tracking; this file is the repository-visible snapshot.

- [x] Clarify admin authorization method
  - Decide how server middleware identifies admins (Appwrite roles/claims, allowlist, or app-side admin flag). Implemented: Appwrite session-based claims + ADMIN_ALLOWLIST fallback.
- [x] Clarify pagination style
  - Decide API pagination approach for list endpoints (cursor-based vs offset). Implemented: cursor-based with base64 offset token.
- [ ] Decide deletion & retention policy
  - Decide soft-delete vs hard-delete, retention window, and audit logging requirements for deletions. (affects API, tests, data model)
- [x] Decide session revocation semantics
  - Decide how to revoke sessions (invalidate tokens immediately, mark session revoked server-side, or expire sessions) and expected behaviour for active tokens.
  <!-- Removed: audit feature is no longer tracked in this spec. -->
- [x] Implement Appwrite admin helpers (T012)
  - Create `server/utils/appwrite-admin.ts` helpers: listUsers, getUser, updateUser, changeUserRoles/claims, revokeAllSessionsForUser, deleteUser. Implemented using node-appwrite Query API.
- [x] Create isAdmin middleware (T010)
  - Create conservative server middleware `server/middleware/isAdmin.ts` that supports session-based check using Appwrite Account.get() and ADMIN_ALLOWLIST & dev overrides. Implemented and wired into routes.
- [x] T100: API contract test for list users
  - Write API contract test for `GET /api/admin/users` (cursor-based pagination, q filter). Tests should mock Appwrite SDK and assert JSON shape { data, nextCursor } and 200 responses.
- [x] T101: Implement server endpoint internals for GET /api/admin/users
  - Wire search `q` into Appwrite queries or server-side filtering, implement cursor token semantics (base64 offset token), validate params, and add `isAdmin` enforcement.
- [x] T102: Tests for admin-deny and invalid cursor
  - Add API tests for 403 responses (isAdmin-deny), invalid cursor tokens (400), and search edge cases.
- [x] Finish positive admin session test
  - Add and fix the positive admin test that mocks session cookie and Appwrite account.get() and asserts successful access.
- [x] Run full test suite
  - Execute the project's full test suite to validate overall project health and catch regressions.
- [x] Refactor Appwrite helper for injectable client
  - Allow injecting a client into `server/utils/appwrite-admin.ts` to make unit testing the helper easier without requiring env vars.
- [x] Add cursor-edge-case tests
  - Add tests for exact page boundary, presence/absence of nextCursor at page end, and large offsets to validate pagination behavior.
- [x] Add session revocation tests (expanded)
  - Implement session-revocation tests: unit validation, body-param contract, error paths, large-session handling. Audit part deprecated.
- [x] T103: Revoke all sessions for a user (speckit)
  - Implement T103 following speckit/TDD: contract test -> server handler -> helper wiring -> middleware enforcement -> API test.
- [x] T104: Delete user endpoint (speckit)
  - Implement DELETE /api/admin/users/:id route following speckit: add contract tests, implement server route, call appwrite-admin.deleteUser, enforce isAdmin. Audit recording removed by decision.
- [ ] Make audit helper injectable
  - Deprecated: audit feature removed; helper not implemented in this branch.
- [ ] File-backed audit client with rotation
  - Deprecated: audit feature removed; file-backed client removed from active scope.
- [x] T105: Change roles endpoint
  - Add `POST /api/admin/users/:id/roles` endpoint with contract/error tests (audit recording removed).
- [x] Change roles enforcement test
  - Add isAdmin-deny enforcement test for change roles endpoint.
- [x] Change roles unit test
  - Add unit tests for `changeRolesHandler` (success, missing userId, invalid roles).
- [x] Resume speckit implementation — schedule purge worker
  - User selected option 1: implement a scheduled purge worker to hard-delete soft-deleted users whose retention expired. This task is now completed: added `server/plugins/purge-scheduler.server.ts` which schedules the purge worker when ENABLE_SCHEDULED_PURGES=true and NODE_ENV=production. Added docs and QA notes under APPWRITE-SETUP.md and docs/ops.md.
- [x] T103a: Add revoke-sessions validation tests
  - Add unit tests verifying input validation for `revokeSessionsHandler` (empty/missing userId) and propagation of helper errors.
- [x] T103b: Add revoke-sessions body-param contract test
  - Add contract test ensuring the default handler accepts `userId` in the request body and invokes the helper.
- [x] Draft session revocation decision document
  - Write a short document listing options (immediate invalidation, expire-only, queued background revocation), pros/cons, and recommended semantics for the API and handler.
- [x] Implement chosen session revocation semantics
  - Update `revokeSessionsHandler`, default handler, and tests to match the chosen semantics (retries, error mapping, idempotency).
- [x] Tidy TypeScript warnings in purge handler
  - Fix `server/api/admin/users/[id]/purge.post.ts` to remove `any` usage and unused variable warnings, and run tests to confirm.
- [x] Add hard-delete purge endpoint (env-gated)
  - Implement `POST /api/admin/users/:id/purge` which calls `hardDeleteUser` when `ADMIN_ALLOW_HARD_DELETE=true` and requires explicit confirm=true. Add contract/enforcement/error tests.
- [x] Remove audit code and tests
  - Remove audit-related code and tests introduced earlier; neutralized tests and replaced audit modules with no-op stubs.
- [x] Delete audit stub files and neutralized tests
  - Remove `server/utils/audit.ts`, `server/utils/audit-file.ts` and neutralized audit test files that now only contain comments so they don't run. Then run tests to confirm no regressions.
- [x] Sweep specs/docs to remove 'audit' mentions
  - Find and replace mentions of 'audit' in specs/docs with neutral wording (e.g., 'review', 'checks', 'logging', 'observability').
- [x] Remove audit wording from development-standards.md
  - Replace 'Audit Process' section and references to 'npm audit' with 'Vulnerability scanning process' and 'vulnerability scan'.
- [x] Replace 'pnpm audit' mentions
  - Replace literal 'pnpm audit' occurrences with a generic note: 'run a vulnerability scanner such as `pnpm audit`' across docs.
- [x] Create PR description for removing audit feature
  - Add `.github/PULL_REQUESTS/004-remove-audit.md` documenting deleted files and changes for PR description.
- [x] Tidy TypeScript warnings in tests for purge worker
  - Fix linter/type hints in `tests/cron/purge-worker.test.ts` ( import order and typed mocks ).
  <!-- DEFERRED: Vue runtime warnings triage and fixes are deferred for later; will be triaged after this branch ships. -->
- [x] Resolve duplicated imports 'User'
  - Fix duplicated `User` imports reported in test run by consolidating types/exports in `app/stores` or adjusting import paths to avoid collisions.
- [ ] Verify fixes and run tests
  - Run full test suite after fixes to ensure warnings are resolved and no regressions introduced. Update the report with remaining warnings (if any).
- [ ] Finalize feature branch and reduce scope creep
  - Prepare the branch for PR: fix one high-impact warning (duplicated `User` import), defer remaining Vue warnings to tech-debt, and open a focused PR with current feature changes.
