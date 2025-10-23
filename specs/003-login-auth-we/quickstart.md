# Quickstart Guide: Authentication System

**Feature**: `003-login-auth-we`  
**Created**: October 21, 2025  
**Status**: Phase 1 - Design & Contracts

## Overview

This guide walks you through setting up and using the authentication system in your Nuxt application.

---

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Appwrite Cloud account (or self-hosted Appwrite 1.4+)
- GitHub OAuth app (optional, for OAuth login)

---

## 1. Backend Setup

### Appwrite Configuration

✅ **Already Completed** (verified by connection test):

1. Appwrite project created (ID: `66b38cfd003b4ba07a2e`)
2. API key with scopes: `users.read`, `users.write`, `sessions.write`
3. Email/Password authentication enabled
4. GitHub OAuth provider configured
5. Environment variables set in `.env`

---

## Environment variables (example)

The authentication feature requires a few environment variables. A scoped example is included at `specs/003-login-auth-we/.env.example`.

Copy the example into a local `.env` file and fill in your project-specific values. On Windows PowerShell (pwsh) you can run:

```powershell
# Copy the example into .env in the same folder as your repo root
Copy-Item -Path .\specs\003-login-auth-we\.env.example -Destination .\.env -Force

# Alternatively, open and edit the file in-place
code .\specs\003-login-auth-we\.env.example
```

Then open `.env` and replace the placeholder values:

- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`
- `APPWRITE_ENDPOINT`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- (Optional) `NUXT_PUBLIC_APP_URL`

Important: Do NOT commit your `.env` file to version control. Add `.env` to `.gitignore` if it's not already ignored.

If you prefer to keep an env file scoped to the spec, you can copy the example into the spec folder and use it directly by running Nuxt with the `--dotenv` flag or your environment loader of choice.

## 2. Installation

### Install Dependencies

```bash
pnpm add node-appwrite zod
```

**Packages**:

- `node-appwrite`: Appwrite SDK for server-side operations
- `zod`: Schema validation for forms and API requests

---

## 3. Project Structure

```
app/
├── composables/
│   └── useAuth.ts                    # Authentication composable
├── middleware/
│   └── auth.ts                       # Auth middleware for protected routes
├── pages/
│   ├── login.vue                     # Login page
│   ├── register.vue                  # Registration page
│   ├── verify-email.vue              # Email verification page
│   ├── reset-password.vue            # Password reset page
│   └── profile.vue                   # Protected profile page (example)
└── server/
    ├── api/
    │   └── auth/
    │       ├── register.post.ts       # POST /api/auth/register
    │       ├── login.post.ts          # POST /api/auth/login
    │       ├── logout.post.ts         # POST /api/auth/logout
    │       ├── session.get.ts         # GET /api/auth/session
    │       ├── password-reset.post.ts # POST /api/auth/password-reset
    │       ├── password-reset/
    │       │   └── confirm.post.ts    # POST /api/auth/password-reset/confirm
    │       ├── verify-email.post.ts   # POST /api/auth/verify-email
    │       ├── verify-email/
    │       │   └── resend.post.ts     # POST /api/auth/verify-email/resend
    │       ├── oauth/
    │       │   └── github.get.ts      # GET /api/auth/oauth/github
    │       └── callback/
    │           └── github.get.ts      # GET /api/auth/callback/github
    └── utils/
        ├── appwrite.ts                # Appwrite client initialization
        └── auth.ts                    # Auth helper functions

types/
└── auth.ts                            # TypeScript interfaces

schemas/
└── auth.ts                            # Zod validation schemas
```

---

## 4. Core Implementation

### A. Appwrite Client Setup

**File**: `server/utils/appwrite.ts`

```typescript
import { Client, Account, Users } from "node-appwrite";

export function createAppwriteClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);

  return client;
}

export function createAccountService() {
  return new Account(createAppwriteClient());
}

export function createUsersService() {
  return new Users(createAppwriteClient());
}
```

### B. Authentication Composable

**File**: `app/composables/useAuth.ts`

```typescript
import type { User } from "~/types/auth";

export const useAuth = () => {
  const user = useState<User | null>("user", () => null);
  const loading = useState<boolean>("auth-loading", () => false);

  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      user.value = response.user;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.data?.message || "Login failed" };
    } finally {
      loading.value = false;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      user.value = response.user;
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.message || "Registration failed",
      };
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    try {
      await $fetch("/api/auth/logout", { method: "POST" });
      user.value = null;
      navigateTo("/login");
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.data?.message || "Logout failed" };
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/session");
      user.value = response.user;
    } catch (error) {
      user.value = null;
    } finally {
      loading.value = false;
    }
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    login,
    register,
    logout,
    checkAuth,
  };
};
```

### C. Auth Middleware

**File**: `app/middleware/auth.ts`

```typescript
export default defineNuxtRouteMiddleware(async (to) => {
  // Check if user is authenticated on server-side
  const { user, checkAuth } = useAuth();

  if (!user.value) {
    await checkAuth();
  }

  if (!user.value) {
    // User not authenticated, redirect to login
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
```

---

## 5. Usage Examples

### Example 1: Login Page

**File**: `app/pages/login.vue`

```vue
<script setup lang="ts">
import { z } from "zod";
import { loginSchema } from "~/schemas/auth";

type LoginForm = z.infer<typeof loginSchema>;

const { login } = useAuth();
const route = useRoute();
const error = ref<string>();

const state = reactive<LoginForm>({
  email: "",
  password: "",
});

async function onSubmit() {
  error.value = undefined;
  const result = await login(state.email, state.password);

  if (result.success) {
    const redirect = (route.query.redirect as string) || "/";
    navigateTo(redirect);
  } else {
    error.value = result.error;
  }
}
</script>

<template>
  <UCard>
    <template #header>
      <h2>Login</h2>
    </template>

    <UForm :state="state" :schema="loginSchema" @submit="onSubmit">
      <UAlert v-if="error" color="red" :title="error" />

      <UFormGroup label="Email" name="email">
        <UInput v-model="state.email" type="email" />
      </UFormGroup>

      <UFormGroup label="Password" name="password">
        <UInput v-model="state.password" type="password" />
      </UFormGroup>

      <UButton type="submit" block> Login </UButton>

      <UDivider label="or" />

      <UButton
        icon="i-simple-icons-github"
        color="gray"
        block
        @click="navigateTo('/api/auth/oauth/github')"
      >
        Sign in with GitHub
      </UButton>
    </UForm>

    <template #footer>
      <p>
        Don't have an account?
        <NuxtLink to="/register">Register</NuxtLink>
      </p>
      <p>
        <NuxtLink to="/reset-password">Forgot password?</NuxtLink>
      </p>
    </template>
  </UCard>
</template>
```

### Example 2: Protected Page

**File**: `app/pages/profile.vue`

```vue
<script setup lang="ts">
// Protect this page with auth middleware
definePageMeta({
  middleware: "auth",
});

const { user, logout } = useAuth();
</script>

<template>
  <div>
    <h1>Profile</h1>
    <p>Welcome, {{ user?.name }}!</p>
    <p>Email: {{ user?.email }}</p>
    <p v-if="!user?.emailVerified" class="warning">
      Please verify your email address.
    </p>
    <UButton @click="logout">Logout</UButton>
  </div>
</template>
```

### Example 3: API Route (Register)

**File**: `server/api/auth/register.post.ts`

```typescript
import { registerSchema } from "~/schemas/auth";
import { createAccountService } from "~/server/utils/appwrite";
import { mapAppwriteUser } from "~/types/auth";

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const body = await readBody(event);
    const { name, email, password } = registerSchema.parse(body);

    // Create account in Appwrite
    const account = createAccountService();
    const appwriteUser = await account.create(
      "unique()",
      email,
      password,
      name
    );

    // Create session (auto-login)
    await account.createEmailPasswordSession(email, password);

    // Send verification email
    const baseUrl = getRequestURL(event).origin;
    await account.createVerification(`${baseUrl}/verify-email`);

    // Map to application user format
    const user = mapAppwriteUser(appwriteUser);

    return { user };
  } catch (error: any) {
    if (error.code === 409) {
      throw createError({
        statusCode: 409,
        message: "An account with this email already exists",
      });
    }
    throw createError({
      statusCode: 500,
      message: "Registration failed",
    });
  }
});
```

---

## 6. Testing

### Run Tests

```bash
# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

### Test User Credentials (for development)

After registering a test user, you can use these credentials for testing:

```
Email: test@example.com
Password: Test1234!
```

---

## 7. Common Tasks

### Check Current User

```typescript
const { user, checkAuth } = useAuth();

onMounted(async () => {
  await checkAuth();
  if (user.value) {
    console.log("User is logged in:", user.value.name);
  }
});
```

### Protect Multiple Routes

```typescript
// Use middleware in layout
// layouts/admin.vue
definePageMeta({
  middleware: "auth",
});
```

### Handle Unverified Email

```vue
<script setup>
const { user } = useAuth();

async function resendVerification() {
  await $fetch("/api/auth/verify-email/resend", { method: "POST" });
  alert("Verification email sent!");
}
</script>

<template>
  <UAlert v-if="!user?.emailVerified" color="yellow">
    Please verify your email address.
    <UButton size="sm" @click="resendVerification">
      Resend verification email
    </UButton>
  </UAlert>
</template>
```

### Password Reset Flow

```typescript
// Request reset
await $fetch("/api/auth/password-reset", {
  method: "POST",
  body: { email: "user@example.com" },
});

// Confirm reset (from email link with userId and secret)
await $fetch("/api/auth/password-reset/confirm", {
  method: "POST",
  body: {
    userId: "user-id-from-link",
    secret: "secret-from-link",
    password: "NewPassword123!",
    passwordConfirm: "NewPassword123!",
  },
});
```

---

## 8. Troubleshooting

### "Session not found" Error

**Cause**: Session cookie not set or expired.

**Solution**:

1. Check that API routes return session cookies
2. Verify cookie settings allow HTTP-only cookies
3. Check session expiration (14 days default)

### GitHub OAuth Fails

**Cause**: Incorrect callback URL or client credentials.

**Solution**:

1. Verify callback URL in GitHub app: `http://localhost:3000/api/auth/callback/github`
2. Check `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`
3. Ensure GitHub app is not suspended

### Verification Email Not Received

**Cause**: SMTP not configured or email in spam.

**Solution**:

1. Check Appwrite SMTP settings
2. Use Appwrite's default email service for testing
3. Check spam folder
4. Use resend verification endpoint

### Rate Limiting Issues

**Cause**: Too many requests to same endpoint.

**Solution**:

1. Wait 60 seconds before retrying (verification emails)
2. Check Appwrite console for rate limit settings
3. Implement client-side rate limit indicators

---

## 9. Production Checklist

Before deploying to production:

- [ ] Update GitHub OAuth callback URL to production domain
- [ ] Configure custom SMTP for reliable email delivery
- [ ] Set `APPWRITE_ENDPOINT` to production Appwrite URL
- [ ] Use strong `APPWRITE_API_KEY` with minimal required scopes
- [ ] Enable HTTPS (required for OAuth and secure cookies)
- [ ] Test password reset flow end-to-end
- [ ] Test email verification flow end-to-end
- [ ] Test GitHub OAuth flow end-to-end
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure rate limiting for production traffic
- [ ] Test session persistence across browser restarts
- [ ] Verify logout clears all sessions
- [ ] Test account linking prevention (duplicate emails)

---

## 10. Next Steps

After completing Phase 1 (Design & Contracts):

1. **Phase 2: TDD Implementation** (7 sub-phases)

   - Write failing tests first (RED)
   - Implement to pass tests (GREEN)
   - Refactor while maintaining passing tests

2. **Phase 3: Integration & E2E Testing**

   - End-to-end user journey tests
   - Cross-browser compatibility
   - Performance testing

3. **Phase 4: Documentation & Polish**
   - JSDoc comments for all functions
   - README updates
   - Example usage documentation

---

## Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Nuxt UI Documentation](https://ui.nuxt.com)
- [Zod Documentation](https://zod.dev)
- [Spec Document](./spec.md)
- [Implementation Plan](./plan.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api-routes.md)
