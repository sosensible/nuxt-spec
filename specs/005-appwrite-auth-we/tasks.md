# Implementation Tasks: Appwrite-auth — Admin Users list

Feature: Appwrite-auth — Admin Users list
Plan: `plan.md`
Spec: `spec.md`

NOTE: This tasks list is MVP-focused and intentionally avoids scope creep. E2E and extensive non-functional work are deferred to planning.

## Phase 1 — Setup

- [x] T001 Install server dependencies and ensure Appwrite SDK is available (P) `server/package.json` (or repo root package manager)
- [x] T002 Add environment variable documentation and template: add `server/.env.example` with `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT`, `APPWRITE_ADMIN_KEY` (file path: `server/.env.example`)
- [x] T003 Create server authentication middleware to validate operator elevated role for admin routes `server/middleware/auth.ts`

## Phase 2 — Foundational (blocking prerequisites)

- [x] T004 [P] Create server-side proxy folder `server/api/admin/` and include index placeholder `server/api/admin/README.md`
- [x] T005 [P] Add TypeScript types for proxy responses (confirm or move existing) - `types/admin.ts`
- [x] T006 Create logging utility for server routes (request-id + operator id) `server/utils/logger.ts`

## Phase 3 — User Story Phases (in priority order)

### User Story 1 — View canonical user list (P1)

Independent test: calling `GET /api/admin/users?pageSize=25` returns a `PagedResponse<UserRecord>` matching `types/admin.ts`.

- [x] T007 [US1] Implement GET endpoint `server/api/admin/users.get.ts` that accepts `pageSize`, `cursor`, `offset`, `q` and returns `{ items, cursor, totalCount }` (use Appwrite SDK)
- [x] T008 [US1] Implement server-side mapping/normalization to `PagedResponse<UserRecord]` and error normalization `server/api/admin/users.get.ts`
- [x] T009 [US1] Create frontend UsersList component that calls `/api/admin/users` and renders rows `app/components/AdminUsersList.vue`
- [x] T010 [US1] Implement pagination controls (Next/Prev/PageSize selector) and wire to the store/composable `app/composables/usePagedUsers.ts`
- [x] T011 [US1] Add unit tests for the list composable and API-contract test for GET route `tests/server/admin-users-get.spec.ts`

### User Story 2 — Edit user via popup editor (P1)

Independent test: opening Edit popup and submitting valid changes results in a `PATCH` to `/api/admin/users/:id` and server returns updated user in `item`.

- [x] T012 [US2] Implement PATCH endpoint `server/api/admin/users/[id].patch.ts` that validates payload and calls Appwrite `users.update` (restrict fields)
- [x] T013 [US2] Create EditUserPopup component with client-side validation `app/components/EditUserPopup.vue`
- [x] T014 [US2] Wire EditUserPopup save to call `PATCH /api/admin/users/:id` and refresh list on success `app/pages/admin/users.vue`
- [x] T015 [US2] Add unit tests for EditUserPopup validation and API-contract test for PATCH route `tests/server/admin-users-patch.spec.ts`

### User Story 3 — Delete user with confirmation (P2)

Independent test: confirming Delete issues `DELETE /api/admin/users/:id` and the server returns 204; UI removes row.

- [x] T016 [US3] Implement DELETE endpoint `server/api/admin/users/[id].delete.ts` that performs hard-delete via Appwrite `users.delete` and returns 204
- [x] T017 [US3] Create DeleteUserModal component that shows explicit irreversible warning and triggers DELETE `app/components/DeleteUserModal.vue`
- [x] T018 [US3] Wire Delete flow to refresh/restore selection and show success/error messages `app/pages/admin/users.vue`
- [x] T019 [US3] Add API-contract test for DELETE route `tests/server/admin-users-delete.spec.ts`

## Final Phase — Polish & Cross-cutting

- [x] T020 Add server authorization check to all admin routes to enforce in-app elevated operator role `server/middleware/auth.ts`
- [x] T021 Add request-id in responses and log key actions for audit `server/utils/logger.ts`
- [x] T022 Update `specs/005-appwrite-auth-we/README.md` with developer quickstart referencing `contracts/quickstart.md` and env setup `specs/005-appwrite-auth-we/README.md`

## Dependencies & Order

- US1 must be implemented before US2 and US3 for MVP delivery and safe testing (list → edit/delete flows). Recommended order: T001→T004→T007→T009→T010→T011→T012→T013→T014→T015→T016→T017→T018→T019→T020→T021→T022

## Parallel opportunities

- Tasks marked with `[P]` can be executed in parallel (install deps, add types, create proxy folder). Frontend component work (T009/T013/T017) can be parallelized once API endpoints T007/T012/T016 have clear contracts.

## Counts & Summary

- Total tasks: 22
- Tasks per story: US1:5 (T007–T011), US2:4 (T012–T015), US3:4 (T016–T019)
- Setup & foundational tasks: 6 (T001–T006)
- Final polish tasks: 2 (T020–T022)

## Implementation strategy (MVP-first)

1. Deliver User Story 1 only (GET list + paging + UI) as the minimal shippable increment.
2. Add Edit (US2) next to allow safe updates using the same API patterns.
3. Add Delete (US3) last in the MVP flow.

Each task includes a file path and is small enough for an LLM or engineer to implement directly.
