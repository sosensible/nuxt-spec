/**
 * Form Validation Testing Helpers
 * 
 * Reusable utilities for testing Zod schema validation with Nuxt UI forms.
 * These patterns ensure consistent, reliable validation testing across SpecKit projects.
 * 
 * @module tests/helpers/form-validation
 */

import { expect, type Page } from '@playwright/test'
import { waitForHydration } from './hydration'

/**
 * Standard pattern for testing form validation errors.
 * 
 * Handles:
 * - Hydration timing (Vue + UForm event handlers)
 * - Validation execution timing
 * - Error message visibility assertions
 * 
 * @example
 * ```typescript
 * await testValidationErrors(page, {
 *   submitSelector: 'button[type="submit"]',
 *   expectedErrors: ['Email is required', 'Password is required']
 * })
 * ```
 */
export async function testValidationErrors(
  page: Page,
  options: {
    /** Selector for submit button (testid, role, or CSS) */
    submitSelector: string
    /** Expected error messages (partial match, case-insensitive) */
    expectedErrors: string[]
    /** Optional: Fill form fields before submitting */
    fillFields?: Array<{ label: string | RegExp; value: string }>
    /** Skip hydration wait (default: false) */
    skipHydrationWait?: boolean
  }
) {
  // Ensure form is fully hydrated unless explicitly skipped
  if (!options.skipHydrationWait) {
    await waitForHydration(page)
  }

  // Fill fields if provided
  if (options.fillFields) {
    for (const field of options.fillFields) {
      await page.getByLabel(field.label).fill(field.value)
    }
  }

  // Submit form
  const submitButton = page.locator(options.submitSelector)
  await submitButton.click()

  // Brief wait for validation to execute
  await page.waitForTimeout(500)

  // Assert all expected errors are visible
  for (const errorText of options.expectedErrors) {
    await expect(page.getByText(new RegExp(errorText, 'i')))
      .toBeVisible({ timeout: 3000 })
  }
}

/**
 * Test data generator for invalid form inputs.
 * 
 * Provides consistently invalid data that triggers Zod validation
 * while avoiding HTML5 validation interference.
 * 
 * @example
 * ```typescript
 * const invalidData = getInvalidFormData()
 * await page.fill('[name="email"]', invalidData.email) // 'invalidemail'
 * ```
 */
export const getInvalidFormData = () => ({
  /** Invalid email (no @ symbol to avoid HTML5 validation) */
  email: 'invalidemail',
  
  /** Weak password (fails complexity requirements) */
  weakPassword: 'weak',
  
  /** Short password (fails length requirements) */
  shortPassword: 'Short1!',
  
  /** Empty string (fails required validation) */
  empty: '',
  
  /** Invalid URL */
  invalidUrl: 'not-a-url',
  
  /** Invalid phone */
  invalidPhone: '123',
})

/**
 * Test empty form submission validation.
 * 
 * Standard pattern: Submit without filling any fields,
 * expect "required" errors for all fields.
 * 
 * @example
 * ```typescript
 * await testEmptyFormValidation(page, {
 *   formUrl: '/login',
 *   submitSelector: '[data-testid="login-submit"]',
 *   requiredFields: ['Email', 'Password']
 * })
 * ```
 */
export async function testEmptyFormValidation(
  page: Page,
  options: {
    /** URL of the form page */
    formUrl: string
    /** Selector for submit button */
    submitSelector: string
    /** Field names that should show "required" errors */
    requiredFields: string[]
    /** Skip navigation if already on page */
    skipNavigation?: boolean
  }
) {
  // Navigate to form
  if (!options.skipNavigation) {
    await page.goto(options.formUrl)
  }

  // Wait for hydration
  await waitForHydration(page)

  // Submit empty form
  await page.locator(options.submitSelector).click()
  await page.waitForTimeout(500)

  // Check each required field has error
  for (const fieldName of options.requiredFields) {
    await expect(
      page.getByText(new RegExp(`${fieldName} is required`, 'i'))
    ).toBeVisible({ timeout: 3000 })
  }
}

/**
 * Test invalid email format validation.
 * 
 * Uses "invalidemail" (no @) to ensure both HTML5 and Zod validation fail.
 * 
 * @example
 * ```typescript
 * await testInvalidEmailValidation(page, {
 *   emailSelector: '[name="email"]',
 *   submitSelector: 'button[type="submit"]',
 *   expectedError: 'Invalid email address'
 * })
 * ```
 */
export async function testInvalidEmailValidation(
  page: Page,
  options: {
    /** Selector for email input */
    emailSelector: string
    /** Selector for submit button */
    submitSelector: string
    /** Expected error message */
    expectedError?: string
    /** Additional fields to fill (optional) */
    otherFields?: Array<{ selector: string; value: string }>
    /** Skip hydration wait */
    skipHydrationWait?: boolean
  }
) {
  const defaultError = 'Invalid email address'
  
  if (!options.skipHydrationWait) {
    await waitForHydration(page)
  }

  // Fill invalid email
  await page.locator(options.emailSelector).fill('invalidemail')

  // Fill other required fields if provided
  if (options.otherFields) {
    for (const field of options.otherFields) {
      await page.locator(field.selector).fill(field.value)
    }
  }

  // Submit
  await page.locator(options.submitSelector).click()
  await page.waitForTimeout(500)

  // Expect email validation error
  await expect(
    page.getByText(new RegExp(options.expectedError || defaultError, 'i'))
  ).toBeVisible({ timeout: 3000 })
}

/**
 * Assert that form did NOT submit (no navigation or query params).
 * 
 * Use after validation errors to confirm form stays on same page.
 * 
 * @example
 * ```typescript
 * await assertFormDidNotSubmit(page, '/login')
 * ```
 */
export async function assertFormDidNotSubmit(
  page: Page,
  expectedUrl: string
) {
  const currentUrl = page.url()
  
  // Should still be on the form page
  expect(currentUrl).toContain(expectedUrl)
  
  // Should NOT have query parameters (GET submission)
  expect(currentUrl).not.toContain('?')
  
  return currentUrl
}

/**
 * Debug helper: Log form validation state.
 * 
 * Useful for troubleshooting failing validation tests.
 * 
 * @example
 * ```typescript
 * await debugValidationState(page)
 * ```
 */
export async function debugValidationState(page: Page) {
  const state = await page.evaluate(() => {
    const forms = document.querySelectorAll('form')
    const errors = document.querySelectorAll('[class*="error"]')
    
    return {
      url: window.location.href,
      formCount: forms.length,
      formAttributes: Array.from(forms).map(f => ({
        id: f.id,
        hasVueAttrs: Array.from(f.attributes).some(a => a.name.startsWith('data-v-')),
        classList: Array.from(f.classList)
      })),
      errorCount: errors.length,
      errorTexts: Array.from(errors).map(e => e.textContent?.trim()),
      bodyText: document.body.textContent?.slice(0, 500)
    }
  })
  
  console.log('=== Validation Debug State ===')
  console.log(JSON.stringify(state, null, 2))
  
  return state
}
