# Form Validation Testing Guide

## Overview

This guide documents the patterns and strategies for testing Zod schema validation with Nuxt UI forms in Playwright E2E tests.

## Architecture

### Validation Stack

- **Zod**: Schema-first validation with TypeScript inference
- **Nuxt UI v4**: `<UForm>` with `<UFormField>` components
- **Playwright**: E2E testing with hydration-aware helpers

### Key Components

```typescript
// Schema definition (app/schemas/auth.ts)
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

// Form component (app/pages/login.vue)
<UForm :schema="loginSchema" :state="state" @submit="onSubmit">
  <UFormField name="email" label="Email">
    <UInput v-model="state.email" type="email" />
  </UFormField>
</UForm>
```

## Testing Patterns

### 1. Hydration Timing

**Critical Discovery**: Vue hydration → UForm event handler attachment takes 3+ seconds.

```typescript
// tests/helpers/hydration.ts
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

  // Additional buffer for UForm handler attachment
  await page.waitForTimeout(3000);
}
```

### 2. Validation Test Pattern

```typescript
test("should show validation errors for empty form", async ({ page }) => {
  // 1. Wait for hydration BEFORE any interactions
  await waitForHydration(page);

  // 2. Click submit without filling fields
  await page.getByTestId("login-submit").click();

  // 3. Brief wait for validation to run
  await page.waitForTimeout(500);

  // 4. Assert error messages with timeout
  await expect(page.getByText(/Email is required/i)).toBeVisible({
    timeout: 3000,
  });
  await expect(page.getByText(/Password is required/i)).toBeVisible({
    timeout: 3000,
  });
});
```

### 3. HTML5 vs Zod Validation

**Important**: Input `type="email"` enables browser HTML5 validation, which has different rules than Zod.

❌ **Problem**:

```typescript
// This may pass HTML5 validation but fail Zod
await page.getByLabel(/email/i).fill("not-an-email");
```

✅ **Solution**:

```typescript
// Use clearly invalid email (no @ symbol) to ensure Zod validation triggers
await page.getByLabel(/email/i).fill("invalidemail");
```

### 4. Serial Test Execution

Due to hydration timing sensitivity, run validation tests serially:

```bash
npx playwright test -g "validation" --workers=1
```

## Common Pitfalls

### 1. ❌ Testing Before Hydration

```typescript
// DON'T: Interact immediately after navigation
await page.goto("/login");
await page.getByTestId("submit").click(); // May submit as GET!
```

✅ **Fix**: Always wait for hydration

```typescript
await page.goto("/login");
await waitForHydration(page); // Wait for UForm handlers
await page.getByTestId("submit").click();
```

### 2. ❌ Browser HTML5 Validation Interference

```typescript
// DON'T: Use inputs that pass HTML5 but fail Zod
<UInput type="email" /> // Browser may accept 'not-an-email'
```

✅ **Fix**: Use clearly invalid test data

```typescript
await page.fill("invalidemail"); // No @ = fails both validations
```

### 3. ❌ Insufficient Wait Times

```typescript
// DON'T: Expect validation immediately
await page.click("submit");
await expect(page.getByText("Error")).toBeVisible(); // May timeout
```

✅ **Fix**: Add buffer for validation + rendering

```typescript
await page.click("submit");
await page.waitForTimeout(500); // Validation runs
await expect(page.getByText("Error")).toBeVisible({ timeout: 3000 });
```

## Test Results

### Validation Test Suite: 5/5 ✅

```
✓ Login › empty form validation
✓ Login › invalid email format
✓ Registration › empty form validation
✓ Registration › invalid email format
✓ Registration › weak password
```

## Best Practices

### 1. Shared Schemas

Keep schemas in `app/schemas/` for reuse across client and server:

```typescript
// app/schemas/auth.ts
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

// Reuse in API routes
// server/api/auth/login.post.ts
const body = await loginSchema.parseAsync(await readBody(event));
```

### 2. Type Inference

Let Zod infer types to avoid duplication:

```typescript
export type LoginForm = z.infer<typeof loginSchema>;

const state = reactive<LoginForm>({
  email: "",
  password: "",
});
```

### 3. Consistent Error Messages

Use descriptive error messages that match test expectations:

```typescript
email: z.string()
  .min(1, "Email is required") // Empty field
  .email("Invalid email address"); // Format validation
```

### 4. Test Data Strategy

- **Empty validation**: Leave fields blank
- **Format validation**: Use clearly invalid data (`invalidemail`, not `test@`)
- **Complex validation**: Test boundary conditions (7 chars for min 8, etc.)

## Debugging Tips

### Check Form Submission Behavior

```typescript
// Add URL check to verify form didn't submit as GET
const url = page.url();
console.log("URL after submit:", url);
// Should be: http://localhost:3000/login (no query params)
// Not: http://localhost:3000/login?email=test&password=test
```

### Verify Validation Errors in DOM

```typescript
const bodyContent = await page.locator("body").textContent();
console.log("Page content:", bodyContent);
// Should see: "Email is required", "Invalid email address", etc.
```

### Check Vue Hydration Status

```typescript
await page.evaluate(() => {
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    console.log(
      "Form attributes:",
      Array.from(form.attributes).map((a) => a.name)
    );
  });
});
```

## Future Improvements

1. **Field-level validation**: Add `validateOn="input"` for real-time feedback
2. **Custom validators**: Extend Zod with domain-specific validation
3. **Async validation**: Test server-side uniqueness checks (email exists, etc.)
4. **Accessibility**: Test ARIA attributes on error messages
5. **Mobile testing**: Verify validation on touch devices

## References

- [Nuxt UI Forms Documentation](https://ui.nuxt.com/components/form)
- [Zod Documentation](https://zod.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- Project: `specs/003-login-auth-we/PHASE-3-TESTING.md`
