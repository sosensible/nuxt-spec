# Testing Documentation Template

Copy this section into your SpecKit repo's README.md:

---

## Testing

This project uses the **SpecKit Validation Testing Standard** for consistent, reliable form validation testing.

### Quick Start

```bash
# Install dependencies
npm install

# Run validation tests
npm run test:validation

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode
npm run test:ui
```

### Test Structure

```
tests/
├── helpers/
│   ├── hydration.ts          # Vue hydration timing utilities
│   ├── form-validation.ts    # Validation testing patterns
│   └── setup.ts              # Global test configuration
├── e2e/
│   ├── auth/                 # Authentication flows
│   ├── user/                 # User management
│   └── ...                   # Feature-specific tests
├── examples/
│   └── validation-patterns.spec.ts  # Reference implementation
└── VALIDATION-TESTING.md     # Testing guide
```

### Writing Validation Tests

Use the standardized helpers for consistent test patterns:

```typescript
import { test } from "@playwright/test";
import { testEmptyFormValidation } from "~/tests/helpers/form-validation";

test("should validate required fields", async ({ page }) => {
  await testEmptyFormValidation(page, {
    formUrl: "/login",
    submitSelector: '[data-testid="login-submit"]',
    requiredFields: ["Email", "Password"],
  });
});
```

### Test Coverage

| Feature        | Tests | Status |
| -------------- | ----- | ------ |
| Login          | 5/5   | ✅     |
| Registration   | 5/5   | ✅     |
| Password Reset | 3/3   | ✅     |
| Profile        | 4/4   | ✅     |

**Total Coverage**: XX/XX tests passing (XX%)

### CI/CD

Tests run automatically on:

- Every push to main
- Every pull request
- Nightly builds

**Requirements**:

- All validation tests must pass
- Serial execution (`--workers=1`) for hydration-sensitive tests
- Maximum test duration: 5 minutes

### Documentation

- **Quick Start**: [`tests/QUICK-START.md`](./tests/QUICK-START.md)
- **Testing Guide**: [`tests/VALIDATION-TESTING.md`](./tests/VALIDATION-TESTING.md)
- **Standard Reference**: [`tests/SPECKIT-VALIDATION-STANDARD.md`](./tests/SPECKIT-VALIDATION-STANDARD.md)

### Troubleshooting

#### Form submits as GET request

**Cause**: Playwright interacting before Vue hydration completes.

**Solution**: Use `waitForHydration()` helper:

```typescript
import { waitForHydration } from "~/tests/helpers/hydration";

await page.goto("/form");
await waitForHydration(page); // Wait for Vue + UForm
await page.click("submit");
```

#### Validation errors not visible

**Cause**: Tests checking too quickly after submission.

**Solution**: Add buffer time:

```typescript
await page.click("submit");
await page.waitForTimeout(500);
await expect(error).toBeVisible({ timeout: 3000 });
```

#### Invalid email test fails

**Cause**: HTML5 validation accepting invalid formats.

**Solution**: Use "invalidemail" (no @ symbol):

```typescript
await page.fill('[name="email"]', "invalidemail");
```

### Contributing

When adding new forms:

1. Create Zod schema in `app/schemas/`
2. Add `data-testid` attributes to form elements
3. Write validation tests using standard helpers
4. Update test coverage table in README
5. Ensure all tests pass with `npm run test:validation`

See [`tests/QUICK-START.md`](./tests/QUICK-START.md) for detailed instructions.

---

## Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "playwright test",
    "test:validation": "playwright test -g 'validation' --workers=1",
    "test:e2e": "playwright test tests/e2e",
    "test:ui": "playwright test --ui",
    "test:debug": "playwright test --debug",
    "test:headed": "playwright test --headed"
  }
}
```

---

## Environment Setup

### Local Development

```bash
# Install Playwright browsers
npx playwright install

# Run dev server (required for tests)
npm run dev

# In another terminal, run tests
npm run test:validation
```

### CI Environment

Tests run in GitHub Actions with:

- Node.js 20
- Playwright browsers pre-installed
- Serial execution for reliability
- Automatic retry on failure

See `.github/workflows/test.yml` for configuration.

---

**Documentation Standard**: v1.0.0 (2025-10-23)
