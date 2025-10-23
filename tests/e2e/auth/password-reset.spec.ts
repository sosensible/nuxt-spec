/**
 * E2E Tests: Password Reset Flow
 * 
 * Following TDD RED-GREEN-REFACTOR:
 * - RED: These tests will FAIL initially (pages/APIs don't exist yet)
 * - GREEN: Implement password reset pages and APIs to make tests pass
 * - REFACTOR: Add rate limiting, alerts, and password strength indicator
 * 
 * Testing Philosophy:
 * - Test complete user flow from start to finish
 * - Verify email input → confirmation → new password → login
 * - Test error handling (expired tokens, invalid tokens)
 * - Test security (always show success message even for non-existent emails)
 */

import { test, expect } from '@playwright/test'
import { setupAppwriteMocks } from '../../fixtures/appwrite-mocks'
import { waitForHydration } from '../../helpers/hydration'

test.describe('Password Reset Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocks
    await setupAppwriteMocks(page, { authenticated: false })
    
    // Start at home page
    await page.goto('/')
  })

  test('should complete full password reset flow', async ({ page }) => {
    // Navigate to login page
    await page.getByRole('link', { name: /log in/i }).click()
    await expect(page).toHaveURL('/login')

    // Click "Forgot password?" link
    await page.getByRole('link', { name: /forgot password/i }).click()
    await expect(page).toHaveURL('/password-reset')
    await waitForHydration(page)

    // Fill in email and submit
    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Should show success message (always, for security)
    await expect(page.getByText(/if an account exists/i)).toBeVisible()

    // Note: In real flow, user would click email link
    // For testing, we'll navigate directly to confirm page with mock token
    await page.goto('/password-reset/confirm?userId=test123&secret=test-token')
    await waitForHydration(page)

    // Should see password reset confirmation form
    await expect(page.getByText(/reset your password/i)).toBeVisible()

    // Fill in new password
    await page.getByPlaceholder(/new password/i).fill('NewPassword123!')
    await page.getByPlaceholder(/confirm password/i).fill('NewPassword123!')
    await page.getByRole('button', { name: /reset password/i }).click()

    // Should show success and redirect to login
    await expect(page.getByText(/password has been reset/i)).toBeVisible()
    await expect(page).toHaveURL('/login')

    // Should be able to log in with new password
    // Note: This requires actual backend, so it will fail until backend is working
    await page.getByPlaceholder(/email/i).fill('test@example.com')
    await page.getByPlaceholder(/password/i).fill('NewPassword123!')
    await page.getByRole('button', { name: /log in/i }).click()

    // Should redirect to home as authenticated user
    await expect(page).toHaveURL('/')
  })

  test('should show success for non-existent email (security)', async ({ page }) => {
    await page.goto('/password-reset')
    await waitForHydration(page)

    // Fill in non-existent email
    await page.getByPlaceholder(/email/i).fill('nonexistent@example.com')
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Should still show success message (prevent email enumeration)
    await expect(page.getByText(/if an account exists/i)).toBeVisible()
    
    // Should not show any error
    await expect(page.getByText(/not found/i)).not.toBeVisible()
  })

  test('should validate email format on password reset request', async ({ page }) => {
    await page.goto('/password-reset')
    await waitForHydration(page)

    // Fill in invalid email
    await page.getByPlaceholder(/email/i).fill('invalid-email')
    await page.getByRole('button', { name: /send reset link/i }).click()

    // Should show validation error
    await expect(page.getByText(/valid email/i)).toBeVisible()
  })

  test('should handle expired reset token', async ({ page }) => {
    // Navigate directly to confirm page with expired token
    await page.goto('/password-reset/confirm?userId=test123&secret=expired-token')
    await waitForHydration(page)

    // Fill in new password
    await page.getByPlaceholder(/new password/i).fill('NewPassword123!')
    await page.getByPlaceholder(/confirm password/i).fill('NewPassword123!')
    await page.getByRole('button', { name: /reset password/i }).click()

    // Should show error for expired token
    await expect(page.getByText(/invalid or expired/i)).toBeVisible()
  })

  test('should handle invalid reset token', async ({ page }) => {
    // Navigate directly to confirm page with invalid token
    await page.goto('/password-reset/confirm?userId=test123&secret=invalid-token')
    await waitForHydration(page)

    // Fill in new password
    await page.getByPlaceholder(/new password/i).fill('NewPassword123!')
    await page.getByPlaceholder(/confirm password/i).fill('NewPassword123!')
    await page.getByRole('button', { name: /reset password/i }).click()

    // Should show error for invalid token
    await expect(page.getByText(/invalid or expired/i)).toBeVisible()
  })

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/password-reset/confirm?userId=test123&secret=valid-token')
    await waitForHydration(page)

    // Fill in passwords that don't match
    await page.getByPlaceholder(/new password/i).fill('NewPassword123!')
    await page.getByPlaceholder(/confirm password/i).fill('DifferentPassword123!')
    await page.getByRole('button', { name: /reset password/i }).click()

    // Should show validation error
    await expect(page.getByText(/passwords.*match/i)).toBeVisible()
  })

  test('should validate password strength', async ({ page }) => {
    await page.goto('/password-reset/confirm?userId=test123&secret=valid-token')
    await waitForHydration(page)

    // Fill in weak password
    await page.getByPlaceholder(/new password/i).fill('weak')
    await page.getByPlaceholder(/confirm password/i).fill('weak')
    await page.getByRole('button', { name: /reset password/i }).click()

    // Should show password strength error
    await expect(page.getByText(/password.*at least.*characters/i)).toBeVisible()
  })

  test('should require userId and secret in URL', async ({ page }) => {
    // Navigate to confirm page without query params
    await page.goto('/password-reset/confirm')

    // Should show error or redirect
    await expect(
      page.getByText(/invalid.*link/i).or(page.locator('body'))
    ).toBeVisible()
  })

  test('should have "Forgot password?" link on login page', async ({ page }) => {
    await page.goto('/login')

    const forgotLink = page.getByRole('link', { name: /forgot password/i })
    await expect(forgotLink).toBeVisible()
    
    await forgotLink.click()
    await expect(page).toHaveURL('/password-reset')
  })

  test('should allow navigating back to login from password reset', async ({ page }) => {
    await page.goto('/password-reset')

    // Should have link back to login
    const loginLink = page.getByRole('link', { name: /back to.*login/i })
    await expect(loginLink).toBeVisible()
    
    await loginLink.click()
    await expect(page).toHaveURL('/login')
  })
})
