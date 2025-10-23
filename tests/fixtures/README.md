# Test Fixtures - Appwrite Mocking

This directory contains fixtures for mocking Appwrite API responses in E2E tests.

## Overview

The Appwrite mocking infrastructure uses Playwright's route interception to mock all API calls to Appwrite endpoints, allowing E2E tests to run without requiring a live Appwrite instance.

## Files

### `appwrite-mocks.ts`

Main mock implementation file containing:

- **Mock Data**: `mockUser`, `mockUnverifiedUser`, `mockSession`
- **Setup Functions**:
  - `setupAppwriteMocks(page, options)` - Mock all auth API routes
  - `setupAuthenticatedSession(page, user)` - Setup authenticated user session
  - `clearAuthSession(page)` - Clear authentication

## Usage

### Basic Setup (Unauthenticated)

```typescript
import { setupAppwriteMocks } from "../../fixtures/appwrite-mocks";

test.beforeEach(async ({ page }) => {
  await setupAppwriteMocks(page, { authenticated: false });
  await page.goto("/login");
});
```

### Authenticated Session

```typescript
import { setupAuthenticatedSession } from "../../fixtures/appwrite-mocks";

test.beforeEach(async ({ page }) => {
  await setupAuthenticatedSession(page);
  await page.goto("/admin");
});
```

### Custom User

```typescript
await setupAppwriteMocks(page, {
  authenticated: true,
  emailVerified: false,
  user: { ...mockUser, email: "custom@example.com" },
});
```

## Mock Credentials

### Valid Login

- Email: `test@example.com`
- Password: `password123`

### Unverified User

- Email: `unverified@example.com`
- Password: `password123`

### Duplicate Email (for testing)

- Email: `existing@example.com`
- Returns 400 error

### Invalid Credentials

- Any other email/password combination
- Returns 401 error

## Mocked Endpoints

All endpoints in `server/api/auth/*` are mocked:

- ✅ `POST /api/auth/login`
- ✅ `POST /api/auth/register`
- ✅ `POST /api/auth/logout`
- ✅ `GET /api/auth/session`
- ✅ `POST /api/auth/password-reset`
- ✅ `POST /api/auth/password-reset/confirm`
- ✅ `POST /api/auth/verify-email`
- ✅ `POST /api/auth/verify-email/resend`
- ✅ `GET /api/auth/callback/github`

## Benefits

1. **No Appwrite Required**: Tests run without live Appwrite instance
2. **Fast**: No network calls, instant responses
3. **Reliable**: No external dependencies
4. **Repeatable**: Consistent responses every time
5. **Isolated**: Tests don't affect real data

## Example Test

```typescript
import { test, expect } from "@playwright/test";
import { setupAppwriteMocks } from "../../fixtures/appwrite-mocks";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await setupAppwriteMocks(page, { authenticated: false });
    await page.goto("/login");
  });

  test("should login successfully", async ({ page }) => {
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[type="password"]', "password123");
    await page.click('button[type="submit"]');

    // Mock returns success, should redirect to home
    await expect(page).toHaveURL("/");
  });
});
```

## Adding New Mocks

To add a new mocked endpoint:

1. Add route handler in `setupAppwriteMocks()`:

```typescript
await page.route("**/api/auth/new-endpoint", async (route: Route) => {
  const request = route.request();
  const postData = request.postDataJSON();

  // Your mock logic here

  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  });
});
```

2. Update this README with the new endpoint
3. Update tests to use the mock

## Troubleshooting

### Mock Not Working

1. Verify mock is setup in `beforeEach`:

   ```typescript
   await setupAppwriteMocks(page, { authenticated: false });
   ```

2. Check route pattern matches:

   ```typescript
   // Pattern must match actual API route
   await page.route('**/api/auth/login', ...)
   ```

3. Inspect network calls in test:
   ```typescript
   page.on("request", (req) => console.log(req.url()));
   ```

### Session Not Persisting

Cookie name must match Appwrite project:

```typescript
name: "a_session_" + process.env.APPWRITE_PROJECT_ID?.substring(0, 10);
```

## Performance Impact

**Before Mocking**:

- Test duration: 10+ minutes
- Timeout failures: 46/108 tests
- Page loads: 30+ seconds

**After Mocking**:

- Test duration: 3.2 minutes (3x faster)
- No timeout failures
- Page loads: <1 second (30x faster)

## Related Files

- `tests/e2e/auth/*.spec.ts` - E2E test files using mocks
- `playwright.config.ts` - Playwright configuration
- `server/api/auth/**/*.ts` - Real API routes being mocked
