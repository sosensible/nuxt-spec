```mdc
# Feature Specification: User Administration - Manage Appwrite Users

**Feature Branch**: `004-title-user-administration`
**Created**: 2025-10-24
**Status**: Draft
**Input**: User description: "User administration tool to edit users and manage Appwrite-authenticated users (manage users and, if API permits, teams). Focus on user management now; team permissions later."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View and Search Users (Priority: P1)

As an authenticated administrator, I want to view a paginated list of registered users so I can find and inspect account details.

**Why this priority**: Listing and searching users is the foundational admin activity — without it admins cannot act.

**Independent Test**: Load the Users admin page; assert that a paginated list is returned, search input filters results, and clicking a user opens the details panel.

**Acceptance Scenarios**:

1. **Given** there are multiple users in the system, **When** the admin opens the Users page, **Then** the UI shows a paginated list with user name, email, provider, and status (active/disabled).
2. **Given** the admin types an email or name into search, **When** they submit, **Then** the list filters to matching users within 2 seconds.
3. **Given** the admin selects a user from the list, **When** they open details, **Then** they see full profile information and recent sessions.

---

### User Story 2 - Edit User Profile & Status (Priority: P1)

As an admin, I want to edit user profile fields (display name, email verification flag, avatar URL) and enable/disable accounts so I can correct data and prevent access when necessary.

**Why this priority**: Admins must be able to fix account data and disable compromised accounts.

**Independent Test**: From a selected user, update the display name and toggle active/disabled; persist and verify via API and UI reflect the change.

**Acceptance Scenarios**:

1. **Given** a user record, **When** the admin updates the display name and saves, **Then** the updated name appears in the list and on the user detail view.
2. **Given** a user account, **When** the admin disables the account, **Then** login attempts for that user are rejected and the UI marks the account as disabled.

---

### User Story 3 - Manage Sessions & Revoke Access (Priority: P2)

As an admin, I want to view and revoke active sessions for a user so I can immediately terminate access for compromised accounts.

**Why this priority**: Session revocation is a common incident response action — useful but not as frequently used as basic edits.

**Independent Test**: In user details, list active sessions with last-used timestamp and provide a revoke button that invalidates the session and removes it from the list.

**Acceptance Scenarios**:

1. **Given** a user has an active session, **When** the admin clicks revoke, **Then** the session is removed and subsequent API calls using that session fail.

---

### User Story 4 - Password Reset & Email Actions (Priority: P2)

As an admin, I want to trigger a password reset email or resend verification to a user so I can assist account recovery.

**Why this priority**: Useful support action; not required for initial MVP but expected admin functionality.

**Independent Test**: Trigger password reset and verify an API call is made and an explanatory message is returned (do not rely on external mail delivery in tests).

**Acceptance Scenarios**:

1. **Given** a user with an unverified email, **When** the admin resends verification, **Then** the system returns success and a verification attempt is recorded in logs.

---

### User Story 5 - Delete User (Priority: P3)

As an admin, I want to permanently remove a user account so that obsolete or fraudulent accounts can be removed.

**Why this priority**: Destructive action — allowed but lower priority and gated behind confirmation and retention policy.

**Independent Test**: Delete a user and confirm the account is no longer returned by the list API and deletion metadata (deletedAt/retentionExpiresAt) is set for cleanup.

**Acceptance Scenarios**:

1. **Given** a user account, **When** the admin selects delete and confirms with typed email, **Then** the account is removed and deletion metadata is recorded for retention/cleanup.

---

### Edge Cases

- What happens when Appwrite is unreachable: UI should show a clear error and retry option.
- Rate limits: handle API rate-limit responses from Appwrite gracefully and surface them to admin.
- Large datasets: ensure pagination handles >10k users without loading all on client.
- Partial failures: if user update partially succeeds (e.g., profile updated but email change failed), show explicit remediation steps.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The system MUST provide an authenticated admin-only Users page showing a paginated list of users with columns: name, email, provider, status, and created date.
- **FR-002**: The system MUST allow admins to search users by email, name, or provider with results returned within 2 seconds for typical datasets.
- **FR-003**: The system MUST provide a user details view that shows profile fields, session list, and last activity timestamp.
- **FR-004**: The system MUST allow admins to edit user profile fields (display name, avatar URL) and persist changes.
- **FR-005**: The system MUST allow admins to enable/disable user accounts; disabled accounts must fail authentication attempts.
- **FR-006**: The system MUST allow admins to view and revoke active sessions for a user.
- **FR-007**: The system MUST allow admins to trigger password reset and resend verification email actions for a user (API calls only; email delivery is out-of-scope for tests).
- **FR-008**: The system MUST allow admins to delete a user after a guarded confirmation flow and set deletion metadata (deletedAt/retentionExpiresAt) for cleanup.
- **FR-009**: If Appwrite exposes team management APIs and the admin UI chooses to surface them, the system MUST allow listing teams for a user and adding/removing membership (this is optional for initial delivery and may be deferred to a follow-up).
- **FR-010**: The system MUST enforce access control changes (disable/block) by using Appwrite server-side controls (roles, teams or custom claims) and revoking sessions via the Appwrite Admin SDK. App-side metadata (e.g., `status` or `isDeleted`) MAY be used for UI/retention purposes but MUST NOT be the sole enforcement mechanism.
### Nuxt-Specific Requirements

- **NFR-001**: Users page and user details MUST be implemented as server-rendered routes that hydrate on the client (universal routes) to allow SEO for admin docs.
- **NFR-002**: Admin-only routes MUST use server middleware to confirm the requester has admin privileges by verifying Appwrite server-side roles or custom claims (preferred). If Appwrite roles/claims are unavailable in a deployment, a documented fallback (for example an `ADMIN_ALLOWLIST` env var or app-side admin flag stored in user metadata) MAY be used but must be justified in the implementation plan.
- **NFR-003**: API routes under `/server/api/admin/users` MUST expose JSON endpoints for list, get, update, disable, sessions, revoke-session, resend-verification, trigger-password-reset, and delete.
- **NFR-004**: Components MUST be reusable composables for user data fetching (e.g., `useAdminUsers`, `useAdminUser`) and have unit tests.
- **NFR-005**: All API interactions MUST handle and surface Appwrite SDK errors consistently with a user-friendly mapping.
- **NFR-006**: List endpoints MUST use cursor-based pagination by default (returning a `nextCursor` token). The API SHOULD accept a `limit` and an opaque `cursor` token; clients may request `pageSize` up to a documented maximum (e.g., 100). Offset-based pagination is discouraged for large datasets; support for offset may be added later only if strictly necessary.

### Key Entities _(include if feature involves data)_

<!-- AuditRecord entity removed from scope (no app-level logging implemented) -->

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Admins can load the Users page with first page of results in under 2 seconds for typical test dataset (1000 users).
- **SC-002**: Search queries return filtered results within 2 seconds.
- **SC-003**: 100% of CRUD operations (update, disable, revoke session, delete) return success or meaningful error messages; tests cover happy and error paths.
- **SC-004**: Admin destructive actions (delete) require explicit confirmation and must set deletion metadata; tests must assert deletion and retention metadata are present.
- **SC-005**: At least 80% unit test coverage for composables and components added for the feature; API contract tests validate endpoints.

## Test-Driven Development Requirements _(mandatory)_

Follow the RED-GREEN-REFACTOR cycle described in Development Standards (see template). Key test artifacts to deliver:

- Unit tests for components and composables before implementation.
- API contract tests for server endpoints mocking Appwrite responses.
- E2E Playwright scenarios for P1 flows: view/search users, edit basic profile, disable user.

### Testing Strategy (summary)

- Unit tests: Vitest + Nuxt Test Utils for components/composables.
- API tests: Vitest isolates server endpoints and stubs Appwrite SDK.
- E2E: Playwright for critical admin flows (P1); these will be gated behind CI label while E2E runs are disabled by default.

## Standards Compliance Requirements

- Accessibility: admin pages must be keyboard navigable and provide ARIA labels for actions.
- Error handling: all failures surfaced with clear messages and suggested next steps.
- Documentation: update README with admin endpoints, environment variables and dev notes for Appwrite keys.

## Assumptions

- Admin authentication and authorization mechanism exists; this spec mandates server middleware verify Appwrite server-side roles or custom claims to identify admins (preferred). If Appwrite role/claim support is not available in an environment, any fallback (allowlist or app-side admin flag) must be explicitly documented and justified in the plan.
- Appwrite project has appropriate API keys and permissions to manage users and sessions.
- Email delivery for verification/reset is handled by Appwrite or external provider and is out-of-scope for testing (tests validate only that the API call was made).
- Team management is optional for initial delivery and will be scoped in a follow-up spec.

## Risks & Mitigations

- Risk: Appwrite API rate limits or unavailable endpoints — Mitigation: implement retries with exponential backoff and clear admin error pages.
- Risk: Deleting users could remove important linked data — Mitigation: soft-delete option and retention metadata; require typed confirmation.

## Implementation Notes (non-normative)

- Use a server-side, trusted admin client to perform user management operations so secrets are not exposed to the browser.
- Create server-side admin endpoints that validate the caller's admin privileges, normalize inputs, and return consistent JSON responses.

## Clarifications

### Session 2025-10-24

- Q: Which authorization approach should server middleware use to identify admins? → A: Use Appwrite server-side roles/claims (verify admin role/claim).

- Q: Which pagination style should the Users list API use? → A: Cursor-based pagination (return `nextCursor` tokens; accept `limit` and `cursor`).

---

**Specification Status**: Draft — ready for checklist validation.

```

# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`  
**Created**: [DATE]  
**Status**: Draft  
**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing _(mandatory)_

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements _(mandatory)_

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

### Nuxt-Specific Requirements

- **NFR-001**: Pages MUST support [SSR/CSR/Static - specify rendering mode per route]
- **NFR-002**: Components MUST be [client-only/server-only/universal - specify execution context]
- **NFR-003**: API routes MUST handle [specific HTTP methods and response types]
- **NFR-004**: Performance MUST meet [<3s FCP, <100ms API response, <500kb bundle size]
- **NFR-005**: SEO MUST include [meta tags, structured data, sitemap requirements]

_Example of marking unclear requirements:_

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **NFR-006**: Deployment target MUST be [NEEDS CLARIFICATION: static site, serverless, Node.js server?]

### Key Entities _(include if feature involves data)_

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria _(mandatory)_

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Test-Driven Development Requirements _(mandatory)_

Following [Constitution Core Principle IV](../memory/constitution.md#iv-test-driven-development-non-negotiable):

### RED-GREEN-REFACTOR Cycle

**Phase 1: Write Failing Tests (RED)**

- [ ] Unit tests written for all components BEFORE component implementation
- [ ] Unit tests written for all stores/composables BEFORE implementation
- [ ] API contract tests written BEFORE server route implementation
- [ ] E2E tests written for critical user journeys BEFORE feature implementation
- [ ] All tests initially FAIL (proving they test actual functionality)
- [ ] Test failure screenshots/logs documented as proof of RED phase

**Phase 2: Implement to Pass Tests (GREEN)**

- [ ] Minimum code written to make unit tests pass
- [ ] Server API routes implemented to pass contract tests
- [ ] Components implemented to pass component tests
- [ ] E2E tests pass after feature implementation
- [ ] All tests now PASS (GREEN phase achieved)

**Phase 3: Refactor (MAINTAIN GREEN)**

- [ ] Code refactored for clarity, performance, and maintainability
- [ ] All tests remain GREEN during and after refactoring
- [ ] Test coverage maintained at >80% for components and server routes

### Testing Strategy

**Unit Tests** (Vitest + Nuxt Test Utils):

- [ ] Component rendering and props
- [ ] Component events and user interactions
- [ ] Composable return values and reactivity
- [ ] Store state, actions, and getters
- [ ] Server utility functions

**API Contract Tests** (Vitest):

- [ ] Request/response structure validation
- [ ] HTTP status codes
- [ ] Error handling scenarios
- [ ] Authentication/authorization

**E2E Tests** (Playwright):

- [ ] Critical user journeys from spec
- [ ] Cross-page navigation flows
- [ ] Form submissions and validations
- [ ] Error state handling

### Standards Compliance Requirements

Must comply with [Development Standards](../memory/development-standards.md):

**Accessibility** (WCAG 2.1 AA):

- [ ] Semantic HTML elements used (nav, main, article, etc.)
- [ ] All interactive elements keyboard accessible
- [ ] ARIA labels provided for icon-only buttons
- [ ] Focus states visible and properly managed
- [ ] Form inputs have associated labels
- [ ] Color contrast meets 4.5:1 ratio

**Component Communication**:

- [ ] Props/events pattern for parent-child communication
- [ ] Pinia store (via composable) for cross-component shared state
- [ ] Composables for feature-specific reusable logic
- [ ] Event names use kebab-case
- [ ] Maximum 10 props per component

**Error Handling**:

- [ ] All async operations wrapped in try-catch
- [ ] Loading, error, and success states for all data fetches
- [ ] User-friendly error messages with retry options
- [ ] Server errors logged but not exposed to client
- [ ] Error boundaries implemented for major sections

**CSS & Styling**:

- [ ] Tailwind utility classes used exclusively
- [ ] Custom CSS justified and documented if used
- [ ] Responsive design at mobile (375px), tablet (768px), desktop (1920px)
- [ ] Dark mode support via `dark:` variants
- [ ] Mobile-first responsive approach

**Documentation**:

- [ ] All components have JSDoc comments with @example
- [ ] All composables documented with usage examples
- [ ] All API routes documented with params, returns, throws
- [ ] README updated with new features and API endpoints
- [ ] Environment variables documented

**Naming Conventions**:

- [ ] Components: PascalCase.vue
- [ ] Composables: camelCase.ts with `use` prefix
- [ ] Stores: camelCase.ts
- [ ] Pages: kebab-case.vue or [...].vue
- [ ] API Routes: kebab-case.[method].ts
- [ ] Boolean variables: isX, hasX, canX, shouldX
