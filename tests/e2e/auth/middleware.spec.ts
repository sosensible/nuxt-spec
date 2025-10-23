import { test, expect } from '@playwright/test'
import { setupAppwriteMocks, setupAuthenticatedSession, clearAuthSession } from '../../fixtures/appwrite-mocks'
import { waitForHydration } from '../../helpers/hydration'

// TODO: Middleware tests require real Appwrite backend with actual session cookies
// Mocks cannot create httpOnly cookies that server-side middleware can read
// Re-enable these tests once we have a test Appwrite instance configured
test.describe.skip('Auth Middleware', () => {
  test.beforeEach(async ({ page }) => {
    // Clear session before each test
    await clearAuthSession(page)
  })

  test('should redirect unauthenticated users to login page', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/admin-test')
    
    // Should be redirected to login with returnUrl (not URL-encoded)
    await expect(page).toHaveURL(/\/login\?returnUrl=\/admin-test/)
  })

  test('should preserve return URL when redirecting to login', async ({ page }) => {
    // Try to access a protected page
    await page.goto('/admin-test')
    
    // Should redirect to login with returnUrl query parameter  
    await expect(page).toHaveURL(/\/login\?returnUrl=\/admin-test/)
  })

  test('should allow access to protected pages when authenticated', async ({ page }) => {
    // Setup authenticated session
    await setupAuthenticatedSession(page)
    
    // Now try to access protected page
    await page.goto('/admin-test')
    
    // Should NOT be redirected to login
    await expect(page).toHaveURL('/admin-test')
  })

  test('should redirect to returnUrl after successful login', async ({ page }) => {
    // Setup API mocks
    await setupAppwriteMocks(page, { authenticated: false })
    
    // Try to access protected page (will redirect to login)
    await page.goto('/admin-test')
    await expect(page).toHaveURL(/\/login\?returnUrl=\/admin-test/)
    
    // Wait for hydration
    await waitForHydration(page)
    
    // Now login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect back to the original page
    await expect(page).toHaveURL('/admin-test', { timeout: 5000 })
  })

  test('should handle invalid returnUrl gracefully', async ({ page }) => {
    // Setup API mocks
    await setupAppwriteMocks(page, { authenticated: false })
    
    // Go to login with external returnUrl (potential security issue)
    await page.goto('/login?returnUrl=https://evil.com')
    
    // Wait for hydration
    await waitForHydration(page)
    
    // Login
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Should redirect to home, not external URL
    await expect(page).toHaveURL('/', { timeout: 5000 })
  })

  test('should allow access to public pages without authentication', async ({ page }) => {
    // Navigate to public pages
    await page.goto('/')
    await expect(page).toHaveURL('/')
    
    await page.goto('/info')
    await expect(page).toHaveURL('/info')
    
    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('should protect multiple admin pages', async ({ page }) => {
    const protectedPages = [
      '/admin-test',
      // Add more protected pages as they are created
    ]
    
    for (const pagePath of protectedPages) {
      await page.goto(pagePath)
      await expect(page).toHaveURL(/\/login/)
    }
  })
})

// TODO: Guest middleware tests also require real Appwrite backend
test.describe.skip('Guest Middleware', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.goto('/')
    await page.evaluate(() => {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
    })
  })

  test('should allow unauthenticated users to access login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL('/login')
    
    // Should see login form
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should allow unauthenticated users to access register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page).toHaveURL('/register')
    
    // Should see registration form (using placeholder text which is more reliable with UI components)
    await expect(page.getByPlaceholder('John Doe')).toBeVisible()
    await expect(page.getByPlaceholder('you@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('Create a strong password')).toBeVisible()
  })

  test('should redirect authenticated users away from login page', async ({ page }) => {
    // First, login
    await page.goto('/login')
    
    // Wait for hydration
    await waitForHydration(page)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    // Wait for redirect after login
    await page.waitForURL('/', { timeout: 5000 })
    
    // Now try to access login page again
    await page.goto('/login')
    
    // Should be redirected to home
    await expect(page).toHaveURL('/')
  })

  test('should redirect authenticated users away from register page', async ({ page }) => {
    // First, login
    await page.goto('/login')
    
    // Wait for hydration
    await waitForHydration(page)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    // Wait for redirect after login
    await page.waitForURL('/', { timeout: 5000 })
    
    // Now try to access register page
    await page.goto('/register')
    
    // Should be redirected to home
    await expect(page).toHaveURL('/')
  })

  test('should redirect to custom destination if provided in query', async ({ page }) => {
    // First, login
    await page.goto('/login')
    
    // Wait for hydration
    await waitForHydration(page)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    // Wait for redirect after login
    await page.waitForURL('/', { timeout: 5000 })
    
    // Try to access login with redirect query
    await page.goto('/login?redirect=/info')
    
    // Should be redirected to /info
    await expect(page).toHaveURL('/info')
  })
})
// TODO: These tests require real Appwrite backend with actual session cookies.
// Mocks cannot create httpOnly cookies that server-side middleware can read.
test.describe.skip('Middleware Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session
    await page.goto('/')
    await page.evaluate(() => {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
      })
    })
  })

  test('should maintain session across page navigations', async ({ page }) => {
    // Login
    await page.goto('/login')
    
    // Wait for hydration
    await waitForHydration(page)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/', { timeout: 5000 })
    
    // Navigate to different pages
    await page.goto('/info')
    await expect(page).toHaveURL('/info')
    
    await page.goto('/admin-test')
    await expect(page).toHaveURL('/admin-test')
    
    // Should still have access (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/)
  })

  test('should clear session after logout', async ({ page }) => {
    // Login
    await page.goto('/login')
    
    // Wait for hydration
    await waitForHydration(page)
    
    await page.fill('input[type="email"]', 'test@example.com')
    await page.fill('input[type="password"]', 'Password123!')
    await page.click('button[type="submit"]')
    
    await page.waitForURL('/', { timeout: 5000 })
    
    // Access protected page (should work)
    await page.goto('/admin-test')
    await expect(page).toHaveURL('/admin-test')
    
    // Logout
    await page.click('button:has-text("Logout")')
    await page.waitForURL('/', { timeout: 5000 })
    
    // Try to access protected page again
    await page.goto('/admin-test')
    
    // Should be redirected to login
    await expect(page).toHaveURL(/\/login/)
  })

  test('should handle concurrent middleware checks efficiently', async ({ page }) => {
    // This tests that middleware doesn't cause race conditions
    // by opening multiple tabs/windows
    const context = page.context()
    
    // Open second page in same context (shares cookies)
    const page2 = await context.newPage()
    
    // Both try to access protected page simultaneously
    await Promise.all([
      page.goto('/admin-test'),
      page2.goto('/admin-test')
    ])
    
    // Both should be redirected to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page2).toHaveURL(/\/login/)
    
    await page2.close()
  })
})
