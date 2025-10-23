# Research: Appwrite Authentication & Nuxt UI v4 Integration

**Date**: October 21, 2025  
**Feature**: Authentication System with Appwrite  
**Phase**: Phase 0 - Research & Setup

---

## Executive Summary

This research document covers the integration of Appwrite authentication services with a Nuxt 4 application using Nuxt UI v4 components. Key findings:

1. **Appwrite Node.js SDK** provides server-side authentication methods (must be used in API routes only)
2. **Nuxt UI v4 UForm** provides built-in form validation with Zod schemas
3. **Session management** uses HTTP-only cookies (more secure than localStorage)
4. **OAuth flow** requires server-side callback handling with Appwrite SDK

---

## 1. Appwrite SDK Integration

### 1.1 Installation

```bash
npm install node-appwrite
```

### 1.2 Server-Side SDK Initialization

**File**: `server/utils/appwrite.ts`

```typescript
import { Client, Account, Users } from "node-appwrite";

// Initialize Appwrite Client (server-side only)
export function createAppwriteClient() {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT || "")
    .setProject(process.env.APPWRITE_PROJECT_ID || "")
    .setKey(process.env.APPWRITE_API_KEY || "");

  return client;
}

// Create Account service for authentication
export function createAccountService() {
  const client = createAppwriteClient();
  return new Account(client);
}

// Create Users service for user management
export function createUsersService() {
  const client = createAppwriteClient();
  return new Users(client);
}
```

**Key Points**:

- ✅ Use `node-appwrite` package (server-side)
- ✅ Never expose API keys to client
- ✅ Create separate services for Account and Users
- ✅ Environment variables for configuration

### 1.3 Authentication Methods

#### Registration (Email/Password)

```typescript
// server/api/auth/register.post.ts
import { createUsersService } from "~/server/utils/appwrite";
import { ID } from "node-appwrite";

export default defineEventHandler(async (event) => {
  const { email, password, name } = await readBody(event);

  try {
    const users = createUsersService();

    // Create user account
    const user = await users.create(
      ID.unique(), // Auto-generate user ID
      email,
      undefined, // phone (optional)
      password,
      name
    );

    // Send verification email
    await users.createVerification(
      user.$id,
      "http://localhost:3000/verify-email"
    );

    return { user };
  } catch (error) {
    // Map Appwrite errors to user-friendly messages
    throw createError({
      statusCode: 400,
      message: mapAppwriteError(error),
    });
  }
});
```

#### Login (Email/Password)

```typescript
// server/api/auth/login.post.ts
import { createAccountService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);

  try {
    const account = createAccountService();

    // Create session
    const session = await account.createEmailPasswordSession(email, password);

    // Set HTTP-only cookie with session token
    setCookie(event, "session", session.$id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14, // 14 days
    });

    // Get user details
    const user = await account.get();

    return { user, session };
  } catch (error) {
    throw createError({
      statusCode: 401,
      message: "Invalid email or password",
    });
  }
});
```

#### Logout

```typescript
// server/api/auth/logout.post.ts
import { createAccountService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, "session");

  if (!sessionId) {
    throw createError({ statusCode: 401, message: "Not authenticated" });
  }

  try {
    const account = createAccountService();
    await account.deleteSession(sessionId);

    // Clear cookie
    deleteCookie(event, "session");

    return { success: true };
  } catch (error) {
    // Session might already be expired
    deleteCookie(event, "session");
    return { success: true };
  }
});
```

#### Get Current Session

```typescript
// server/api/auth/session.get.ts
import { createAccountService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const sessionId = getCookie(event, "session");

  if (!sessionId) {
    throw createError({ statusCode: 401, message: "Not authenticated" });
  }

  try {
    const account = createAccountService();
    const user = await account.get();

    return { user };
  } catch (error) {
    // Session expired or invalid
    deleteCookie(event, "session");
    throw createError({ statusCode: 401, message: "Session expired" });
  }
});
```

### 1.4 Error Handling

**Appwrite Error Mapping**:

```typescript
// server/utils/appwrite.ts (continued)

export function mapAppwriteError(error: any): string {
  const errorCode = error?.code || 0;
  const errorType = error?.type || "";

  // Common Appwrite error codes
  const errorMap: Record<number, string> = {
    409: "An account with this email already exists. Try logging in or resetting your password.",
    401: "Invalid email or password.",
    429: "Too many requests. Please try again later.",
    400: "Invalid input. Please check your information and try again.",
    500: "Server error. Please try again later.",
  };

  // Type-specific errors
  if (errorType === "user_invalid_credentials") {
    return "Invalid email or password.";
  }
  if (errorType === "user_already_exists") {
    return "An account with this email already exists.";
  }
  if (errorType === "user_password_mismatch") {
    return "Password is incorrect.";
  }

  return errorMap[errorCode] || "An error occurred. Please try again.";
}
```

### 1.5 Password Reset Flow

#### Request Reset

```typescript
// server/api/auth/password-reset.post.ts
import { createAccountService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const { email } = await readBody(event);

  try {
    const account = createAccountService();

    // Send password recovery email
    await account.createRecovery(
      email,
      "http://localhost:3000/password-reset/confirm"
    );

    // Always return success (don't reveal if email exists)
    return {
      success: true,
      message: "If an account exists, a reset email has been sent.",
    };
  } catch (error) {
    // Still return success for security
    return {
      success: true,
      message: "If an account exists, a reset email has been sent.",
    };
  }
});
```

#### Confirm Reset

```typescript
// server/api/auth/password-reset/confirm.post.ts
import { createAccountService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const { userId, secret, password } = await readBody(event);

  try {
    const account = createAccountService();

    // Update password with recovery secret
    await account.updateRecovery(userId, secret, password);

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: "Invalid or expired reset link.",
    });
  }
});
```

### 1.6 Email Verification

#### Verify Email

```typescript
// server/api/auth/verify-email.post.ts
import { createAccountService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const { userId, secret } = await readBody(event);

  try {
    const account = createAccountService();

    // Verify email with verification secret
    await account.updateVerification(userId, secret);

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: "Invalid or expired verification link.",
    });
  }
});
```

#### Resend Verification

```typescript
// server/api/auth/verify-email/resend.post.ts
import { createUsersService } from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const { userId } = await readBody(event);

  try {
    const users = createUsersService();

    // Resend verification email
    await users.createVerification(
      userId,
      "http://localhost:3000/verify-email"
    );

    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 429,
      message: "Please wait before requesting another verification email.",
    });
  }
});
```

### 1.7 GitHub OAuth Flow

#### Initiate OAuth

```typescript
// Client-side: pages/login.vue
<template>
  <UButton @click="initiateGitHubOAuth">
    Sign in with GitHub
  </UButton>
</template>

<script setup lang="ts">
const initiateGitHubOAuth = () => {
  // Redirect to Appwrite OAuth endpoint (handled by Appwrite)
  const endpoint = 'https://fra.cloud.appwrite.io/v1'
  const projectId = 'your-project-id'
  const successUrl = 'http://localhost:3000/api/auth/callback/github'
  const failureUrl = 'http://localhost:3000/login?error=oauth'

  window.location.href = `${endpoint}/account/sessions/oauth2/github?project=${projectId}&success=${encodeURIComponent(successUrl)}&failure=${encodeURIComponent(failureUrl)}`
}
</script>
```

#### Handle OAuth Callback

```typescript
// server/api/auth/callback/github.get.ts
import {
  createAccountService,
  createUsersService,
} from "~/server/utils/appwrite";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const userId = query.userId as string;
  const secret = query.secret as string;

  if (!userId || !secret) {
    throw createError({
      statusCode: 400,
      message: "Invalid OAuth callback",
    });
  }

  try {
    const account = createAccountService();

    // Create session with OAuth
    const session = await account.createSession(userId, secret);

    // Set HTTP-only cookie
    setCookie(event, "session", session.$id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 14,
    });

    // Get user details
    const user = await account.get();

    // Check if email matches existing account (account linking logic)
    const users = createUsersService();
    const existingUsers = await users.list([`email=${user.email}`]);

    if (existingUsers.total > 1) {
      // Account with same email exists
      // Delete OAuth session and show linking message
      await account.deleteSession(session.$id);
      deleteCookie(event, "session");

      return sendRedirect(event, "/login?error=account-linking");
    }

    // Successful OAuth login
    return sendRedirect(event, "/");
  } catch (error) {
    throw createError({
      statusCode: 400,
      message: "OAuth authentication failed",
    });
  }
});
```

---

## 2. Nuxt UI v4 Form Integration

### 2.1 Installation

Nuxt UI v4 is already installed in the project (`@nuxt/ui v4`).

### 2.2 Form Components

#### Basic Form Structure

```vue
<!-- pages/login.vue -->
<template>
  <UCard>
    <template #header>
      <h1 class="text-2xl font-bold">Login</h1>
    </template>

    <UForm :schema="loginSchema" :state="state" @submit="onSubmit">
      <UFormGroup label="Email" name="email" required>
        <UInput
          v-model="state.email"
          type="email"
          placeholder="you@example.com"
          autocomplete="email"
        />
      </UFormGroup>

      <UFormGroup label="Password" name="password" required>
        <UInput
          v-model="state.password"
          type="password"
          placeholder="••••••••"
          autocomplete="current-password"
        />
      </UFormGroup>

      <UButton type="submit" :loading="loading" block> Sign In </UButton>
    </UForm>

    <UDivider label="or" />

    <UButton
      icon="i-simple-icons-github"
      variant="outline"
      block
      @click="signInWithGitHub"
    >
      Continue with GitHub
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { z } from "zod";

// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const state = reactive({
  email: "",
  password: "",
});

const loading = ref(false);

const onSubmit = async () => {
  loading.value = true;
  try {
    const { login } = useAuth();
    await login(state.email, state.password);
    navigateTo("/");
  } catch (error) {
    // Error handling with UAlert
  } finally {
    loading.value = false;
  }
};

const signInWithGitHub = () => {
  // Initiate OAuth flow
};
</script>
```

### 2.3 Form Validation with Zod

**Shared Schemas** (`types/auth-schemas.ts`):

```typescript
import { z } from "zod";

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

// Registration schema
export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Password reset schema
export const passwordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Password reset confirm schema
export const passwordResetConfirmSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
```

### 2.4 Error Display with UAlert

```vue
<template>
  <UCard>
    <!-- Show error alert if error exists -->
    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      :title="error"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid' }"
      @close="error = null"
    />

    <!-- Show success alert if success message exists -->
    <UAlert
      v-if="success"
      color="green"
      variant="soft"
      :title="success"
      :close-button="{ icon: 'i-heroicons-x-mark-20-solid' }"
      @close="success = null"
    />

    <!-- Form here -->
  </UCard>
</template>

<script setup lang="ts">
const error = ref<string | null>(null);
const success = ref<string | null>(null);

const onSubmit = async () => {
  try {
    // Submit logic
    success.value = "Success!";
  } catch (err: any) {
    error.value = err.message || "An error occurred";
  }
};
</script>
```

### 2.5 Loading States

Nuxt UI v4 `UButton` has built-in loading state:

```vue
<UButton type="submit" :loading="loading" :disabled="loading" block>
  {{ loading ? 'Signing in...' : 'Sign In' }}
</UButton>
```

### 2.6 Dark Mode Support

Nuxt UI v4 automatically supports dark mode via `@nuxtjs/color-mode`. No additional configuration needed - components adapt automatically.

---

## 3. Authentication Composable (useAuth)

**File**: `composables/useAuth.ts`

```typescript
import type { User } from "~/types/auth";

export const useAuth = () => {
  // SSR-compatible state
  const user = useState<User | null>("auth-user", () => null);
  const loading = useState<boolean>("auth-loading", () => false);

  // Check if user is authenticated
  const isAuthenticated = computed(() => !!user.value);

  // Login method
  const login = async (email: string, password: string) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // Register method
  const register = async (name: string, email: string, password: string) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/auth/register", {
        method: "POST",
        body: { name, email, password },
      });
      user.value = response.user;
      return response;
    } finally {
      loading.value = false;
    }
  };

  // Logout method
  const logout = async () => {
    loading.value = true;
    try {
      await $fetch("/api/auth/logout", {
        method: "POST",
      });
      user.value = null;
      navigateTo("/login");
    } finally {
      loading.value = false;
    }
  };

  // Check current session
  const checkAuth = async () => {
    if (user.value) return; // Already loaded

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

  // Request password reset
  const requestPasswordReset = async (email: string) => {
    return await $fetch("/api/auth/password-reset", {
      method: "POST",
      body: { email },
    });
  };

  // Confirm password reset
  const confirmPasswordReset = async (
    userId: string,
    secret: string,
    password: string
  ) => {
    return await $fetch("/api/auth/password-reset/confirm", {
      method: "POST",
      body: { userId, secret, password },
    });
  };

  return {
    user: readonly(user),
    loading: readonly(loading),
    isAuthenticated,
    login,
    register,
    logout,
    checkAuth,
    requestPasswordReset,
    confirmPasswordReset,
  };
};
```

---

## 4. Authentication Middleware

**File**: `middleware/auth.ts`

```typescript
export default defineNuxtRouteMiddleware(async (to, from) => {
  const { checkAuth, isAuthenticated } = useAuth();

  // Check authentication status
  await checkAuth();

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    return navigateTo({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
});
```

**Usage in pages**:

```vue
<!-- pages/admin/index.vue -->
<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
</script>
```

---

## 5. TypeScript Types

**File**: `types/auth.ts`

```typescript
export interface User {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  prefs: {
    avatar?: string;
  };
  registration: string;
  labels: string[];
}

export interface Session {
  $id: string;
  userId: string;
  provider: string;
  expire: string;
  current: boolean;
}

export interface AuthResponse {
  user: User;
  session?: Session;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  userId: string;
  secret: string;
  password: string;
}

export interface VerifyEmailRequest {
  userId: string;
  secret: string;
}
```

---

## 6. Environment Variables

**File**: `.env`

```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=66b38cfd003b4ba07a2e
APPWRITE_API_KEY=your-api-key-here

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# App Configuration
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

**File**: `.env.example` (for repository)

```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=your-api-key-here

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# App Configuration
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 7. Key Findings & Recommendations

### 7.1 Security Best Practices

✅ **DO**:

- Use HTTP-only cookies for session storage
- Keep Appwrite SDK server-side only (never expose API keys)
- Map Appwrite errors to user-friendly messages
- Use generic success messages for password reset (don't reveal if email exists)
- Validate input with Zod schemas on both client and server
- Use HTTPS in production (required for secure cookies and OAuth)

❌ **DON'T**:

- Don't expose Appwrite session tokens to client JavaScript
- Don't reveal whether an email exists in the database
- Don't expose detailed error messages from Appwrite
- Don't use localStorage for session storage (less secure)

### 7.2 Nuxt UI v4 Best Practices

✅ **DO**:

- Use `<UForm>` with Zod schemas for validation
- Use `<UAlert>` for error/success messages
- Use `<UButton>` loading prop for async operations
- Use `<UCard>` for page layouts
- Use `<UFormGroup>` for consistent label/input structure
- Use `<UDivider>` for visual separators

❌ **DON'T**:

- Don't create custom form components (use UForm)
- Don't write custom CSS for forms (use component props)
- Don't manually manage dark mode (automatic in Nuxt UI)

### 7.3 Performance Considerations

- Use `useState` for SSR-compatible auth state
- Minimize API calls with `checkAuth` caching
- Use HTTP-only cookies (reduces client-side JavaScript)
- Lazy-load auth pages (not in critical path)

### 7.4 Testing Strategy

- Mock Appwrite SDK for unit tests
- Test API routes with Vitest
- Test composable with Nuxt Test Utils
- Test E2E flows with Playwright
- Test error scenarios (invalid credentials, expired tokens, etc.)

---

## 8. Next Steps

### Phase 0 Completion Checklist

- [x] Research Appwrite SDK authentication methods
- [x] Research Appwrite session management
- [x] Research Appwrite OAuth flow
- [x] Document Appwrite error codes and mapping
- [ ] Complete Appwrite backend setup (see spec Appwrite Backend Setup section)
- [ ] Create GitHub OAuth app and configure callback URLs
- [ ] Add environment variables to `.env` (with example in `.env.example`)
- [ ] Test Appwrite SDK connection with simple API call
- [x] Document findings in `research.md` (this file)

### Ready for Phase 1

Once Phase 0 backend setup is complete, proceed to **Phase 1: Design & Contracts**:

1. Create `data-model.md` with entity relationships
2. Create `contracts/api-routes.md` with API endpoint contracts
3. Create `quickstart.md` with setup guide
4. Create `types/auth.ts` with TypeScript types

---

**Status**: ✅ Research Complete - Backend Setup Pending
