# SpecKit Form Validation Testing Standard

**Version**: 1.0.0  
**Last Updated**: October 23, 2025  
**Status**: ✅ Production Ready

## Overview

This document defines the **standardized testing patterns** for Zod schema validation with Nuxt UI forms across all SpecKit starter repositories.

## Architecture Requirements

### Stack Dependencies

```json
{
  "dependencies": {
    "nuxt": "^4.x",
    "@nuxt/ui": "^4.x",
    "zod": "^3.x",
    "vue": "^3.x"
  },
  "devDependencies": {
    "@playwright/test": "^1.56.0",
    "@nuxt/test-utils": "^3.x"
  }
}
```

### Project Structure

```
tests/
├── helpers/
│   ├── hydration.ts          # Hydration timing utilities
│   ├── form-validation.ts    # Validation testing patterns
│   └── setup.ts              # Global test setup
├── e2e/
│   └── auth/                 # E2E tests by feature
│       ├── login.spec.ts
│       └── registration.spec.ts
└── VALIDATION-TESTING.md     # Implementation guide
```

## Core Utilities

### 1. Hydration Helper (`tests/helpers/hydration.ts`)

**Purpose**: Ensure Vue + UForm fully hydrated before test interactions.

```typescript
export async function waitForHydration(page: Page) {
  await page.waitForLoadState("domcontentloaded");

  // Smart detection: Wait for Vue data-v- attributes
  await page.waitForFunction(
    () => {
      const forms = document.querySelectorAll("form");
      return Array.from(forms).some(
        (form) =>
          Array.from(form.attributes).some((attr) =>
            attr.name.startsWith("data-v-")
          ) || form.classList.length > 0
      );
    },
    { timeout: 15000 }
  );

  // Buffer for UForm handler attachment (critical!)
  await page.waitForTimeout(3000);
}
```

**Key Timing**: 3-second buffer is required for UForm event handlers.

### 2. Validation Testing Helpers (`tests/helpers/form-validation.ts`)

Pre-built functions for common validation patterns:

- `testValidationErrors()` - Generic validation error testing
- `testEmptyFormValidation()` - Required field validation
- `testInvalidEmailValidation()` - Email format validation
- `getInvalidFormData()` - Consistent invalid test data
- `assertFormDidNotSubmit()` - Verify form stays on page
- `debugValidationState()` - Troubleshooting helper

## Standard Test Patterns

### Pattern 1: Empty Form Validation

**Use Case**: Test required field validation.

```typescript
import { test } from "@playwright/test";
import { testEmptyFormValidation } from "~/tests/helpers/form-validation";

test("should show validation errors for empty form", async ({ page }) => {
  await testEmptyFormValidation(page, {
    formUrl: "/login",
    submitSelector: '[data-testid="login-submit"]',
    requiredFields: ["Email", "Password"],
  });
});
```

### Pattern 2: Invalid Email Format

**Use Case**: Test email schema validation.

**Critical**: Use `"invalidemail"` (no @) to avoid HTML5 validation interference.

```typescript
import { testInvalidEmailValidation } from "~/tests/helpers/form-validation";

test("should show error for invalid email", async ({ page }) => {
  await page.goto("/login");

  await testInvalidEmailValidation(page, {
    emailSelector: '[name="email"]',
    submitSelector: 'button[type="submit"]',
    otherFields: [{ selector: '[name="password"]', value: "ValidPass123!" }],
  });
});
```

### Pattern 3: Complex Validation

**Use Case**: Test custom schema rules (password strength, etc.).

```typescript
import {
  testValidationErrors,
  getInvalidFormData,
} from "~/tests/helpers/form-validation";

test("should show error for weak password", async ({ page }) => {
  await page.goto("/register");

  const invalidData = getInvalidFormData();

  await testValidationErrors(page, {
    submitSelector: '[data-testid="register-submit"]',
    fillFields: [
      { label: /email/i, value: "test@example.com" },
      { label: /^password/i, value: invalidData.weakPassword },
    ],
    expectedErrors: [
      "Password must be at least 8 characters",
      "Password must contain at least one uppercase letter",
    ],
  });
});
```

## Schema Conventions

### Location

Store schemas in `app/schemas/` for client/server sharing:

```
app/
└── schemas/
    ├── auth.ts           # Authentication schemas
    ├── user.ts           # User profile schemas
    └── common.ts         # Shared validation rules
```

### Standard Structure

```typescript
// app/schemas/auth.ts
import { z } from "zod";

// Reusable sub-schemas
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .toLowerCase();

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

// Form schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: emailSchema,
  password: passwordSchema,
});

// Type exports
export type LoginForm = z.infer<typeof loginSchema>;
export type RegisterForm = z.infer<typeof registerSchema>;
```

### Error Message Guidelines

✅ **DO**:

- Use consistent format: `"Field is required"`
- Be specific: `"Invalid email address"` (not "Invalid input")
- Match field labels: `"Email is required"` if label is "Email"

❌ **DON'T**:

- Generic messages: `"Error"`, `"Invalid"`
- Technical jargon: `"Validation failed on predicate"`
- Inconsistent casing: `"email Is Required"`

## Form Component Patterns

### Nuxt UI v4 Integration

```vue
<template>
  <UForm
    ref="form"
    :schema="loginSchema"
    :state="state"
    @submit="onSubmit"
    data-testid="login-form"
  >
    <UFormField name="email" label="Email" required data-testid="email-field">
      <UInput
        v-model="state.email"
        type="email"
        autocomplete="email"
        data-testid="email-input"
      />
    </UFormField>

    <UFormField
      name="password"
      label="Password"
      required
      data-testid="password-field"
    >
      <UInput
        v-model="state.password"
        type="password"
        autocomplete="current-password"
        data-testid="password-input"
      />
    </UFormField>

    <UButton type="submit" :loading="loading" data-testid="login-submit">
      Log In
    </UButton>
  </UForm>
</template>

<script setup lang="ts">
import { loginSchema, type LoginForm } from "~/schemas/auth";

const state = reactive<LoginForm>({
  email: "",
  password: "",
});

async function onSubmit(event: FormSubmitEvent<LoginForm>) {
  // event.data is validated by Zod
  await handleLogin(event.data);
}
</script>
```

### Key Attributes

1. **`data-testid` attributes**: Enable reliable Playwright selectors
2. **`name` prop on UFormField**: Links field to schema property
3. **`required` prop**: Visual indicator (not validation)
4. **`type` on UInput**: Be aware of HTML5 validation interference

## Playwright Configuration

### Standard Config

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  expect: { timeout: 5000 },

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  // Suppress Nuxt server noise
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    stdout: "ignore",
    stderr: "ignore",
  },

  // Serial execution for hydration-sensitive tests
  workers: process.env.CI ? 1 : undefined,
});
```

### Test Organization

```typescript
// tests/e2e/auth/login.spec.ts
import { test, expect } from "@playwright/test";
import { waitForHydration } from "~/tests/helpers/hydration";
import { testEmptyFormValidation } from "~/tests/helpers/form-validation";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    // Hydration happens once per test
  });

  test("should display login form", async ({ page }) => {
    await expect(page.getByTestId("login-form")).toBeVisible();
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await testEmptyFormValidation(page, {
      formUrl: "/login",
      submitSelector: '[data-testid="login-submit"]',
      requiredFields: ["Email", "Password"],
      skipNavigation: true, // Already navigated in beforeEach
    });
  });
});
```

## Common Pitfalls & Solutions

### ❌ Problem: Form Submits as GET Request

**Symptom**: URL shows query params (`/login?email=test&password=test`)

**Cause**: Playwright clicked submit before UForm handlers attached.

**Solution**: Use `waitForHydration()` before interactions.

```typescript
// ❌ BAD
await page.goto("/login");
await page.click('[type="submit"]'); // Too early!

// ✅ GOOD
await page.goto("/login");
await waitForHydration(page);
await page.click('[type="submit"]');
```

### ❌ Problem: HTML5 Validation Interferes

**Symptom**: "not-an-email" passes validation, test fails.

**Cause**: `<input type="email">` accepts some invalid formats.

**Solution**: Use clearly invalid data (no @ symbol).

```typescript
// ❌ BAD - May pass HTML5 validation
await page.fill('[name="email"]', "not-an-email");

// ✅ GOOD - Fails both HTML5 and Zod
await page.fill('[name="email"]', "invalidemail");
```

### ❌ Problem: Validation Errors Not Visible

**Symptom**: `expect(errorMessage).toBeVisible()` times out.

**Cause**: Validation runs asynchronously, need buffer time.

**Solution**: Add 500ms wait + 3s timeout.

```typescript
// ❌ BAD
await page.click("submit");
await expect(page.getByText("Error")).toBeVisible(); // May timeout

// ✅ GOOD
await page.click("submit");
await page.waitForTimeout(500);
await expect(page.getByText("Error")).toBeVisible({ timeout: 3000 });
```

## Testing Checklist

For each form in your SpecKit repo:

- [ ] Schema defined in `app/schemas/`
- [ ] Types exported and used in component
- [ ] `data-testid` attributes on form, fields, and buttons
- [ ] `name` prop on all `<UFormField>` components matches schema
- [ ] E2E test file created in `tests/e2e/`
- [ ] Test: Empty form submission shows required errors
- [ ] Test: Invalid email format shows error (use "invalidemail")
- [ ] Test: Invalid password shows specific errors
- [ ] Test: Valid submission redirects correctly
- [ ] All tests use `waitForHydration()` helper
- [ ] Serial execution (`--workers=1`) if hydration issues

## Performance Targets

- **Page load**: < 2 seconds
- **Hydration detection**: < 5 seconds
- **Validation execution**: < 500ms
- **Full test suite**: < 5 minutes

## Rollout Plan for SpecKit

### Phase 1: Core Repos (Week 1)

1. **nuxt-saas-starter**: Primary reference implementation
2. **nuxt-auth-starter**: Authentication-focused
3. **nuxt-admin-starter**: Admin panel patterns

### Phase 2: Specialized Repos (Week 2)

4. **nuxt-ecommerce-starter**: Order forms
5. **nuxt-blog-starter**: Contact/comment forms
6. **nuxt-crm-starter**: Lead capture forms

### Phase 3: Documentation (Week 3)

- Update SpecKit main documentation
- Record video walkthrough
- Create migration guide for existing repos

## Support & Questions

- **Documentation**: This file + `tests/VALIDATION-TESTING.md`
- **Reference Implementation**: `nuxt-spec` repo
- **Issues**: [GitHub Issues](https://github.com/sosensible/nuxt-spec/issues)
- **Discussions**: [GitHub Discussions](https://github.com/sosensible/speckit/discussions)

## Version History

- **1.0.0** (2025-10-23): Initial standard based on nuxt-spec validation testing breakthrough

---

**Next Steps**: Copy `tests/helpers/` utilities to your SpecKit repo and follow the patterns above!
