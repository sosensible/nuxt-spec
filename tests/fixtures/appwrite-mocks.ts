/**
 * Appwrite API Mock Fixtures for E2E Tests
 * 
 * Provides mock responses for Appwrite API endpoints to enable
 * E2E testing without requiring a live Appwrite instance.
 * 
 * These mocks simulate successful and error responses for:
 * - User registration
 * - Login/logout
 * - Session management
 * - Password reset
 * - Email verification
 * - GitHub OAuth
 */

import type { Page, Route } from '@playwright/test'

/**
 * Mock user data for testing
 */
export const mockUser = {
  $id: 'test-user-123',
  $createdAt: '2025-10-20T10:00:00.000Z',
  $updatedAt: '2025-10-20T10:00:00.000Z',
  name: 'Test User',
  email: 'test@example.com',
  emailVerification: true,
  status: true,
  labels: [],
  prefs: {}
}

export const mockUnverifiedUser = {
  ...mockUser,
  $id: 'test-user-unverified',
  email: 'unverified@example.com',
  emailVerification: false
}

/**
 * Mock session data
 */
export const mockSession = {
  $id: 'test-session-123',
  $createdAt: '2025-10-20T10:00:00.000Z',
  userId: mockUser.$id,
  expire: '2025-11-03T10:00:00.000Z',
  provider: 'email',
  providerUid: mockUser.email,
  providerAccessToken: '',
  providerAccessTokenExpiry: '',
  providerRefreshToken: '',
  ip: '127.0.0.1',
  osCode: 'WIN',
  osName: 'Windows',
  osVersion: '10',
  clientType: 'browser',
  clientCode: 'CH',
  clientName: 'Chrome',
  clientVersion: '120.0',
  clientEngine: 'Blink',
  clientEngineVersion: '120.0',
  deviceName: 'desktop',
  deviceBrand: '',
  deviceModel: '',
  countryCode: 'US',
  countryName: 'United States',
  current: true
}

/**
 * Setup Appwrite API mocks for a page
 * 
 * @param page - Playwright page instance
 * @param options - Mock configuration options
 */
export async function setupAppwriteMocks(
  page: Page,
  options: {
    authenticated?: boolean
    emailVerified?: boolean
    user?: typeof mockUser
  } = {}
) {
  const { authenticated = false, emailVerified = true, user = mockUser } = options

  const activeUser = emailVerified ? user : { ...user, emailVerification: false }

  // Mock session endpoint
  await page.route('**/api/auth/session', async (route: Route) => {
    if (authenticated) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: activeUser, session: mockSession })
      })
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'No active session' })
      })
    }
  })

  // Mock login endpoint
  await page.route('**/api/auth/login', async (route: Route) => {
    const request = route.request()
    const postData = request.postDataJSON()

    // Simulate login validation
    if (postData.email === 'test@example.com' && postData.password === 'password123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: activeUser, session: mockSession })
      })
    } else if (postData.email === 'unverified@example.com' && postData.password === 'password123') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: mockUnverifiedUser, session: mockSession })
      })
    } else {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      })
    }
  })

  // Mock registration endpoint
  await page.route('**/api/auth/register', async (route: Route) => {
    const request = route.request()
    const postData = request.postDataJSON()

    // Simulate duplicate email check
    if (postData.email === 'existing@example.com') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'A user with the same email already exists' })
      })
    } else {
      const newUser = {
        ...mockUnverifiedUser,
        $id: `user-${Date.now()}`,
        email: postData.email,
        name: postData.name,
        emailVerification: false
      }
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ user: newUser, session: { ...mockSession, userId: newUser.$id } })
      })
    }
  })

  // Mock logout endpoint
  await page.route('**/api/auth/logout', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true })
    })
  })

  // Mock password reset request endpoint
  await page.route('**/api/auth/password-reset', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Password reset email sent' })
    })
  })

  // Mock password reset confirm endpoint
  await page.route('**/api/auth/password-reset/confirm', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const token = url.searchParams.get('token')

    if (token === 'valid-reset-token') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid or expired reset token' })
      })
    }
  })

  // Mock email verification endpoint
  await page.route('**/api/auth/verify-email', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const token = url.searchParams.get('token')

    if (token === 'valid-verification-token') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid or expired verification token' })
      })
    }
  })

  // Mock email verification resend endpoint
  await page.route('**/api/auth/verify-email/resend', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, message: 'Verification email sent' })
    })
  })

  // Mock GitHub OAuth callback endpoint
  await page.route('**/api/auth/callback/github**', async (route: Route) => {
    const request = route.request()
    const url = new URL(request.url())
    const code = url.searchParams.get('code')

    if (code === 'valid-github-code') {
      const githubUser = {
        ...mockUser,
        $id: 'github-user-123',
        email: 'github@example.com',
        name: 'GitHub User',
        labels: ['oauth:github'],
        prefs: { avatar: 'https://avatars.githubusercontent.com/u/1234567' }
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: githubUser, session: mockSession })
      })
    } else {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'OAuth authentication failed' })
      })
    }
  })
}

/**
 * Setup authenticated session for tests
 * 
 * This function logs in a test user using the REAL Appwrite backend.
 * Mocks cannot create real session cookies that server-side middleware can read.
 * 
 * IMPORTANT: This requires actual Appwrite credentials (test@example.com / password123)
 * to exist in your Appwrite project.
 * 
 * @param page - Playwright page instance
 * @param _user - User data (NOT USED - real backend is called)
 */
export async function setupAuthenticatedSession(
  page: Page,
  _user: typeof mockUser = mockUser
) {
  // DO NOT set up mocks - we need real Appwrite to set session cookies
  
  // Navigate to login page
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  
  // Wait for Vue hydration (CRITICAL: forms won't work without this)
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(2000)
  
  // Perform actual login with REAL Appwrite backend
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Wait for login to complete and redirect to home
  await page.waitForURL('/', { timeout: 10000 })
  
  // Verify cookies were set
  const cookies = await page.context().cookies()
  if (cookies.length === 0) {
    throw new Error('[setupAuthenticatedSession] No cookies set after login - authentication failed')
  }
  
  // Session cookie is now set by real Appwrite
  // Middleware will be able to read it
}

/**
 * Clear authentication session
 * 
 * @param page - Playwright page instance
 */
export async function clearAuthSession(page: Page) {
  await setupAppwriteMocks(page, { authenticated: false })
  await page.context().clearCookies()
}
