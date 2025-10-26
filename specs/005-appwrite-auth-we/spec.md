# Feature Specification: Appwrite-auth — Admin Users list (Appwrite as source-of-truth)

**Feature Branch**: `005-appwrite-auth-we`  
**Created**: 2025-10-25  
**Status**: Draft  
**Input**: User description: "appwrite auth - we want to connect to appwrite to pull users for this page. http://localhost:3000/admin/users , we want the appwrite data to be the source of truth, not the current columns on the page. We do want to add edit and delete fuctionality, preferably with a popup editor for the user. Here is some context for appwrite, but use the MCP also."

## Summary

Admin users need a single authoritative view of application users that is backed by Appwrite (the Appwrite Users service). The `/admin/users` page must display the canonical user data from Appwrite, allow permitted operators to edit user attributes in a popup editor, and delete users when permitted. The page must not rely on the current local columns as the source of truth — Appwrite is authoritative.

Actors, actions and data (high-level):

- Actors: Admin operator (authorized staff), Appwrite (trusted backend), the Admin UI
- Actions: View user list, filter/search, open popup editor to update user profiles, delete user, refresh/sync list
- Data: Appwrite user records (id, email, name, status, createdAt, emailVerification, custom attributes, roles/teams)

Constraints and guiding principles:

- Appwrite is the source of truth for all fields shown on the page.
- All edits and deletes must be executed through Appwrite APIs and respect Appwrite permission/role model.
- UI should minimize data duplication and show live or near-real-time state after operations.
- Prefer non-destructive defaults: require confirmation for destructive operations.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View canonical user list (Priority: P1)

As an authorized admin operator, I want to open `/admin/users` and see the canonical list of users from Appwrite so I can manage accounts based on authoritative data.

Why this priority: This is the core value — operators must see the real user state from Appwrite before taking action.

Independent Test: Open the page while Appwrite contains test users; the page shows user rows that exactly match the Appwrite Users API output for the same query parameters.

Acceptance Scenarios:

1. Given Appwrite has 3 users, When operator loads `/admin/users`, Then the page displays 3 rows with id, email, name, status, createdAt and email verification status matching Appwrite.
2. Given a user is updated in Appwrite by another actor, When the operator refreshes the page or performs inline refresh, Then the updated fields are reflected.
3. Given the user base exceeds a single page, When the operator navigates pagination controls, Then the UI requests the correct page from Appwrite and renders the returned rows.

---

---

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria _(mandatory)_

ACTION REQUIRED: Define measurable success criteria.
These must be technology-agnostic and measurable.

### Measurable Outcomes

## Test-Driven Development Requirements _(mandatory)_

Following [Constitution Core Principle IV](../memory/constitution.md#iv-test-driven-development-non-negotiable):

### RED-GREEN-REFACTOR Cycle

**Phase 1: Write Failing Tests (RED)**

**Phase 2: Implement to Pass Tests (GREEN)**

# Feature Specification: Appwrite-auth — Admin Users list (Appwrite as source-of-truth)

**Input**: User description: "appwrite auth - we want to connect to appwrite to pull users for this page. http://localhost:3000/admin/users , we want the appwrite data to be the source of truth, not the current columns on the page. We do want to add edit and delete fuctionality, preferably with a popup editor for the user."

These measurable success criteria have been deferred to a post-launch measurement plan. See `notes/post-launch-metrics.md` for the defined metrics, measurement approach, owners, and when to execute them.

For the MVP/prelaunch phase, use the Acceptance test checklist and functional acceptance scenarios above as the pass/fail criteria for shipping.
Admin operators need a single authoritative view of application users backed by Appwrite (the Appwrite Users service). The `/admin/users` page must display canonical user data from Appwrite, allow permitted operators to edit user attributes via a popup editor, and delete users when permitted. The page must not rely on local copies of user data — Appwrite is the source of truth.

Actors, actions and data (high-level):

- Actors: Admin operator (authorized staff), Appwrite (trusted backend), the Admin UI
- Actions: View user list, filter/search, open popup editor to update user profiles, delete user, refresh/sync list
- Data: Appwrite user records (id, email, name, status, createdAt, emailVerified, custom attributes, roles/teams)

Constraints and guiding principles:

- Appwrite is the source of truth for all fields shown on the page.
- All edits and deletes must be executed through Appwrite and respect its permission model.
- UI should minimize data duplication and show live or on-demand state after operations.
- Require confirmation for destructive operations.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View canonical user list (Priority: P1)

As an authorized admin operator, I want to open `/admin/users` and see the canonical list of users from Appwrite so I can manage accounts based on authoritative data.

Why this priority: Core administrative value — operators must act on authoritative data.

Independent Test: With test users in Appwrite, loading `/admin/users` shows rows that match the Appwrite Users query results.

Acceptance Scenarios:

1. Given Appwrite has 3 users, When operator loads `/admin/users`, Then the page displays 3 rows with id, email, name, status, createdAt and emailVerified matching Appwrite.
2. Given a user is updated in Appwrite externally, When operator refreshes the page, Then the updated fields are reflected.

---

### User Story 2 - Edit user via popup editor (Priority: P1)

As an authorized admin, I want to open a popup editor to change editable fields for a selected user and save changes back to Appwrite so the user record is updated in the authoritative store.

Independent Test: Open popup, change a field (e.g., display name), save; verify Appwrite user record contains the new value and UI reflects the change.

Acceptance Scenarios:

1. Given operator clicks Edit, When popup opens, Then it shows editable fields pre-filled from Appwrite.
2. Given valid changes and Save, When Appwrite returns success, Then popup closes and row updates.
3. Given Appwrite rejects update, When Save is clicked, Then popup shows a clear error and remains open.

---

### User Story 3 - Delete user with confirmation (Priority: P2)

As an authorized admin, I want to delete a user record so I can remove obsolete or malicious accounts — with explicit confirmation and awareness of consequences.

Independent Test: Trigger delete, confirm, verify Appwrite returns success and UI removes the user.

Acceptance Scenarios:

1. Given operator clicks Delete, When confirmation dialog appears, Then it shows user identifier and requires explicit confirmation.
2. Given operator confirms, When Appwrite returns success, Then the user row is removed.
3. Given operator cancels, Then no change occurs.

---

### Edge Cases

- Appwrite unreachable: show an error banner and provide retry.
- Large user base: use paginated queries; UI should not load entire dataset at once.
- Concurrent edits: surface conflict/validation messages returned by Appwrite.

### Pagination & Navigation (UI)

- The UI MUST provide stable pagination controls for navigating large user sets: Next, Previous, and direct page selection.
- Default page size: 25 rows. Operators may change page size from {10, 25, 50} with the preference remembered for the session.
- Prefer cursor-based pagination (Appwrite cursors) for performance and correctness when available; the server-side proxy should translate UI paging requests to Appwrite-compatible cursor queries. If cursors are not available for a particular query, support offset/limit as a fallback.
- The UI MUST show current page, total pages (if Appwrite provides total count), and a brief range indicator (e.g., "Showing 26–50 of ~12,345"). If an exact total is not available, display an approximate indicator.
- Paging actions MUST preserve selection/context where reasonable (e.g., when editing a user on page N and returning to the list, attempt to restore the same page and highlight the edited row).

Acceptance Scenarios (paging):

1. Given a user base of 1,000 users and page size 25, When operator navigates to page 2, Then the UI displays users 26–50 and the backend call contains the correct cursor/offset parameters.
2. Given operator changes page size to 50, When the page reloads, Then the new page size is applied and the UI reflects the updated range.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `/admin/users` MUST fetch and display the canonical user list from Appwrite.
- **FR-002**: The page MUST support server-side paging and filtering so queries request subsets from Appwrite.
- **FR-003**: The UI MUST provide an Edit action that opens a popup editor prefilled from Appwrite.
- **FR-004**: The Edit popup MUST validate input client-side, submit updates to Appwrite, and refresh the affected row on success.
- **FR-005**: The page MUST provide a Delete action that requires confirmation and issues the delete to Appwrite; UI updates after success.
- **FR-006**: Update and delete operations MUST respect Appwrite permissions; only operators with the elevated in-app admin role may see Edit/Delete controls (see Operator permissions section).
- **FR-007**: The UI MUST display clear, actionable error messages for Appwrite/network/permission errors and allow retry where appropriate.

### Key Entities

- **User (Appwrite User Record)**: id, email, name, status, createdAt, emailVerified, customAttributes, roles/teams
- **Admin Operator**: authenticated operator with elevated in-app admin role for MVP

## Success Criteria _(mandatory)_

Note: Measurable, post-launch success criteria have been removed from this feature branch and are tracked as future feature targets. See `notes/post-launch-metrics.md` for the defined metrics, measurement approach, owners, and when to execute them.

For the MVP / prelaunch phase, use the Acceptance test checklist and the functional acceptance scenarios above as the pass/fail criteria for shipping.

## Test-Driven Development Requirements _(mandatory)_

- Unit tests for list component, popup editor, and delete confirmation.
- API contract tests for any server-side proxy routes that call Appwrite.
<!-- E2E tests are out of scope for this feature branch. See planning for future test work. -->

## Assumptions

- Admin UI will call Appwrite via secure server-side routes or a service account; admin keys will not be embedded in client code.
- Appwrite user records include the listed fields; custom attributes may be surfaced as extra fields.
- Paging/filtering will use Appwrite-supported queries; specifics to be defined in planning.

- Deployment target: NOT DECIDED. The deployment target (static site, serverless, node server, etc.) has not been selected yet and will be decided during planning; implementation details that depend on the deployment target are deferred to the planning phase.

## Operator permissions

Decision: Any authenticated app operator with an elevated in-app admin role (MVP). The UI will show Edit/Delete controls to operators with this elevated role. Revisit and tighten mapping to Appwrite Teams or stricter org-level roles in a follow-up feature.

## Delete semantics

Decision: Hard-delete (permanent removal) for MVP. This simplifies the initial implementation but carries compliance/audit implications; plan to revisit and likely adopt a soft-delete or hybrid retention purge in a later feature.

## Data freshness expectations

Decision: On-demand refresh (explicit Refresh control and refresh on page reload) for MVP. Revisit polling or real-time subscriptions in follow-up work if needed.

## Acceptance test checklist (short)

- List fetches match Appwrite Users API results for same query
- Edit popup saves and Appwrite reflects updated data
- Delete removes user after confirmation
- Error states are surfaced and retryable

---

Generated by spec tooling on branch `005-appwrite-auth-we`.
