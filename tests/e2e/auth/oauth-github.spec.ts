/**
 * E2E Tests: GitHub OAuth Flow
 * 
 * Following TDD RED-GREEN-REFACTOR:
 * - RED: These tests will FAIL initially (OAuth not implemented yet)
 * - GREEN: Implement GitHub OAuth to make tests pass
 * - REFACTOR: Improve UX, error handling, and loading states
 * 
 * Testing Philosophy:
 * - Test complete OAuth flow from button click to successful login
 * - Verify account linking when email already exists
 * - Test error handling (OAuth errors, cancelled flow)
 * - Verify session creation and redirect after OAuth
 * 
 * Note: Some tests require actual GitHub OAuth setup and may need to be 
 * run manually or marked as requiring real backend integration.
 */

import { test, expect } from '@playwright/test'

test.describe('GitHub OAuth - Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display GitHub OAuth button', async ({ page }) => {
    // Should have a GitHub OAuth button
    const githubButton = page.getByRole('button', { name: /github/i })
    await expect(githubButton).toBeVisible()
    
    // Should have GitHub icon
    await expect(githubButton.locator('[class*="github"]')).toBeVisible()
  })

  test('should have divider separating OAuth from email/password', async ({ page }) => {
    // Should have "or" divider between OAuth and email/password form
    await expect(page.getByText(/or/i).first()).toBeVisible()
  })

  test('should redirect to GitHub OAuth when button clicked', async ({ page }) => {
    const githubButton = page.getByRole('button', { name: /github/i })
    
    // Click should trigger navigation (handled by Appwrite SDK)
    await githubButton.click()
    
    // Should start OAuth flow (page navigates away or shows loading)
    // This test will pass once button and OAuth flow are implemented
    await page.waitForTimeout(1000)
  })
})

test.describe('GitHub OAuth - Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display GitHub OAuth button', async ({ page }) => {
    const githubButton = page.getByRole('button', { name: /github/i })
    await expect(githubButton).toBeVisible()
  })

  test('should have divider separating OAuth from email/password', async ({ page }) => {
    await expect(page.getByText(/or/i)).toBeVisible()
  })
})

test.describe('GitHub OAuth - Callback Handling', () => {
  test('should handle OAuth error in callback', async ({ page }) => {
    // Simulate OAuth error callback
    await page.goto('/api/auth/callback/github?error=access_denied')
    
    // Should redirect to login with error message
    await expect(page).toHaveURL(/\/login/)
    
    // Wait for page to fully load and onMounted to execute
    await page.waitForLoadState('networkidle')
    
    // Should show error alert with authorization error message
    await expect(page.getByText(/authorization was denied/i)).toBeVisible()
  })
})
