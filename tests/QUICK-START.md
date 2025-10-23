# Quick Start: Add Validation Testing to Your SpecKit Repo

**Time to implement**: ~30 minutes  
**Prerequisites**: Nuxt 4, Nuxt UI v4, Zod, Playwright installed

## Step 1: Copy Testing Utilities (5 min)

### 1.1 Create helpers directory

```bash
mkdir -p tests/helpers
mkdir -p tests/examples
```

### 1.2 Copy core files from `nuxt-spec` repo

Copy these files from this repo:

```
tests/helpers/
├── hydration.ts              # Copy as-is
├── form-validation.ts        # Copy as-is
tests/examples/
└── validation-patterns.spec.ts  # Reference implementation
tests/
├── VALIDATION-TESTING.md     # Implementation guide
└── SPECKIT-VALIDATION-STANDARD.md  # This standard
```

**Or use this command** (from your repo root):

```bash
# If nuxt-spec is cloned locally
cp ../nuxt-spec/tests/helpers/hydration.ts tests/helpers/
cp ../nuxt-spec/tests/helpers/form-validation.ts tests/helpers/
cp ../nuxt-spec/tests/examples/validation-patterns.spec.ts tests/examples/
cp ../nuxt-spec/tests/VALIDATION-TESTING.md tests/
cp ../nuxt-spec/tests/SPECKIT-VALIDATION-STANDARD.md tests/
```

## Step 2: Update Playwright Config (5 min)

### 2.1 Edit `playwright.config.ts`

```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,

  use: {
    baseURL: "http://localhost:3000",
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    stdout: "ignore", // Suppress Nuxt server noise
    stderr: "ignore", // Suppress Nuxt server noise
  },

  // Use serial execution for hydration-sensitive tests
  workers: process.env.CI ? 1 : undefined,
});
```

## Step 3: Add data-testid Attributes (10 min)

### 3.1 Update your form components

Add `data-testid` to forms, fields, and buttons:

```vue
<template>
  <UForm
    :schema="loginSchema"
    :state="state"
    @submit="onSubmit"
    data-testid="login-form"
  >
    <UFormField name="email" label="Email" data-testid="email-field">
      <UInput v-model="state.email" data-testid="email-input" />
    </UFormField>

    <UButton type="submit" data-testid="login-submit"> Log In </UButton>
  </UForm>
</template>
```

### 3.2 Test ID naming convention

- Forms: `{feature}-form` (e.g., `login-form`, `register-form`)
- Fields: `{field}-field` or `{field}-input`
- Buttons: `{action}-submit` or `{action}-button`

## Step 4: Write Your First Test (10 min)

### 4.1 Create test file

```bash
mkdir -p tests/e2e/auth
touch tests/e2e/auth/login.spec.ts
```

### 4.2 Add validation tests

```typescript
import { test, expect } from "@playwright/test";
import {
  testEmptyFormValidation,
  testInvalidEmailValidation,
} from "~/tests/helpers/form-validation";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("should show validation errors for empty form", async ({ page }) => {
    await testEmptyFormValidation(page, {
      formUrl: "/login",
      submitSelector: '[data-testid="login-submit"]',
      requiredFields: ["Email", "Password"],
      skipNavigation: true,
    });
  });

  test("should show error for invalid email", async ({ page }) => {
    await testInvalidEmailValidation(page, {
      emailSelector: '[name="email"]',
      submitSelector: '[data-testid="login-submit"]',
      otherFields: [{ selector: '[name="password"]', value: "ValidPass123!" }],
    });
  });
});
```

## Step 5: Run Tests (2 min)

```bash
# Run all validation tests
npx playwright test -g "validation"

# Run with serial execution (recommended for first run)
npx playwright test -g "validation" --workers=1

# Run specific test file
npx playwright test tests/e2e/auth/login.spec.ts
```

### Expected Results

✅ All tests should pass on first run if:

- Forms use `<UForm>` with Zod schemas
- Test data is properly invalid (`"invalidemail"` not `"test@bad"`)
- Helpers properly imported

## Troubleshooting

### ❌ "Form submitted as GET request"

**Problem**: Form has query params in URL after submission.

**Solution**: Ensure `waitForHydration()` is called:

```typescript
import { waitForHydration } from "~/tests/helpers/hydration";

test("my test", async ({ page }) => {
  await page.goto("/form");
  await waitForHydration(page); // Add this!
  await page.click("submit");
});
```

### ❌ "Validation error not visible"

**Problem**: `expect(error).toBeVisible()` times out.

**Solution**: Add 500ms wait after submit:

```typescript
await page.click("submit");
await page.waitForTimeout(500); // Add this!
await expect(error).toBeVisible({ timeout: 3000 });
```

### ❌ "Invalid email test fails"

**Problem**: "not-an-email" passes validation.

**Solution**: Use "invalidemail" (no @):

```typescript
// ❌ Bad
await page.fill('[name="email"]', "not-an-email");

// ✅ Good
await page.fill('[name="email"]', "invalidemail");
```

### ❌ "Test times out waiting for hydration"

**Problem**: `waitForHydration()` exceeds timeout.

**Solution**: Increase timeout or check if form actually renders:

```typescript
// Check if page loads
await page.goto("/form");
await expect(page.locator("form")).toBeVisible({ timeout: 10000 });

// Then wait for hydration
await waitForHydration(page);
```

## Validation Checklist

Use this checklist for each form:

- [ ] Zod schema defined in `app/schemas/`
- [ ] Schema exported with type: `export type XForm = z.infer<typeof xSchema>`
- [ ] Component uses `<UForm :schema="xSchema">`
- [ ] All fields have `data-testid` attributes
- [ ] Submit button has `data-testid="{feature}-submit"`
- [ ] Test file created in `tests/e2e/{feature}/`
- [ ] Test: Empty form shows required errors
- [ ] Test: Invalid email shows format error
- [ ] Test: Invalid password shows specific errors
- [ ] All tests pass with `--workers=1`

## Next Steps

1. **Review examples**: Check `tests/examples/validation-patterns.spec.ts`
2. **Read full guide**: See `tests/VALIDATION-TESTING.md`
3. **Implement for all forms**: Login, register, password reset, etc.
4. **Run full suite**: `npx playwright test tests/e2e`

## Need Help?

- **Full documentation**: `tests/SPECKIT-VALIDATION-STANDARD.md`
- **Reference repo**: `github.com/sosensible/nuxt-spec`
- **Issues**: Open issue in your repo with `[validation-testing]` tag

---

**Success Metric**: All validation tests passing within 30 minutes! 🎉
