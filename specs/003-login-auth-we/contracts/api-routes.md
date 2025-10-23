# API Route Contracts

**Feature**: `003-login-auth-we`  
**Created**: October 21, 2025  
**Status**: Phase 1 - Design & Contracts

## Overview

This document defines the API endpoint contracts for the authentication system. All routes are server-side only (`server/api/auth/*`) and interact with Appwrite SDK.

---

## General Patterns

### Success Response

```typescript
{
  status: number,        // HTTP status code
  data: T                // Response data (type varies by endpoint)
}
```

### Error Response

```typescript
{
  error: string,         // Error type/code
  message: string        // User-friendly error message
}
```

### HTTP Status Codes

- `200 OK`: Success
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or validation error
- `401 Unauthorized`: Authentication required or invalid credentials
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

## Authentication Endpoints

### 1. POST `/api/auth/register`

Register a new user with email and password.

**Request Body**:

```typescript
{
  name: string,          // User's display name (min 1 char)
  email: string,         // Valid email address
  password: string       // Password (min 8 chars, complexity rules)
}
```

**Response** (201 Created):

```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    emailVerified: boolean,  // Always false on registration
    avatar?: string,
    provider: 'email',
    createdAt: Date
  }
}
```

**Errors**:

- `400`: Invalid email format, weak password, or missing fields
- `409`: Email already exists
- `500`: Server error (Appwrite unavailable)

**Appwrite Calls**:

```typescript
await account.create("unique()", email, password, name);
await account.createEmailPasswordSession(email, password);
await account.createVerification(`${baseUrl}/verify-email`);
```

**Side Effects**:

- Creates user account in Appwrite
- Creates session and sets HTTP-only cookie
- Sends verification email
- User can log in immediately (but sees verification prompt)

---

### 2. POST `/api/auth/login`

Log in with email and password.

**Request Body**:

```typescript
{
  email: string,         // User's email
  password: string       // User's password
}
```

**Response** (200 OK):

```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    emailVerified: boolean,
    avatar?: string,
    provider: 'email' | 'github',
    createdAt: Date
  },
  session: {
    id: string,
    userId: string,
    provider: 'email',
    expiresAt: Date,
    current: boolean,
    createdAt: Date
  }
}
```

**Errors**:

- `400`: Missing email or password
- `401`: Invalid credentials (generic message: "Invalid email or password")
- `429`: Too many login attempts (rate limited)
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.createEmailPasswordSession(email, password);
await account.get(); // Get user details
```

**Side Effects**:

- Creates new session in Appwrite
- Sets HTTP-only cookie with session token
- Updates last login timestamp

---

### 3. POST `/api/auth/logout`

Log out current user.

**Request Body**: None (uses session cookie)

**Response** (200 OK):

```typescript
{
  success: boolean; // Always true
}
```

**Errors**:

- `401`: No active session
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.deleteSession("current");
```

**Side Effects**:

- Deletes current session in Appwrite
- Clears HTTP-only session cookie
- User must log in again to access protected routes

---

### 4. GET `/api/auth/session`

Get current user session (used by auth middleware and composable).

**Request Body**: None (uses session cookie)

**Response** (200 OK):

```typescript
{
  user: {
    id: string,
    email: string,
    name: string,
    emailVerified: boolean,
    avatar?: string,
    provider: 'email' | 'github',
    createdAt: Date
  } | null
}
```

**Errors**:

- `401`: No active session (returns `{ user: null }`)
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.get();
```

**Side Effects**: None (read-only)

---

### 5. POST `/api/auth/password-reset`

Request password reset email.

**Request Body**:

```typescript
{
  email: string; // User's email
}
```

**Response** (200 OK):

```typescript
{
  success: boolean,     // Always true (even if email doesn't exist)
  message: string       // Generic message: "If an account exists, you'll receive a reset email"
}
```

**Errors**:

- `400`: Invalid email format
- `429`: Too many requests (rate limited: 5 per hour)
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.createRecovery(email, `${baseUrl}/reset-password`);
```

**Side Effects**:

- If email exists, sends password reset email with token
- If email doesn't exist, no email sent but returns success (security)
- Rate limited to prevent email enumeration attacks

---

### 6. POST `/api/auth/password-reset/confirm`

Confirm password reset with token.

**Request Body**:

```typescript
{
  userId: string,        // From reset link query param
  secret: string,        // From reset link query param
  password: string,      // New password (min 8 chars, complexity)
  passwordConfirm: string // Must match password
}
```

**Response** (200 OK):

```typescript
{
  success: boolean,      // true
  message: string        // "Password reset successfully"
}
```

**Errors**:

- `400`: Invalid token, expired token, passwords don't match, or weak password
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.updateRecovery(userId, secret, password, passwordConfirm);
```

**Side Effects**:

- Updates user password in Appwrite
- Invalidates all existing sessions for security
- Consumes reset token (single-use)
- User must log in with new password

---

### 7. POST `/api/auth/verify-email`

Verify email with token from email link.

**Request Body**:

```typescript
{
  userId: string,        // From verification link query param
  secret: string         // From verification link query param
}
```

**Response** (200 OK):

```typescript
{
  success: boolean,      // true
  message: string        // "Email verified successfully"
}
```

**Errors**:

- `400`: Invalid token or expired token
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.updateVerification(userId, secret);
```

**Side Effects**:

- Sets `emailVerification: true` in Appwrite
- Consumes verification token (single-use)
- User gains full account access

---

### 8. POST `/api/auth/verify-email/resend`

Resend verification email.

**Request Body**: None (uses session cookie to identify user)

**Response** (200 OK):

```typescript
{
  success: boolean,      // true
  message: string        // "Verification email sent"
}
```

**Errors**:

- `400`: Email already verified
- `401`: No active session
- `429`: Too many requests (rate limited: 1 per 60 seconds)
- `500`: Server error

**Appwrite Calls**:

```typescript
const user = await account.get();
if (user.emailVerification) throw error;
await account.createVerification(`${baseUrl}/verify-email`);
```

**Side Effects**:

- Sends new verification email with new token
- Previous tokens remain valid until expiration
- Rate limited to prevent abuse

---

### 9. GET `/api/auth/oauth/github`

Initiate GitHub OAuth flow.

**Request Query Params**:

```typescript
{
  redirect?: string      // Optional return URL after auth
}
```

**Response** (302 Redirect):

- Redirects to GitHub authorization page
- Appwrite handles OAuth state management

**Errors**:

- `500`: Server error (Appwrite OAuth unavailable)

**Appwrite Calls**:

```typescript
await account.createOAuth2Session(
  "github",
  `${baseUrl}/api/auth/callback/github?redirect=${redirect}`,
  `${baseUrl}/login?error=oauth_failed`
);
```

**Side Effects**:

- Redirects user to GitHub for authorization
- OAuth state stored by Appwrite (CSRF protection)

---

### 10. GET `/api/auth/callback/github`

Handle GitHub OAuth callback.

**Request Query Params**:

```typescript
{
  userId: string,        // From Appwrite OAuth
  secret: string,        // From Appwrite OAuth
  redirect?: string      // Optional return URL
}
```

**Response** (302 Redirect):

- On success: Redirects to `redirect` URL or `/` with session cookie
- On error: Redirects to `/login?error=oauth_failed`

**Errors**:

- `400`: Missing userId or secret, invalid OAuth state
- `409`: GitHub email matches existing email/password account (show linking message)
- `500`: Server error

**Appwrite Calls**:

```typescript
await account.createSession(userId, secret); // Complete OAuth
await account.get(); // Get user details
await users.list([Query.equal("email", [githubEmail])]); // Check for existing account
```

**Side Effects**:

- Creates session and sets HTTP-only cookie
- If new user, creates account with GitHub profile data
- If existing GitHub user, logs them in
- If email matches existing email/password account, shows error and requires manual linking
- Stores GitHub avatar in `prefs.avatar`
- Adds `'oauth:github'` label to user

---

## Middleware Usage

### Auth Middleware (`middleware/auth.ts`)

**Route**: Applied via `definePageMeta({ middleware: 'auth' })`

**Behavior**:

1. Calls `GET /api/auth/session` on server-side
2. If no session: redirects to `/login?redirect=/protected-page`
3. If session exists: allows access and hydrates `useState('user')`

**Example**:

```typescript
// pages/admin.vue
definePageMeta({
  middleware: "auth",
});
```

---

## Error Handling

### Error Mapping

Appwrite errors are mapped to user-friendly messages:

```typescript
function mapAppwriteError(error: AppwriteException): ErrorResponse {
  switch (error.code) {
    case 409: // Conflict
      return {
        error: "CONFLICT",
        message: "An account with this email already exists",
      };
    case 401: // Unauthorized
      return { error: "UNAUTHORIZED", message: "Invalid email or password" };
    case 429: // Too Many Requests
      return {
        error: "RATE_LIMIT",
        message: "Too many requests. Please try again later",
      };
    case 400: // Bad Request
      if (error.message.includes("password"))
        return {
          error: "WEAK_PASSWORD",
          message:
            "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
        };
      return {
        error: "INVALID_INPUT",
        message: "Invalid input. Please check your details",
      };
    default:
      return {
        error: "SERVER_ERROR",
        message: "Something went wrong. Please try again",
      };
  }
}
```

### Logging

- All authentication events logged on server-side (not exposed to client)
- Log failed login attempts for security monitoring
- Never log passwords or tokens

---

## Testing Strategy

### Unit Tests (API Routes)

- Mock Appwrite SDK responses
- Test success cases with valid inputs
- Test error cases (invalid inputs, Appwrite errors)
- Test rate limiting behavior

### Integration Tests

- Test with real Appwrite test project
- Verify session cookies are set correctly
- Test OAuth flow end-to-end

### E2E Tests (Playwright)

- Test complete user journeys (register → verify → login)
- Test password reset flow
- Test GitHub OAuth (with test account)

---

## Security Checklist

- [ ] All routes use server-side Appwrite SDK (never client-side)
- [ ] Session tokens stored in HTTP-only cookies (not localStorage)
- [ ] Password reset shows generic message (don't reveal if email exists)
- [ ] Rate limiting enforced on sensitive endpoints
- [ ] OAuth state parameter prevents CSRF (handled by Appwrite)
- [ ] All errors return user-friendly messages (no stack traces)
- [ ] Passwords validated with Zod before sending to Appwrite
- [ ] Email addresses normalized to lowercase before comparison

---

## Environment Variables Required

```bash
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## Appendix: Shared Validation Schemas (Zod)

```typescript
// schemas/auth.ts
import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase();

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z
  .object({
    userId: z.string(),
    secret: z.string(),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export const emailVerificationSchema = z.object({
  userId: z.string(),
  secret: z.string(),
});
```
