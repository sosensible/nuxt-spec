/**
 * Example: Login Form Validation Tests
 * 
 * This is a REFERENCE IMPLEMENTATION showing standardized validation testing patterns.
 * Copy this pattern to other SpecKit repos for consistent test coverage.
 * 
 * @see tests/SPECKIT-VALIDATION-STANDARD.md
 */

import { test, expect } from '@playwright/test'
import { 
  testEmptyFormValidation,
  testInvalidEmailValidation,
  testValidationErrors,
  getInvalidFormData,
  assertFormDidNotSubmit
} from '../helpers/form-validation'
import { waitForHydration } from '../helpers/hydration'

test.describe('Login Form Validation (Standardized Pattern)', () => {
  const LOGIN_URL = '/login'
  const SUBMIT_BUTTON = '[data-testid="login-submit"]'

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL)
  })

  /**
   * PATTERN 1: Empty Form Validation
   * 
   * Tests that all required fields show "X is required" errors
   * when form is submitted without filling any fields.
   */
  test('should show validation errors for empty form submission', async ({ page }) => {
    await testEmptyFormValidation(page, {
      formUrl: LOGIN_URL,
      submitSelector: SUBMIT_BUTTON,
      requiredFields: ['Email', 'Password'],
      skipNavigation: true // Already navigated in beforeEach
    })

    // Optional: Verify form didn't actually submit
    await assertFormDidNotSubmit(page, LOGIN_URL)
  })

  /**
   * PATTERN 2: Invalid Email Format
   * 
   * Tests email schema validation (Zod's .email() rule).
   * Uses "invalidemail" (no @) to avoid HTML5 validation interference.
   */
  test('should show validation error for invalid email format', async ({ page }) => {
    await testInvalidEmailValidation(page, {
      emailSelector: '[name="email"]',
      submitSelector: SUBMIT_BUTTON,
      expectedError: 'Invalid email address',
      otherFields: [
        { selector: '[name="password"]', value: 'ValidPassword123!' }
      ]
    })

    await assertFormDidNotSubmit(page, LOGIN_URL)
  })

  /**
   * PATTERN 3: Generic Validation Testing
   * 
   * Use testValidationErrors() for custom validation scenarios
   * where pre-built helpers don't fit.
   */
  test('should show validation errors for specific invalid inputs', async ({ page }) => {
    const invalidData = getInvalidFormData()

    await testValidationErrors(page, {
      submitSelector: SUBMIT_BUTTON,
      fillFields: [
        { label: /email/i, value: invalidData.email },
        { label: /password/i, value: invalidData.empty }
      ],
      expectedErrors: [
        'Invalid email address',
        'Password is required'
      ]
    })
  })

  /**
   * PATTERN 4: Manual Test (Full Control)
   * 
   * When you need complete control over test flow,
   * use waitForHydration() + manual assertions.
   */
  test('should handle validation edge cases (manual pattern)', async ({ page }) => {
    // Wait for Vue + UForm hydration
    await waitForHydration(page)

    // Fill form with edge case data
    await page.getByLabel(/email/i).fill('test@example.com') // Valid email
    await page.getByLabel(/password/i).fill('') // Empty password

    // Submit
    await page.locator(SUBMIT_BUTTON).click()
    await page.waitForTimeout(500)

    // Expect only password error (email is valid)
    await expect(page.getByText(/password is required/i))
      .toBeVisible({ timeout: 3000 })
    
    // Email error should NOT be visible
    await expect(page.getByText(/email is required/i))
      .not.toBeVisible()
    
    await expect(page.getByText(/invalid email/i))
      .not.toBeVisible()
  })

  /**
   * PATTERN 5: Successful Validation
   * 
   * Test that valid data passes validation and form submits.
   * Mock or stub API to avoid external dependencies.
   */
  test('should allow submission with valid credentials', async ({ page }) => {
    // Mock API endpoint
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          user: { id: '123', email: 'test@example.com' },
          session: { token: 'mock-token' }
        })
      })
    })

    await waitForHydration(page)

    // Fill with valid data
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('ValidPassword123!')

    // Submit
    await page.locator(SUBMIT_BUTTON).click()

    // Should redirect (no validation errors)
    await expect(page).toHaveURL(/\/dashboard|\//, { timeout: 5000 })
  })

  /**
   * PATTERN 6: Real-time Validation (Optional)
   * 
   * If your form uses validateOn="input" or "blur",
   * test that errors appear before submission.
   */
  test.skip('should show validation errors on blur (if enabled)', async ({ page }) => {
    await waitForHydration(page)

    const emailInput = page.getByLabel(/email/i)
    
    // Focus and blur with invalid data
    await emailInput.fill('invalidemail')
    await emailInput.blur()

    // Error should appear immediately (if validateOn="blur")
    await expect(page.getByText(/invalid email/i))
      .toBeVisible({ timeout: 1000 })
  })
})

/**
 * PATTERN 7: Cross-Form Consistency
 * 
 * Test that email validation works the same across all forms.
 * Create separate test suites for consistency testing.
 */
test.describe('Cross-Form Email Validation Consistency', () => {
  const forms = [
    { form: 'Login', url: '/login', submitId: 'login-submit' },
    { form: 'Register', url: '/register', submitId: 'register-submit' },
    { form: 'Password Reset', url: '/password-reset', submitId: 'reset-submit' }
  ]

  for (const { form, url, submitId } of forms) {
    test(`should validate email format in ${form} form`, async ({ page }) => {
      await page.goto(url)

      await testInvalidEmailValidation(page, {
        emailSelector: '[name="email"]',
        submitSelector: `[data-testid="${submitId}"]`,
        expectedError: 'Invalid email address'
      })
    })
  }
})
