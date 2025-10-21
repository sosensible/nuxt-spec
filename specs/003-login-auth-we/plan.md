# Implementation Plan: Authentication System with Appwrite

**Branch**: `003-login-auth-we` | **Date**: October 21, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-login-auth-we/spec.md`

## Summary

Implement a comprehensive authentication system using Appwrite as the backend service, supporting both email/password and GitHub OAuth login methods. The feature includes user registration, login, logout, password reset, email verification, and secure session management. Priority 1 (MVP) focuses on email/password authentication, with password reset and OAuth as Priority 2 enhancements, and email verification as Priority 3 security layer.

## Technical Context

**Language/Version**: Nuxt 4.x with Vue 3 Composition API and TypeScript strict mode  
**Primary Dependencies**: @nuxt/ui v4 (forms, components, styling), Appwrite SDK, @nuxt/image  
**UI Framework**: Nuxt UI v4 - provides UForm, UInput, UButton, UCard, UAlert for all authentication UI  
**Storage**: Appwrite Cloud (fra.cloud.appwrite.io) - user accounts, sessions, verification tokens  
**Testing**: Vitest for composables/API routes, Nuxt Test Utils for SSR, Playwright for E2E  
**Target Platform**: Universal - SSR with client-side hydration, API routes on server  
**Project Type**: Nuxt full-stack application with server API routes and protected pages  
**Performance Goals**: <1.5s login page load (3G), <500ms API responses (95th percentile), <2s form submissions  
**Constraints**: SSR/CSR compatibility, HTTP-only cookies for sessions, Appwrite SDK server-side only, Nuxt UI v4 components only  
**Scale/Scope**: Single-tenant application, ~1000 users initially, 5 auth-related pages, 10 API routes, 1 composable, 1 middleware

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Modular Component Architecture**: Auth composable (`useAuth`) provides reusable authentication logic; no complex components needed (forms are pages)
- [x] **Universal Rendering**: Auth pages support SSR with client-side hydration; middleware checks sessions server-side
- [x] **API-First Development**: API contracts defined in spec (FR-001 to FR-020); routes implemented after tests written
- [x] **Test-Driven Development**: RED-GREEN-REFACTOR cycle specified with 33 test requirements (13 unit, 10 API, 10 E2E)
- [x] **Deployment Versatility**: Works on Vercel, Netlify, Node.js (Appwrite SDK in server routes only)
- [x] **Performance Budget**: Login <1.5s (3G), API <500ms (95th %), forms <2s - all specified in success criteria
- [x] **Type Safety**: TypeScript strict mode; Appwrite SDK types; shared types for API contracts

## Standards Compliance Checklist

_Reference: [Development Standards](../memory/development-standards.md)_

### State Management

- [x] State management pattern identified: **Composable only** (`useAuth` with `useState` for SSR compatibility)
- [x] Store access pattern: N/A - no Pinia store needed; `useAuth` composable provides all state and methods
- [x] Justification: Authentication is cross-cutting concern but composable with `useState` is sufficient for user session state

### Component Design

- [x] Component communication pattern defined: **No new components needed** - using pages with `useAuth` composable
- [x] Component complexity: N/A - auth forms are pages, not reusable components (login.vue, register.vue, etc.)
- [x] Naming conventions: `useAuth.ts` (camelCase with `use` prefix), pages kebab-case (login.vue, password-reset.vue)

### Accessibility & UX

- [x] WCAG 2.1 AA compliance requirements: Semantic HTML forms, labels for inputs, keyboard navigation, 4.5:1 contrast, error messages with `aria-describedby`
- [x] Semantic HTML structure planned: `<form>`, `<input>`, `<button>`, `<label>` elements with proper types
- [x] Keyboard navigation requirements: All forms and buttons keyboard accessible, Enter submits forms
- [x] Screen reader support: Form errors announced with `aria-live="polite"`, focus management on error

### Error Handling

- [x] Client-side error handling: Loading/error/success states in pages; `useAuth` composable manages state; user-friendly messages
- [x] Server-side error handling: Try-catch in API routes; Appwrite errors mapped to user-friendly messages; validation errors with field names
- [x] Error boundaries: Auth middleware catches session errors and redirects to login; API routes return appropriate HTTP status codes

### Documentation

- [x] Component documentation: JSDoc for `useAuth` composable with usage examples
- [x] API route documentation: JSDoc for each route (params, returns, throws) with contract examples
- [x] README updates: Add authentication setup section with Appwrite configuration steps and environment variables

### CSS & Styling

- [x] Nuxt UI v4 first approach confirmed: All forms and UI elements use @nuxt/ui v4 components (UForm, UInput, UButton, UCard, etc.)
- [x] Custom CSS justified: None needed - @nuxt/ui v4 provides complete authentication UI component set
- [x] Responsive design requirements: @nuxt/ui v4 components are responsive by default; forms auto-adapt to mobile/tablet/desktop
- [x] Dark mode support confirmed: @nuxt/ui v4 components have built-in dark mode support (automatic via color-mode)

## Project Structure

### Documentation (this feature)

```
specs/003-login-auth-we/
├── plan.md              # This file
├── spec.md              # Feature specification (COMPLETE)
├── checklists/
│   └── requirements.md  # Quality validation (COMPLETE)
├── research.md          # Phase 0: Appwrite SDK integration research (TODO)
├── data-model.md        # Phase 1: User, Session, Token entities (TODO)
├── quickstart.md        # Phase 1: Setup guide and usage examples (TODO)
└── contracts/           # Phase 1: API route contracts (TODO)
    └── api-routes.md    # API contracts for auth endpoints
```

### Source Code (repository root)

```
app/
├── composables/
│   └── useAuth.ts           # Authentication composable (user state, login/logout/register methods)
├── middleware/
│   └── auth.ts              # Route middleware (session validation, redirect to login)
├── pages/
│   ├── login.vue            # Login page (email/password + GitHub OAuth button)
│   ├── register.vue         # Registration page (email/password form)
│   ├── password-reset.vue   # Request password reset (email input)
│   ├── password-reset/
│   │   └── confirm.vue      # Reset password form (new password input, token in URL)
│   └── verify-email.vue     # Email verification page (token in URL, auto-verify on load)
├── server/
│   ├── api/
│   │   └── auth/
│   │       ├── register.post.ts       # POST /api/auth/register (create account)
│   │       ├── login.post.ts          # POST /api/auth/login (authenticate)
│   │       ├── logout.post.ts         # POST /api/auth/logout (end session)
│   │       ├── session.get.ts         # GET /api/auth/session (get current user)
│   │       ├── password-reset.post.ts # POST /api/auth/password-reset (request reset)
│   │       ├── password-reset/
│   │       │   └── confirm.post.ts    # POST /api/auth/password-reset/confirm (set new password)
│   │       ├── verify-email.post.ts   # POST /api/auth/verify-email (verify token)
│   │       ├── verify-email/
│   │       │   └── resend.post.ts     # POST /api/auth/verify-email/resend (resend email)
│   │       └── callback/
│   │           └── github.get.ts      # GET /api/auth/callback/github (OAuth callback)
│   └── utils/
│       └── appwrite.ts                # Appwrite client initialization (server-side only)
└── types/
    └── auth.ts                        # Shared types (User, Session, AuthResponse, etc.)

tests/
├── unit/
│   ├── composables/
│   │   └── useAuth.test.ts            # Test useAuth composable methods
│   └── middleware/
│       └── auth.test.ts               # Test auth middleware redirect logic
├── api/
│   └── auth/
│       ├── register.test.ts           # Test POST /api/auth/register
│       ├── login.test.ts              # Test POST /api/auth/login
│       ├── logout.test.ts             # Test POST /api/auth/logout
│       ├── session.test.ts            # Test GET /api/auth/session
│       ├── password-reset.test.ts     # Test password reset endpoints
│       ├── verify-email.test.ts       # Test email verification endpoints
│       └── callback-github.test.ts    # Test GET /api/auth/callback/github
└── e2e/
    └── auth/
        ├── registration.spec.ts       # E2E: Complete registration flow
        ├── login.spec.ts              # E2E: Login and session persistence
        ├── password-reset.spec.ts     # E2E: Password reset flow
        ├── oauth-github.spec.ts       # E2E: GitHub OAuth flow
        └── protected-routes.spec.ts   # E2E: Middleware redirect behavior

public/                                # No changes needed

.env                                   # Add Appwrite credentials (documented in spec)
```

**Structure Decision**: Standard Nuxt 4 full-stack structure with server API routes. Authentication is cross-cutting (affects all protected pages) but implemented as:

1. Composable for client-side auth state/methods
2. Middleware for route protection
3. API routes for server-side Appwrite SDK calls
4. Pages for user-facing auth forms

No custom components needed - forms are pages using @nuxt/ui form components.

## Complexity Tracking

_No constitutional violations - all standards met within normal Nuxt patterns._

---

## Implementation Phases

### Phase 0: Research & Setup (TDD: Setup)

**Goal**: Understand Appwrite SDK integration, configure backend, validate Appwrite setup

**Deliverables**:

- `research.md`: Appwrite SDK patterns, session management, error handling
- Backend setup completed (Appwrite project, GitHub OAuth app, SMTP)
- Environment variables configured
- Appwrite SDK connection tested

**Tasks**:

1. Research Appwrite Node.js SDK authentication methods (server-side)
2. Research Appwrite session management (HTTP-only cookies vs localStorage)
3. Research Appwrite OAuth flow (GitHub provider setup)
4. Document Appwrite error codes and mapping to user-friendly messages
5. Complete Appwrite backend setup (checklist in spec)
6. Create GitHub OAuth app and configure callback URLs
7. Add environment variables to `.env` (with example in `.env.example`)
8. Test Appwrite SDK connection with simple API call
9. Document findings in `research.md`

**TDD Note**: No tests written yet - this is infrastructure setup

---

### Phase 1: Design & Contracts (TDD: Setup)

**Goal**: Define data models, API contracts, and component interfaces before implementation

**Deliverables**:

- `data-model.md`: User, Session, Token entities with TypeScript types
- `contracts/api-routes.md`: API endpoint contracts (request/response schemas)
- `quickstart.md`: Setup guide and usage examples
- `types/auth.ts`: Shared TypeScript types

**Tasks**:

1. Define TypeScript types in `types/auth.ts`:
   - `User` (matches Appwrite user schema)
   - `Session` (matches Appwrite session schema)
   - `AuthResponse` (API response wrapper)
   - `LoginRequest`, `RegisterRequest`, `ResetPasswordRequest`, etc.
2. Document API contracts in `contracts/api-routes.md`:
   - Request schemas (body, query params)
   - Response schemas (success + error cases)
   - HTTP status codes for each endpoint
3. Create `data-model.md` with entity relationships and field constraints
4. Write `quickstart.md` with:
   - Appwrite setup steps (copy from spec)
   - `useAuth` composable usage examples
   - Protecting routes with middleware
   - Example login/register forms
5. Document `useAuth` composable interface (methods, state, types)

**TDD Note**: Contracts written but no implementation or tests yet

---

### Phase 2: Test-Driven Implementation (TDD: RED-GREEN-REFACTOR)

This phase follows strict TDD methodology. Each sub-phase represents a RED-GREEN-REFACTOR cycle.

#### Phase 2.1: Core Authentication Composable (RED-GREEN-REFACTOR)

**User Story**: P1 - Email/Password Registration and Login (Acceptance Scenarios 1-3, 5)

**RED Phase** (Write Failing Tests):

1. Write `tests/unit/composables/useAuth.test.ts`:
   - Test `login()` method with valid credentials → sets user state
   - Test `login()` with invalid credentials → returns error
   - Test `logout()` method → clears user state
   - Test `register()` with valid data → returns success
   - Test `register()` with invalid data → returns validation errors
   - Test `checkAuth()` loads session on mount
   - Run tests → ALL FAIL (no implementation exists)

**GREEN Phase** (Minimal Implementation):

1. Create `composables/useAuth.ts`:
   - Implement `useState` for user state (SSR compatible)
   - Implement `login()` calling `/api/auth/login`
   - Implement `logout()` calling `/api/auth/logout`
   - Implement `register()` calling `/api/auth/register`
   - Implement `checkAuth()` calling `/api/auth/session`
   - Run tests → ALL PASS

**REFACTOR Phase**:

1. Extract error handling logic to separate function
2. Add TypeScript strict types
3. Add JSDoc comments with usage examples
4. Run tests → STILL PASS

---

#### Phase 2.2: Authentication API Routes (RED-GREEN-REFACTOR)

**User Story**: P1 - Email/Password Registration and Login (Backend support)

**RED Phase** (Write Failing Tests):

1. Write `tests/api/auth/register.test.ts`:
   - Test POST /api/auth/register with valid data → 201 + user object
   - Test POST /api/auth/register with duplicate email → 400 + error
   - Test POST /api/auth/register with weak password → 400 + validation error
2. Write `tests/api/auth/login.test.ts`:
   - Test POST /api/auth/login with valid credentials → 200 + session
   - Test POST /api/auth/login with invalid credentials → 401
3. Write `tests/api/auth/logout.test.ts`:
   - Test POST /api/auth/logout → 200 + session terminated
4. Write `tests/api/auth/session.test.ts`:
   - Test GET /api/auth/session with valid session → 200 + user
   - Test GET /api/auth/session without session → 401
5. Run tests → ALL FAIL (no routes exist)

**GREEN Phase** (Minimal Implementation):

1. Create `server/utils/appwrite.ts` (Appwrite SDK initialization)
2. Create `server/api/auth/register.post.ts` (create account with Appwrite)
3. Create `server/api/auth/login.post.ts` (create session with Appwrite)
4. Create `server/api/auth/logout.post.ts` (delete session with Appwrite)
5. Create `server/api/auth/session.get.ts` (get current user from session)
6. Run tests → ALL PASS

**REFACTOR Phase**:

1. Extract Appwrite error mapping to `server/utils/appwrite.ts`
2. Add input validation with Zod schemas
3. Add JSDoc comments for each route
4. Run tests → STILL PASS

---

#### Phase 2.3: Login & Registration Pages (RED-GREEN-REFACTOR)

**User Story**: P1 - Email/Password Registration and Login (UI)

**RED Phase** (Write Failing Tests):

1. Write `tests/e2e/auth/registration.spec.ts`:
   - Test registration form submission → user created
   - Test registration with invalid email → error shown
   - Test registration with weak password → error shown
2. Write `tests/e2e/auth/login.spec.ts`:
   - Test login form submission → redirected to home
   - Test login with wrong password → error shown
   - Test logout button → session ends
3. Run tests → ALL FAIL (no pages exist)

**GREEN Phase** (Minimal Implementation):

1. Create `pages/register.vue`:
   - Use `<UForm>` component with Zod schema validation
   - Use `<UFormGroup>` + `<UInput>` for email, name, password fields
   - Use `<UButton>` for submit (built-in loading state)
   - Use `<UCard>` for page layout
2. Create `pages/login.vue`:
   - Use `<UForm>` with `useAuth` composable integration
   - Use `<UFormGroup>` + `<UInput>` for credentials
   - Use `<UButton>` for submit and GitHub OAuth
3. Add logout `<UButton>` to AppHeader component
4. Run tests → ALL PASS

**REFACTOR Phase**:

1. Extract Zod schemas to separate file
2. Add `<UAlert>` for error/success messages (Nuxt UI component)
3. Verify dark mode works (automatic in Nuxt UI v4)
4. Add password visibility toggle (UInput feature)
5. Run tests → STILL PASS

---

#### Phase 2.4: Auth Middleware (RED-GREEN-REFACTOR)

**User Story**: P1 - Email/Password Registration and Login (Route Protection)

**RED Phase** (Write Failing Tests):

1. Write `tests/unit/middleware/auth.test.ts`:
   - Test middleware redirects to login when no session
   - Test middleware allows access when session exists
   - Test middleware preserves return URL in redirect
2. Write `tests/e2e/auth/protected-routes.spec.ts`:
   - Test accessing protected page without login → redirected
   - Test accessing protected page after login → allowed
   - Test return URL redirect after login
3. Run tests → ALL FAIL (no middleware exists)

**GREEN Phase** (Minimal Implementation):

1. Create `middleware/auth.ts` (check session, redirect if needed)
2. Add `middleware: 'auth'` to protected pages (e.g., `/admin/*`)
3. Run tests → ALL PASS

**REFACTOR Phase**:

1. Add support for public routes list (whitelist)
2. Add loading state during session check
3. Add JSDoc comments
4. Run tests → STILL PASS

---

#### Phase 2.5: Password Reset Flow (RED-GREEN-REFACTOR)

**User Story**: P2 - Password Reset Flow

**RED Phase** (Write Failing Tests):

1. Write `tests/api/auth/password-reset.test.ts`:
   - Test POST /api/auth/password-reset → 200 (always, for security)
   - Test POST /api/auth/password-reset/confirm with valid token → 200
   - Test POST /api/auth/password-reset/confirm with expired token → 400
2. Write `tests/e2e/auth/password-reset.spec.ts`:
   - Test complete password reset flow (request → email → new password → login)
3. Run tests → ALL FAIL

**GREEN Phase** (Minimal Implementation):

1. Create `server/api/auth/password-reset.post.ts`
2. Create `server/api/auth/password-reset/confirm.post.ts`
3. Create `pages/password-reset.vue`:
   - Use `<UForm>` with email input (`<UFormGroup>` + `<UInput type="email">`)
   - Use `<UButton>` for submit
   - Use `<UCard>` for layout
4. Create `pages/password-reset/confirm.vue`:
   - Use `<UForm>` with password inputs
   - Use `<UButton>` for submit
5. Run tests → ALL PASS

**REFACTOR Phase**:

1. Add rate limiting for reset requests (1 per 60 seconds)
2. Add `<UAlert>` for success/error messages
3. Add password strength indicator (if UInput provides, else simple visual)
4. Run tests → STILL PASS

---

#### Phase 2.6: Email Verification (RED-GREEN-REFACTOR)

**User Story**: P3 - Email Verification

**RED Phase** (Write Failing Tests):

1. Write `tests/api/auth/verify-email.test.ts`:
   - Test POST /api/auth/verify-email with valid token → 200
   - Test POST /api/auth/verify-email with expired token → 400
   - Test POST /api/auth/verify-email/resend → 200 (rate limited)
2. Write `tests/e2e/auth/registration.spec.ts` (add verification steps):
   - Test registration → verification email received
   - Test clicking verification link → email verified
3. Run tests → ALL FAIL

**GREEN Phase** (Minimal Implementation):

1. Create `server/api/auth/verify-email.post.ts`
2. Create `server/api/auth/verify-email/resend.post.ts`
3. Create `pages/verify-email.vue`:
   - Use `<UCard>` for layout
   - Use `<UAlert>` for status messages (success/error/loading)
   - Use `<UButton>` for "Resend Verification" action
   - Auto-verify on page load (onMounted hook)
4. Update login flow to check emailVerification status
5. Run tests → ALL PASS

**REFACTOR Phase**:

1. Add rate limiting for resend (1 per 60 seconds)
2. Add countdown timer for resend button (disable until 60s passes)
3. Add `<UAlert>` with verification prompt in login page
4. Run tests → STILL PASS

---

#### Phase 2.7: GitHub OAuth (RED-GREEN-REFACTOR)

**User Story**: P2 - GitHub OAuth Registration and Login

**RED Phase** (Write Failing Tests):

1. Write `tests/api/auth/callback-github.test.ts`:
   - Test GET /api/auth/callback/github with success code → 200 + session
   - Test GET /api/auth/callback/github with error → 400
   - Test account linking scenario (matching email) → show linking message
2. Write `tests/e2e/auth/oauth-github.spec.ts`:
   - Test GitHub OAuth button → redirects to GitHub
   - Test OAuth callback → creates session
   - Test account linking message when email exists
3. Run tests → ALL FAIL

**GREEN Phase** (Minimal Implementation):

1. Create `server/api/auth/callback/github.get.ts`
2. Add GitHub OAuth to `pages/login.vue`:
   - Use `<UButton icon="i-simple-icons-github">` for OAuth button
   - Use `<UDivider label="or">` to separate OAuth from email/password
3. Add GitHub OAuth to `pages/register.vue` (same pattern)
4. Add account linking check with `<UAlert>` message
5. Run tests → ALL PASS

**REFACTOR Phase**:

1. Extract OAuth error handling
2. Add `<UAlert>` for OAuth error messages
3. Add loading state during OAuth redirect (UButton loading prop)
4. Run tests → STILL PASS

---

### Phase 3: Integration & E2E Testing (TDD: Validation)

**Goal**: Verify all features work together, test cross-browser, accessibility

**Tasks**:

1. Run full E2E test suite (10 scenarios from spec)
2. Manual testing checklist:
   - Test registration → verification → login flow
   - Test password reset flow
   - Test GitHub OAuth flow
   - Test session persistence (refresh, close browser)
   - Test protected route redirection
   - Test logout
3. Cross-browser testing (Chrome, Firefox, Safari, Edge)
4. Accessibility testing (keyboard navigation, screen reader, WCAG AA)
5. Performance testing (Lighthouse, WebPageTest)
6. Fix any issues found
7. Re-run tests → ALL PASS

---

### Phase 4: Documentation & Polish (TDD: Complete)

**Goal**: Final documentation, README updates, code cleanup

**Tasks**:

1. Update README with authentication setup section:
   - Appwrite configuration steps
   - Environment variables
   - Usage examples (`useAuth` composable)
   - Protecting routes with middleware
2. Add JSDoc comments to all public APIs
3. Create `.env.example` with all required variables
4. Review and update `quickstart.md` with actual implementation details
5. Add screenshots to documentation (login, register, password reset pages)
6. Final code review:
   - Remove console.logs
   - Remove TODOs
   - Verify TypeScript strict mode compliance
   - Verify all tests still pass
7. Run linter and fix issues
8. Verify test coverage >80% for all auth code

---

## Success Criteria Validation

After Phase 4, validate against all success criteria from spec:

### System Completeness (SC-001 to SC-010)

- [ ] SC-001: Registration completes in <2 minutes
- [ ] SC-002: Login completes in <10 seconds
- [ ] SC-003: Password reset completes in <3 minutes
- [ ] SC-004: GitHub OAuth completes in <30 seconds
- [ ] SC-005: Email verification completes in <5 seconds
- [ ] SC-006: 100% of auth flows show user-friendly errors
- [ ] SC-007: Protected routes redirect to login correctly
- [ ] SC-008: Sessions persist across refreshes (14 days)
- [ ] SC-009: Logout completes in <2 seconds
- [ ] SC-010: API routes respond in <500ms (95th percentile)

### User Validation (UV-001 to UV-005)

- [ ] UV-001: 90% of test users register/login without help
- [ ] UV-002: 95% of test users understand error messages
- [ ] UV-003: Test users rate password reset as "easy"
- [ ] UV-004: Test users prefer GitHub OAuth over email/password
- [ ] UV-005: Test users verify email within 5 minutes

### Performance Validation (PV-001 to PV-004)

- [ ] PV-001: Login page loads in <1.5s on 3G
- [ ] PV-002: Registration form submits in <2s
- [ ] PV-003: OAuth callback processes in <3s
- [ ] PV-004: Auth middleware adds <50ms to page loads

---

## Risk Management

### High Risk

1. **Appwrite service downtime**: Add error handling with retry logic; show user-friendly message
2. **GitHub OAuth changes**: Follow official Appwrite GitHub OAuth documentation; add E2E tests to catch breaking changes
3. **SMTP configuration issues**: Test email delivery in development; provide clear setup documentation

### Medium Risk

1. **Session persistence issues**: Test extensively across browsers; use HTTP-only cookies (more reliable than localStorage)
2. **Password validation complexity**: Use Appwrite's built-in password validation; add client-side validation for UX
3. **Rate limiting bypasses**: Rely on Appwrite's rate limiting; add server-side checks for critical endpoints

### Low Risk

1. **Dark mode styling issues**: Use @nuxt/ui components (dark mode built-in); test in both modes
2. **Mobile responsiveness**: Use mobile-first Tailwind approach; test on real devices
3. **Accessibility issues**: Follow semantic HTML; add ARIA labels; test with keyboard and screen reader

---

## Next Steps

After completing this plan:

1. **Phase 0**: Run `/speckit.research` or manually create `research.md` with Appwrite SDK findings
2. **Phase 1**: Create `data-model.md`, `contracts/api-routes.md`, and `quickstart.md`
3. **Phase 2**: Begin TDD implementation with Phase 2.1 (start with failing tests)
4. **Track Progress**: Update todo list and checklist in `tasks.md` (use `/speckit.tasks` command)

**Estimated Timeline**:

- Phase 0: 1-2 days (research + backend setup)
- Phase 1: 1 day (design + contracts)
- Phase 2: 7-10 days (TDD implementation, 7 sub-phases)
- Phase 3: 2-3 days (integration testing)
- Phase 4: 1 day (documentation + polish)

**Total**: 12-17 days for complete feature implementation

---

**Status**: ✅ Plan Complete - Ready for Phase 0 (Research & Setup)
