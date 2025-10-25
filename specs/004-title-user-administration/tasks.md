# Tasks: User Administration — Manage Appwrite Users

Feature: User Administration - Manage Appwrite Users
Branch: 004-title-user-administration
Spec: specs/004-title-user-administration/spec.md

Phase 1 — Setup

- [ ] T001 Initialize feature workspace and verify docs (setup) specs/004-title-user-administration/plan.md
- [ ] T002 [P] Install / validate test tooling and dev scripts (Vitest, Nuxt Test Utils) package.json
- [ ] T003 Create a README note documenting SSR rules, Appwrite SDK policy, and Nuxt UI 4 usage specs/004-title-user-administration/quickstart.md

Phase 2 — Foundational (blocking prerequisites)

- [ ] T010 Create server middleware `server/middleware/isAdmin.ts` to assert admin requests (server/middleware/isAdmin.ts)
- [ ] T011 Create server API adapter scaffolding `server/api/admin/users/index.get.ts` and `server/api/admin/users/[id].get.ts` (server/api/admin/users/)
- [ ] T012 Add Appwrite SDK server helper `server/utils/appwrite-admin.ts` (server/utils/appwrite-admin.ts)
- [ ] T012 Add Appwrite SDK server helper `server/utils/appwrite-admin.ts` (server/utils/appwrite-admin.ts) — include helpers: listUsers, getUser, updateUser, changeUserRoles/claims, revokeAllSessionsForUser, deleteUser
- [ ] T013 Add mock helpers for Appwrite SDK used by tests `tests/fixtures/appwrite-mocks.ts`

Phase 3 — User Story US1: View and Search Users (P1) — MVP

Independent test criteria: unit tests + API contract tests ensure listing, pagination and search behavior.

- [ ] T100 [US1] Create API contract test for list users (tests/server/admin/users.list.test.ts)
- [ ] T101 [US1] Implement server endpoint `server/api/admin/users/index.get.ts` to return paginated results (server/api/admin/users/index.get.ts)
- [ ] T102 [US1] Unit test composable `useAdminUsers` for load/search behavior (tests/functional/composables/useAdminUsers.test.ts)
- [ ] T103 [US1] Create admin page scaffold `app/pages/admin/users/index.vue` and basic `UserList` component `app/components/admin/UserList.vue`
- [ ] T104 [US1] Wire `useAdminUsers` composable into `UserList` and add unit tests for component rendering (tests/components/UserList.test.ts)
- [ ] T105 [US1] Create fixture data and pagination tests (tests/fixtures/users-100.json)

Phase 4 — User Story US2: Edit User Profile & Status (P1)

Independent test criteria: composable and server tests ensure update persists and UI reflects change.

- [ ] T200 [US2] Create API contract test for get/update user (tests/server/admin/users.get.patch.test.ts)
- [ ] T201 [US2] Implement server endpoint `server/api/admin/users/[id].patch.ts` to accept name/avatar/emailVerified updates (server/api/admin/users/[id].patch.ts)
- [ ] T201 [US2] Implement server endpoint `server/api/admin/users/[id].patch.ts` to accept name/avatar/emailVerified updates (server/api/admin/users/[id].patch.ts)
- [ ] T201a [US2] Implement server endpoint `server/api/admin/users/[id]/disable.post.ts` that enforces disable by changing Appwrite roles/claims and revoking sessions; update app metadata for UI.
- [ ] T202 [US2] Implement composable `useAdminUser` for single-user fetch/update (app/composables/admin/useAdminUser.ts)
- [ ] T203 [US2] Unit tests for `useAdminUser` (tests/functional/composables/useAdminUser.test.ts)
- [ ] T204 [US2] Add `UserDetail` component and tests (app/components/admin/UserDetail.vue, tests/components/UserDetail.test.ts)

Phase 5 — User Story US3: Manage Sessions & Revoke Access (P2)

Independent test criteria: server endpoint tests verify session listing and revoke behavior; composable tests mock resulting state.

- [ ] T300 [US3] Create API contract test for list sessions and revoke (tests/server/admin/users.sessions.test.ts)
- [ ] T301 [US3] Implement `server/api/admin/users/[id]/sessions.get.ts` and `server/api/admin/users/[id]/revoke-session.post.ts`
- [ ] T302 [US3] Add composable methods in `useAdminUser` for sessions and revoke-session; unit tests to cover behavior

Phase 6 — User Story US4: Password Reset & Email Actions (P2)

Independent test criteria: server tests verify API call to Appwrite SDK triggers reset/verification action (mocked).

- [ ] T400 [US4] API contract test for `resend-verification` and `trigger-password-reset` (tests/server/admin/users.email.test.ts)
- [ ] T401 [US4] Implement `server/api/admin/users/[id]/resend-verification.post.ts` and `.../trigger-password-reset.post.ts`
- [ ] T402 [US4] Unit tests for server endpoints and composable calls

Phase 7 — User Story US5: Delete User (P3)

Independent test criteria: deletion requires confirmation flow; server test asserts deletion behavior and retention metadata.

- [ ] T500 [US5] API contract test for delete user (tests/server/admin/users.delete.test.ts)
- [ ] T501 [US5] Implement `server/api/admin/users/[id].delete.ts` with guarded confirmation (server/api/admin/users/[id].delete.ts) — this endpoint MUST mark deletion in app DB (deletedAt/retentionExpiresAt), enforce block by changing Appwrite roles/claims and revoking sessions, and schedule purge job.
- [ ] T502 [US5] Unit test for frontend confirmation dialog component and behavior (app/components/admin/UserDeleteConfirm.vue, tests/components/UserDeleteConfirm.test.ts)

Final Phase — Polish & Cross-cutting

- [ ] T900 Add JSDoc and component documentation for composables and components (app/composables/admin/_, app/components/admin/_)
- [ ] T901 Add accessibility checks and keyboard navigation tests for UserList and UserDetail (tests/accessibility/\*)
- [ ] T902 Update README and quickstart with testing instructions and Appwrite SDK policy (specs/004-title-user-administration/quickstart.md)
- [ ] T903 Ensure unit tests are included in CI workflow and E2E remains disabled for this feature (.github/workflows/ci.yml)

Dependencies & Execution Order

- US1 (T100–T105) should be implemented first (MVP). US2 depends on US1. US3/US4/US5 are independent after foundational tasks (T010–T013).

Parallelization Opportunities

- [P] Tasks T002 and T013 are parallelizable (tooling and mock helpers).
- [P] Component unit tests (T104, T204, T302, T502) can be worked in parallel by different engineers once composables exist.

Counts and Summary

- Total tasks generated: 30
- Tasks per story: US1=6, US2=5, US3=3, US4=3, US5=3, Setup/Foundation/Polish=10
- Parallel opportunities identified: 3 (T002, T013, component tests)
- Suggested MVP scope: implement US1 (View/Search) plus foundational tasks (T010–T013)

Try it

Open `specs/004-title-user-administration/tasks.md` to review or copy individual tasks into issues/PRs. Each task includes a file path for where to implement code or tests.
