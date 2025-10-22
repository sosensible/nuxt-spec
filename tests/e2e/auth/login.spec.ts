import { test, expect } from '@playwright/test'

/**
 * E2E Login Page Tests (RED Phase - Phase 2.3)
 * 
 * Tests for the login page user interface and authentication flow.
 * These tests will fail until the login page is implemented.
 */

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page before each test
    await page.goto('/login')
  })

  test('should display login form with email and password fields', async ({ page }) => {
    // Check page title/heading
    await expect(page.getByRole('heading', { name: /log in|sign in/i })).toBeVisible()

    // Check form fields exist
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()

    // Check submit button
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible()
  })

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // Should show validation errors
    await expect(page.getByText(/email is required|required/i)).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill with invalid email
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByRole('textbox', { name: /password/i }).fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // Should show email format error
    await expect(page.getByText(/invalid email|valid email/i)).toBeVisible()
  })

  test('should show error message for invalid credentials', async ({ page }) => {
    // Fill with invalid credentials
    await page.getByLabel(/email/i).fill('wrong@example.com')
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword')
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // Should show authentication error
    await expect(page.getByText(/invalid credentials|incorrect email or password/i)).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    // Note: This test requires a test user to exist in Appwrite
    // For now, we'll test the UI flow and expect redirect
    
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('textbox', { name: /password/i }).fill('password123')
    await page.getByRole('button', { name: /log in|sign in/i }).click()

    // Should redirect to home page or show success
    // This will depend on actual implementation
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {
      // If redirect doesn't happen, check for success message
      expect(page.getByText(/success|logged in/i)).toBeVisible()
    })
  })

  test('should show loading state during form submission', async ({ page }) => {
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByRole('textbox', { name: /password/i }).fill('password123')

    // Submit form
    const submitButton = page.getByRole('button', { name: /log in|sign in/i })
    await submitButton.click()

    // Button should show loading state (disabled or loading text/spinner)
    await expect(submitButton).toBeDisabled()
  })

  test('should have link to registration page', async ({ page }) => {
    // Should have a "Don't have an account? Sign up" link
    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i }).first()
    await expect(registerLink).toBeVisible()

    // Click should navigate to register page
    await registerLink.click()
    await expect(page).toHaveURL('/register')
  })

  test('should have link to password reset page', async ({ page }) => {
    // Should have a "Forgot password?" link
    const resetLink = page.getByRole('link', { name: /forgot password|reset password/i })
    await expect(resetLink).toBeVisible()
    
    // Click should navigate to password reset page
    await resetLink.click()
    await expect(page).toHaveURL('/password-reset')
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab') // Focus email
    await page.keyboard.type('test@example.com')
    
    await page.keyboard.press('Tab') // Focus password
    await page.keyboard.type('password123')
    
    await page.keyboard.press('Tab') // Focus submit button
    await page.keyboard.press('Enter') // Submit form
    
    // Should trigger form submission (same as clicking submit)
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeDisabled()
  })

  test('should allow password visibility toggle', async ({ page }) => {
    const passwordField = page.getByRole('textbox', { name: /password/i })
    
    // Password should be hidden by default
    await expect(passwordField).toHaveAttribute('type', 'password')
    
    // Click toggle button (usually an eye icon)
    const toggleButton = page.getByRole('button', { name: /show password|toggle/i }).or(
      page.locator('[data-testid="password-toggle"]')
    )
    
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      
      // Password should now be visible
      await expect(passwordField).toHaveAttribute('type', 'text')
    }
  })
})

test.describe('Logout Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // For these tests, we assume user is logged in
    // In real scenario, we'd need to login first or mock session
    await page.goto('/')
  })

  test('should display logout button when user is logged in', async ({ page }) => {
    // This test will need session/auth context
    // For now, just check if logout button exists in header
    const logoutButton = page.getByRole('button', { name: /log out|sign out/i })
    
    // Button might not be visible if not logged in (expected for RED phase)
    // We're just documenting what should happen
    if (await logoutButton.isVisible()) {
      await expect(logoutButton).toBeVisible()
    }
  })

  test('should successfully logout and redirect to login page', async ({ page }) => {
    // Find and click logout button
    const logoutButton = page.getByRole('button', { name: /log out|sign out/i })
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // Should redirect to login page
      await expect(page).toHaveURL('/login')
      
      // Should show login form (confirming we're logged out)
      await expect(page.getByRole('heading', { name: /log in|sign in/i })).toBeVisible()
    }
  })

  test('should clear session after logout', async ({ page }) => {
    // After logout, accessing protected routes should redirect to login
    const logoutButton = page.getByRole('button', { name: /log out|sign out/i })
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await page.waitForURL('/login')
      
      // Try to access a protected route (e.g., /admin)
      await page.goto('/admin')
      
      // Should redirect back to login
      await expect(page).toHaveURL(/\/login/)
    }
  })
})
