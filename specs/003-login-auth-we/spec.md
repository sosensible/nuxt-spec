# Feature Specification: Authentication System with Appwrite

**Feature Branch**: `003-login-auth-we`  
**Created**: October 21, 2025  
**Status**: ✅ Ready for Implementation  
**Input**: User description: "login auth - We want to use Appwrite to create a login feature for the site using github with oauth, and using classic email password logins. If something needs to be set up on the back end, prompt me for those steps. This should include login, register, reset password, and trigger oauth registrations and logins."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Email/Password Registration and Login (Priority: P1)

Users need to create accounts and log in using email and password to access protected areas of the site, establishing their identity and persisting their session across visits.

**Why this priority**: Core authentication mechanism that enables all other user-specific features. Email/password is the most common authentication method and serves as a fallback when OAuth providers are unavailable.

**Independent Test**: Can be fully tested by completing registration form, receiving verification email, logging in with credentials, and accessing protected content. Delivers basic account creation and login functionality independently of OAuth.

**Acceptance Scenarios**:

1. **Given** a new user visits the registration page, **When** they submit valid email and password, **Then** their account is created and they receive a verification email
2. **Given** a registered user with verified email, **When** they submit correct credentials on login page, **Then** they are authenticated and redirected to their intended destination
3. **Given** an authenticated user, **When** they refresh the page or return later, **Then** their session persists and they remain logged in
4. **Given** a user with unverified email, **When** they attempt to login, **Then** they see a message prompting them to verify their email first
5. **Given** an authenticated user, **When** they click logout, **Then** their session ends and they are redirected to the home page

---

### User Story 2 - Password Reset Flow (Priority: P2)

Users who forget their password need a secure way to reset it via email verification, ensuring they can regain access to their account without contacting support.

**Why this priority**: Essential for user retention and account recovery. Users frequently forget passwords, and a self-service reset flow reduces support burden and improves user experience.

**Independent Test**: Can be fully tested by requesting password reset, receiving reset email, clicking link, setting new password, and logging in with new credentials. Works independently of registration and OAuth flows.

**Acceptance Scenarios**:

1. **Given** a user on the login page, **When** they click "Forgot Password" and enter their email, **Then** they receive a password reset email with a secure link
2. **Given** a user clicks the reset link in email, **When** they are redirected to reset password page, **Then** they can enter and confirm a new password
3. **Given** a user submits a new password, **When** the password meets requirements, **Then** their password is updated and they can log in with the new password
4. **Given** a user tries to use an expired reset link, **When** they click it, **Then** they see an error message and option to request a new reset link
5. **Given** a user enters a non-existent email for reset, **When** they submit, **Then** they see a generic success message (security: don't reveal which emails exist)

---

### User Story 3 - GitHub OAuth Registration and Login (Priority: P2)

Users want to sign up or log in quickly using their GitHub account, avoiding password management and leveraging existing trusted identity verification.

**Why this priority**: OAuth significantly improves conversion rates for registration and reduces friction. GitHub OAuth is particularly relevant for developer-focused applications and technical audiences.

**Independent Test**: Can be fully tested by clicking "Sign in with GitHub", authorizing the app, being redirected back, and accessing protected content. Works as a standalone registration/login method independently of email/password.

**Acceptance Scenarios**:

1. **Given** a new user on the registration page, **When** they click "Sign up with GitHub" and authorize the app, **Then** their account is created using GitHub profile data and they are logged in
2. **Given** an existing user with GitHub OAuth, **When** they click "Sign in with GitHub" and authorize, **Then** they are authenticated and logged in
3. **Given** a user authorizes GitHub OAuth, **When** the redirect completes, **Then** their session is established and they are redirected to their intended destination
4. **Given** a user's GitHub email matches an existing email/password account, **When** they use GitHub OAuth, **Then** they see a message that an account exists and must log in with password first, then can link GitHub OAuth in account settings
5. **Given** a user denies GitHub authorization, **When** they are redirected back, **Then** they see a message explaining why authorization is needed and can try again

---

### User Story 4 - Email Verification (Priority: P3)

Users who register with email/password must verify their email address to ensure account security and enable password reset functionality, preventing fake accounts and ensuring valid contact information.

**Why this priority**: Important for security and account recovery, but users can still register and begin using the site with limited functionality. Can be implemented after core registration/login works.

**Independent Test**: Can be fully tested by registering, receiving verification email, clicking verification link, and gaining full account access. Works independently as an optional security layer.

**Acceptance Scenarios**:

1. **Given** a user completes registration, **When** they check their email inbox, **Then** they receive a verification email with a secure link
2. **Given** a user clicks the verification link, **When** the link is valid, **Then** their email is marked as verified and they can access all features
3. **Given** a user with unverified email, **When** they attempt actions requiring verification, **Then** they see a prompt to verify their email with option to resend verification email
4. **Given** a user requests a new verification email, **When** they click "Resend", **Then** a new verification email is sent after rate limiting check
5. **Given** a user tries to use an expired verification link, **When** they click it, **Then** they see an error and option to request a new verification email

---

### Edge Cases

- What happens when a user tries to register with an email that already exists? (Show user-friendly error: "An account with this email already exists. Try logging in or resetting your password.")
- How does the system handle concurrent login attempts from different devices? (Allow multiple active sessions per user account)
- What happens if GitHub OAuth fails or times out? (Show error message with option to retry or use email/password instead)
- How does the system handle password reset requests for non-existent emails? (Show generic success message to prevent email enumeration attacks)
- What happens when a user tries to verify their email multiple times with the same link? (First click succeeds, subsequent clicks show "Email already verified")
- How does the system handle expired verification or reset tokens? (Show appropriate error message with option to request new link)
- What happens if Appwrite service is temporarily unavailable? (Show user-friendly error message with retry option, don't expose technical details)
- How does the system handle users who close the browser during OAuth redirect? (OAuth state is lost, user must restart the process)
- What happens when a user changes their GitHub email after linking their account? (User can still log in; GitHub provides consistent user ID regardless of email changes)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Users can register with email and password, providing name, email (unique), and password (min 8 characters)
- **FR-002**: System validates password strength (min 8 chars, includes uppercase, lowercase, number, special character)
- **FR-003**: System sends verification email upon registration with secure token (1-hour expiration)
- **FR-004**: Users can verify email by clicking link in verification email
- **FR-005**: Users can log in with verified email and password
- **FR-006**: System creates persistent session upon successful login (14-day default expiration)
- **FR-007**: Users can log out, which terminates their session
- **FR-008**: Users can request password reset by providing email
- **FR-009**: System sends password reset email with secure token (1-hour expiration)
- **FR-010**: Users can reset password by clicking link and providing new password
- **FR-011**: Password reset tokens are single-use only
- **FR-012**: Users can register/login via GitHub OAuth
- **FR-013**: System retrieves user profile from GitHub (name, email, avatar) on OAuth success
- **FR-014**: System creates new account for GitHub OAuth users; if GitHub email matches existing email/password account, system shows message requiring password login first and account linking in settings
- **FR-015**: Users can resend verification email (rate limited: 1 per 60 seconds)
- **FR-016**: System prevents registration with duplicate emails (case-insensitive)
- **FR-017**: All authentication errors show user-friendly messages without exposing security details
- **FR-018**: System logs authentication events (login, logout, failed attempts) for security monitoring
- **FR-019**: Unverified users can log in but see verification prompt
- **FR-020**: System invalidates all user sessions on password change

### Nuxt-Specific Requirements

- **NFR-001**: Authentication state uses SSR-compatible `useState` composable for shared state across client and server
- **NFR-002**: Protected routes use `definePageMeta` with `middleware: 'auth'` to enforce authentication
- **NFR-003**: Auth middleware (`middleware/auth.ts`) checks session on server-side and redirects unauthenticated users to login
- **NFR-004**: Login and registration forms use Nuxt UI v4 `<UForm>` component with Zod schema validation and `<UFormGroup>` + `<UInput>` for fields
- **NFR-005**: API routes (`server/api/auth/*`) handle authentication operations (register, login, logout, verify, reset)
- **NFR-006**: Appwrite SDK calls are server-side only (via API routes), never exposed to client
- **NFR-007**: OAuth callback handled by `server/api/auth/callback/github.ts` route
- **NFR-008**: Auth composable (`useAuth`) provides reactive user state and methods (`login`, `logout`, `register`, `checkAuth`)

### Key Entities

**User Account**:

- `$id`: string (Appwrite auto-generated)
- `email`: string (unique, lowercase)
- `name`: string
- `emailVerification`: boolean
- `prefs`: object (avatar URL if GitHub OAuth used)
- `registration`: timestamp
- `labels`: string[] (e.g., `['oauth:github']` for OAuth users)

**Authentication Session**:

- `$id`: string (Appwrite session ID)
- `userId`: string (reference to User Account)
- `provider`: string (`email`, `github`)
- `expire`: timestamp
- `current`: boolean

**Verification Token** (managed by Appwrite):

- `secret`: string (secure token)
- `expire`: timestamp
- `userId`: string

## Success Criteria _(mandatory)_

### System Completeness

- **SC-001**: Users can complete registration in under 2 minutes (form submission to email received)
- **SC-002**: Users can complete login in under 10 seconds (from landing on login page to accessing protected content)
- **SC-003**: Password reset flow completes in under 3 minutes (request to successful new password login)
- **SC-004**: GitHub OAuth flow completes in under 30 seconds (button click to authenticated session)
- **SC-005**: Email verification completes in under 5 seconds (link click to confirmation message)
- **SC-006**: 100% of authentication flows return user-friendly error messages (no technical stack traces or error codes shown to users)
- **SC-007**: All protected routes successfully redirect unauthenticated users to login page with return URL preserved
- **SC-008**: User sessions persist correctly across browser refreshes and tab closures for the configured expiration period (14 days default)
- **SC-009**: Logout action completes in under 2 seconds and successfully terminates session
- **SC-010**: All authentication API routes respond in under 500ms for 95th percentile requests

### User Validation

- **UV-001**: 90% of test users can successfully register and log in without assistance
- **UV-002**: 95% of test users understand error messages and know how to resolve issues
- **UV-003**: Test users report password reset process as "easy" or "very easy" (user satisfaction survey)
- **UV-004**: Test users prefer GitHub OAuth over email/password registration when both options are presented
- **UV-005**: Test users successfully complete email verification within 5 minutes of registration

### Performance Validation

- **PV-001**: Login page loads in under 1.5 seconds on 3G connection
- **PV-002**: Registration form submission completes in under 2 seconds
- **PV-003**: OAuth callback processing completes in under 3 seconds
- **PV-004**: Auth middleware check adds less than 50ms to protected page load times

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

- [ ] Test `useAuth` composable: `login()` sets user state on success
- [ ] Test `useAuth` composable: `logout()` clears user state
- [ ] Test `useAuth` composable: `register()` returns success with valid inputs
- [ ] Test `useAuth` composable: `checkAuth()` loads current session on mount
- [ ] Test auth middleware: redirects to login when no session exists
- [ ] Test auth middleware: allows access when valid session exists
- [ ] Test auth middleware: preserves return URL in redirect query param
- [ ] Test password validation: rejects passwords under 8 characters
- [ ] Test password validation: rejects passwords without uppercase/lowercase/number/special char
- [ ] Test password validation: accepts valid passwords
- [ ] Test email validation: rejects invalid email formats and normalizes to lowercase
- [ ] Test session persistence: session state survives page refresh
- [ ] Test logout: clears session state and cookies

**API Contract Tests** (Vitest):

- [ ] Test POST `/api/auth/register`: returns 201 with user object on valid registration
- [ ] Test POST `/api/auth/register`: returns 400 when email already exists or password is invalid
- [ ] Test POST `/api/auth/login`: returns 200 with session on valid credentials
- [ ] Test POST `/api/auth/login`: returns 401 on invalid credentials
- [ ] Test POST `/api/auth/logout`: returns 200 and terminates session
- [ ] Test POST `/api/auth/password-reset`: returns 200 on valid email (even if email doesn't exist for security)
- [ ] Test POST `/api/auth/password-reset/confirm`: returns 200 on successful reset, 400 on expired token
- [ ] Test POST `/api/auth/verify-email`: returns 200 on successful verification, 400 on expired token
- [ ] Test POST `/api/auth/verify-email/resend`: returns 200 and sends new email, 429 when rate limited
- [ ] Test GET `/api/auth/callback/github`: creates session on successful OAuth, returns 400 on error

**E2E Tests** (Playwright):

- [ ] Test complete registration flow: fill form → submit → verify email received → click link → email verified
- [ ] Test complete login flow: navigate to login → enter credentials → submit → redirected to protected page
- [ ] Test complete password reset flow: request reset → check email → click link → enter new password → login with new password
- [ ] Test complete GitHub OAuth flow: click "Sign in with GitHub" → authorize → redirected back → authenticated
- [ ] Test logout flow: click logout → session ends → redirected to home → cannot access protected pages
- [ ] Test protected route access: navigate to protected page without auth → redirected to login → login → redirected back to intended page
- [ ] Test session persistence: login → close browser → reopen → still authenticated
- [ ] Test duplicate email registration: register → logout → try same email → error shown
- [ ] Test unverified email login: register → don't verify → login → see verification prompt
- [ ] Test verification email resend: register → click "Resend verification" → new email received

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

- [ ] Nuxt UI v4 components used exclusively (UForm, UInput, UButton, UCard, UAlert, UFormGroup, UDivider)
- [ ] Custom CSS justified and documented if used (prefer Nuxt UI v4 component props and variants)
- [ ] Responsive design handled by Nuxt UI v4 components (responsive by default)
- [ ] Dark mode support via Nuxt UI v4 color-mode integration (automatic)
- [ ] Mobile-first approach built into Nuxt UI v4 components

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

---

## Appwrite Backend Setup

Before implementing this feature, the following Appwrite configuration must be completed:

### 1. Appwrite Project Setup

- [ ] Appwrite project created with project ID available
- [ ] Appwrite API endpoint accessible (e.g., `https://fra.cloud.appwrite.io/v1`)
- [ ] API key generated with appropriate permissions (users.read, users.write, sessions.write)

### 2. Authentication Configuration

- [ ] Email/Password authentication enabled in Appwrite console (Auth → Settings → Email/Password)
- [ ] Email verification required setting configured (recommend: enabled)
- [ ] Session length configured (recommend: 14 days)
- [ ] Password dictionary check enabled (prevents common passwords)

### 3. OAuth Provider Configuration (GitHub)

- [ ] GitHub OAuth app created at https://github.com/settings/developers
- [ ] GitHub app callback URL configured: `https://[your-domain]/api/auth/callback/github` (dev: `http://localhost:3000/api/auth/callback/github`)
- [ ] GitHub Client ID and Client Secret obtained
- [ ] GitHub OAuth provider enabled in Appwrite console (Auth → Settings → OAuth2 Providers → GitHub)
- [ ] GitHub Client ID and Client Secret added to Appwrite GitHub OAuth configuration

### 4. Email Service Configuration

- [ ] Email service provider configured in Appwrite (Appwrite → Settings → SMTP)
- [ ] Sender email address and name configured
- [ ] Email templates customized (optional):
  - Verification email template
  - Password reset email template
- [ ] Test emails sent successfully to verify SMTP configuration

### 5. Security & Rate Limiting

- [ ] Rate limiting configured for authentication endpoints (recommend: 10 attempts per hour per IP)
- [ ] Password requirements set (min 8 chars, uppercase, lowercase, number, special char)
- [ ] Account lockout policy configured (optional: 5 failed attempts = 15 min lockout)

### 6. Environment Variables

Add the following to your `.env` file:

```bash
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=your-api-key-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Assumptions

1. **Appwrite Infrastructure**: Using Appwrite Cloud or self-hosted instance with version 1.4+ (includes OAuth2 support)
2. **Email Service**: Email delivery is configured and working in Appwrite (SMTP or email provider integration)
3. **HTTPS Required**: Production deployment uses HTTPS (required for OAuth and secure cookies)
4. **Session Storage**: Using HTTP-only cookies for session tokens (more secure than localStorage)
5. **User Data**: GitHub OAuth provides user's public email; private emails will be handled by prompting user
6. **Account Linking**: Manual confirmation required for linking OAuth to existing email/password account (security over convenience)
7. **Email Uniqueness**: Email addresses are unique across all users (case-insensitive)
8. **Verification Tokens**: Appwrite manages token generation, expiration, and validation
9. **Rate Limiting**: Appwrite handles rate limiting for authentication endpoints
10. **Error Messages**: Appwrite error codes are mapped to user-friendly messages in API routes
11. **Browser Support**: Modern browsers with cookie support (no IE11)
12. **JavaScript Enabled**: Authentication features require JavaScript (SSR pages but client-side interactions)
13. **Mobile Responsive**: All authentication pages work on mobile devices (375px minimum width)
14. **Dark Mode**: Authentication pages support dark mode via Tailwind dark: variants

---

## Open Questions

### Account Linking Strategy ✅ Resolved

**Question**: When a user signs in with GitHub OAuth and their GitHub email matches an existing email/password account, what should happen?

**Context**: This scenario occurs when:

1. User registers with email/password (`user@example.com`)
2. Later, user clicks "Sign in with GitHub" with same email

**Decision**: **Option B: Manual Confirmation**

**Rationale**: Security takes priority over convenience. Users must:

1. Log in with their existing password first
2. Navigate to account settings
3. Explicitly link their GitHub OAuth account

This prevents unauthorized account access if someone gains control of a user's GitHub account or email address.

**Implementation Notes**:

- When GitHub OAuth detects matching email, show message: "An account already exists with this email. Please log in with your password, then you can link your GitHub account in settings."
- Add "Link GitHub Account" option in user account settings page
- Linking requires current password confirmation for additional security
- Once linked, user can log in with either method (email/password OR GitHub OAuth)
