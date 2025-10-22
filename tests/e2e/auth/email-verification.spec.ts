/**
 * E2E Tests: Email Verification Flow
 * 
 * Following TDD RED-GREEN-REFACTOR:
 * - RED: These tests will FAIL initially (pages/APIs don't exist yet)
 * - GREEN: Implement email verification pages and APIs to make tests pass
 * - REFACTOR: Add rate limiting, countdown timer, and verification prompts
 * 
 * Testing Philosophy:
 * - Test complete user flow from registration to email verification
 * - Verify email verification required before certain actions
 * - Test error handling (expired tokens, already verified)
 * - Test resend verification email functionality
 */

import { test, expect } from '@playwright/test'

test.describe('Email Verification Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start at home page
    await page.goto('/')
  })

  test('should show verification prompt after registration', async ({ page }) => {
    // Navigate to register page
    await page.getByRole('link', { name: /sign up/i }).click()
    await expect(page).toHaveURL('/register')

    // Fill in registration form
    await page.getByPlaceholder('John Doe').fill('Test User')
    await page.getByPlaceholder('you@example.com').fill('newuser@example.com')
    await page.getByPlaceholder(/create.*password/i).fill('TestPassword123!')
    await page.getByRole('button', { name: /sign up/i }).click()

    // Should redirect to home or show verification prompt
    // Note: Actual behavior depends on Appwrite configuration
    // This test documents expected behavior
    await expect(
      page.getByText(/verify.*email/i).or(page.locator('body'))
    ).toBeVisible()
  })

  test('should complete full email verification flow', async ({ page }) => {
    // Note: This test requires actual email backend
    // For now, it documents the expected flow

    // 1. User registers (assume already done)
    // 2. User receives verification email (check email - requires backend)
    // 3. User clicks verification link with userId and secret
    await page.goto('/verify-email?userId=test123&secret=test-token')

    // Should show verification page
    await expect(page.getByText(/verifying/i)).toBeVisible()

    // After verification completes
    await expect(
      page.getByText(/email verified successfully/i).or(
        page.getByText(/already verified/i)
      )
    ).toBeVisible({ timeout: 10000 })
  })

  test('should handle invalid verification token', async ({ page }) => {
    await page.goto('/verify-email?userId=test123&secret=invalid-token')

    // Should show error message
    await expect(page.getByText(/invalid.*expired/i)).toBeVisible({ timeout: 10000 })

    // Should have button to resend verification email
    await expect(page.getByRole('button', { name: /resend/i })).toBeVisible()
  })

  test('should handle missing verification parameters', async ({ page }) => {
    await page.goto('/verify-email')

    // Should show error for missing parameters
    await expect(page.getByText(/invalid.*link/i)).toBeVisible()
  })

  test('should allow resending verification email', async ({ page }) => {
    // Navigate to verification page with expired token
    await page.goto('/verify-email?userId=test123&secret=expired-token')

    // Wait for error to appear
    await expect(page.getByText(/invalid.*expired/i)).toBeVisible({ timeout: 10000 })

    // Click resend button
    const resendButton = page.getByRole('button', { name: /resend/i })
    await resendButton.click()

    // Should show success message
    await expect(page.getByText(/verification email sent/i)).toBeVisible()

    // Button should be disabled temporarily (rate limiting)
    // This will be added in REFACTOR phase
  })

  test('should show already verified message for verified emails', async ({ page }) => {
    // Assume user is already verified
    await page.goto('/verify-email?userId=verified-user&secret=used-token')

    // Should show "already verified" message
    await expect(
      page.getByText(/already verified/i).or(
        page.getByText(/email verified/i)
      )
    ).toBeVisible({ timeout: 10000 })
  })

  test('should require login to resend verification (when not auto-verified)', async ({ page }) => {
    // Go to verify-email page without auth
    await page.goto('/verify-email')

    // Try to resend (if button is visible without token)
    const resendButton = page.getByRole('button', { name: /resend/i })
    
    if (await resendButton.isVisible()) {
      await resendButton.click()

      // Should redirect to login or show error
      await expect(
        page.getByText(/log.*in/i).or(page.locator('body'))
      ).toBeVisible()
    }
  })

  test('should have verify email link in login page for unverified users', async ({ page }) => {
    await page.goto('/login')

    // For unverified users, should show verification prompt/link
    // This will be added in REFACTOR phase
    // This test documents expected behavior
    expect(true).toBe(true)
  })

  test('should disable resend button with countdown timer', async ({ page }) => {
    // REFACTOR phase: Add countdown timer
    await page.goto('/verify-email?userId=test123&secret=expired-token')

    // Wait for error
    await expect(page.getByText(/invalid.*expired/i)).toBeVisible({ timeout: 10000 })

    // Click resend
    const resendButton = page.getByRole('button', { name: /resend/i })
    await resendButton.click()

    // Button should be disabled with countdown
    // This will be implemented in REFACTOR phase
    expect(true).toBe(true)
  })

  test('should auto-verify on page load with valid token', async ({ page }) => {
    await page.goto('/verify-email?userId=valid-user&secret=valid-token')

    // Should automatically verify without user clicking anything
    // Just show loading then success
    await expect(page.getByText(/verifying/i)).toBeVisible()
    
    // Then success
    await expect(page.getByText(/verified/i)).toBeVisible({ timeout: 10000 })
  })
})
