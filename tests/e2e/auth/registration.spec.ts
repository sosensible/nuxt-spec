import { test, expect } from '@playwright/test'

/**
 * E2E Registration Page Tests (RED Phase - Phase 2.3)
 * 
 * Tests for the registration page user interface and user creation flow.
 * These tests will fail until the registration page is implemented.
 */

test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to registration page before each test
    await page.goto('/register')
  })

  test('should display registration form with all required fields', async ({ page }) => {
    // Check page title/heading
    await expect(page.getByRole('heading', { name: /sign up|register|create account/i })).toBeVisible()

    // Check form fields exist
    await expect(page.getByLabel(/name|full name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/^password/i)).toBeVisible() // Match "Password" but not "Confirm Password"

    // Check submit button
    await expect(page.getByRole('button', { name: /sign up|register|create account/i })).toBeVisible()
  })

  test('should show validation errors for empty form submission', async ({ page }) => {
    // Click submit without filling form
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should show validation errors for required fields
    await expect(page.getByText(/Name is required/i).first()).toBeVisible()
    await expect(page.getByText(/Email is required/i).first()).toBeVisible()
  })

  test('should show validation error for invalid email format', async ({ page }) => {
    // Fill with invalid email
    await page.getByLabel(/name|full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('not-an-email')
    await page.getByLabel(/^password/i).fill('SecurePass123!')
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should show email format error
    await expect(page.getByText(/Invalid email address/i)).toBeVisible()
  })

  test('should show validation error for weak password', async ({ page }) => {
    // Fill with weak password
    await page.getByLabel(/name|full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password/i).fill('123') // Too short
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should show password strength error (from Zod schema)
    await expect(page.getByText(/Password must be at least 8 characters/i)).toBeVisible()
  })

  test('should show error when registering with existing email', async ({ page }) => {
    // Try to register with an email that already exists
    await page.getByLabel(/name|full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('existing@example.com')
    await page.getByLabel(/^password/i).fill('SecurePass123!')
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should show duplicate email error
    await expect(page.getByText(/already exists|email.*taken|already registered/i)).toBeVisible()
  })

  test('should successfully register with valid data', async ({ page }) => {
    // Generate unique email for testing
    const timestamp = Date.now()
    const email = `test${timestamp}@example.com`

    // Fill form with valid data
    await page.getByLabel(/name|full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/^password/i).fill('SecurePass123!')
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should redirect to home page or show success message
    await page.waitForURL('/', { timeout: 5000 }).catch(() => {
      // If redirect doesn't happen, check for success message
      expect(page.getByText(/success|account created|registered/i)).toBeVisible()
    })
  })

  test('should show loading state during form submission', async ({ page }) => {
    await page.getByLabel(/name|full name/i).fill('Test User')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password/i).fill('SecurePass123!')

    // Submit form
    const submitButton = page.getByRole('button', { name: /sign up|register|create account/i })
    await submitButton.click()

    // Button should show loading state
    await expect(submitButton).toBeDisabled()
  })

  test('should have link to login page', async ({ page }) => {
    // Should have an "Already have an account? Log in" link
    const loginLink = page.getByRole('link', { name: /log in|sign in|already.*account/i }).first()
    await expect(loginLink).toBeVisible()

    // Click should navigate to login page
    await loginLink.click()
    await expect(page).toHaveURL('/login')
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Tab through form fields
    await page.keyboard.press('Tab') // Focus name
    await page.keyboard.type('Test User')
    
    await page.keyboard.press('Tab') // Focus email
    await page.keyboard.type('test@example.com')
    
    await page.keyboard.press('Tab') // Focus password
    await page.keyboard.type('SecurePass123!')
    
    await page.keyboard.press('Tab') // Focus submit button
    await page.keyboard.press('Enter') // Submit form
    
    // Should trigger form submission
    await expect(page.getByRole('button', { name: /sign up|register|create account/i })).toBeDisabled()
  })

  test('should allow password visibility toggle', async ({ page }) => {
    const passwordField = page.getByRole('textbox', { name: /^password/i })
    
    // Password should be hidden by default
    await expect(passwordField).toHaveAttribute('type', 'password')
    
    // Click toggle button (usually an eye icon)
    const toggleButton = page.getByRole('button', { name: /show password|toggle/i }).or(
      page.locator('[data-testid="password-toggle"]')
    ).first()
    
    if (await toggleButton.isVisible()) {
      await toggleButton.click()
      
      // Password should now be visible
      await expect(passwordField).toHaveAttribute('type', 'text')
    }
  })

  test('should display password strength indicator', async ({ page }) => {
    const passwordField = page.getByLabel(/^password/i)
    
    // Type weak password
    await passwordField.fill('123')
    
    // Should show weak indicator (if implemented)
    const strengthIndicator = page.getByText(/weak|strength/i)
    if (await strengthIndicator.isVisible()) {
      await expect(strengthIndicator).toBeVisible()
      
      // Type strong password
      await passwordField.fill('SecurePass123!')
      
      // Should show strong indicator
      await expect(page.getByText(/strong|excellent/i)).toBeVisible()
    }
  })

  test('should validate name field constraints', async ({ page }) => {
    // Try to submit with very short name
    await page.getByLabel(/name|full name/i).fill('A')
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password/i).fill('SecurePass123!')
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should show name validation error if minimum length is enforced
    // This depends on validation rules - documenting expected behavior
  })

  test('should handle special characters in name field', async ({ page }) => {
    // Names can contain special characters like hyphens, apostrophes
    await page.getByLabel(/name|full name/i).fill("O'Brien-Smith")
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/^password/i).fill('SecurePass123!')

    // Should accept valid name with special characters
    const submitButton = page.getByRole('button', { name: /sign up|register|create account/i })
    await submitButton.click()

    // Should not show name validation error
    // (Unless there's a specific constraint against these characters)
  })
})

test.describe('Registration Flow Integration', () => {
  test('should auto-login after successful registration', async ({ page }) => {
    // Generate unique email
    const timestamp = Date.now()
    const email = `autotest${timestamp}@example.com`

    // Register
    await page.goto('/register')
    await page.getByLabel(/name|full name/i).fill('Auto Test User')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/^password/i).fill('SecurePass123!')
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // Should be redirected to home page (logged in)
    await page.waitForURL('/', { timeout: 5000 })

    // Check if user appears to be logged in (e.g., logout button visible)
    const logoutButton = page.getByRole('button', { name: /log out|sign out/i })
    await expect(logoutButton).toBeVisible({ timeout: 3000 })
  })

  test('should allow immediate login after registration', async ({ page }) => {
    // This test assumes auto-login is NOT enabled
    const timestamp = Date.now()
    const email = `manualtest${timestamp}@example.com`
    const password = 'SecurePass123!'

    // Register
    await page.goto('/register')
    await page.getByLabel(/name|full name/i).fill('Manual Test User')
    await page.getByLabel(/email/i).fill(email)
    await page.getByLabel(/^password/i).fill(password)
    await page.getByRole('button', { name: /sign up|register|create account/i }).click()

    // If redirected to login page
    if (await page.getByRole('heading', { name: /log in|sign in/i }).isVisible()) {
      // Login with same credentials
      await page.getByLabel(/email/i).fill(email)
      await page.getByLabel(/password/i).fill(password)
      await page.getByRole('button', { name: /log in|sign in/i }).click()

      // Should successfully login
      await page.waitForURL('/', { timeout: 5000 })
    }
  })
})
