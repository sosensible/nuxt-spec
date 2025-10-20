import { test, expect } from '@playwright/test'
import {
  navigateAndWait,
  expectTextVisible,
  clickLinkAndWait,
  expectUrl,
  expectHeaderNavigationVisible,
  expectFooterVisible,
} from './utils/helpers'

/**
 * E2E Navigation Tests
 * 
 * Tests real browser navigation between pages, verifying routing works
 * and that pages display correct content after navigation.
 */

test.describe('Page Navigation', () => {
  test('should load home page with correct content', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Verify we're on home page
    await expectUrl(page, '/')
    
    // Check page content is visible
    await expectTextVisible(page, 'Hello World')
    await expectTextVisible(page, 'This is a test page')
    
    // Check composable test section exists
    await expectTextVisible(page, 'Composable Test')
    await expectTextVisible(page, 'Layout Type:')
  })

  test('should navigate to info page via header link', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Click Info link in header
    await clickLinkAndWait(page, 'Info')
    
    // Verify navigation happened
    await expectUrl(page, '/info')
    
    // Verify info page content
    await expectTextVisible(page, 'About Our Platform')
    await expectTextVisible(page, 'Our Mission')
    await expectTextVisible(page, 'Our Core Values')
  })

  test('should navigate back to home from info page', async ({ page }) => {
    await navigateAndWait(page, '/info')
    
    // Click Home link in header navigation (not footer)
    const nav = page.getByRole('navigation')
    await nav.getByRole('link', { name: 'Home' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify we're back on home page
    await expectUrl(page, '/')
    await expectTextVisible(page, 'Hello World')
  })

  test('should display header navigation on all pages', async ({ page }) => {
    // Check home page
    await navigateAndWait(page, '/')
    await expectHeaderNavigationVisible(page)
    
    // Check info page
    await navigateAndWait(page, '/info')
    await expectHeaderNavigationVisible(page)
  })

  test('should display footer on frontend pages', async ({ page }) => {
    // Check home page footer
    await navigateAndWait(page, '/')
    await expectFooterVisible(page)
    
    // Check info page footer
    await navigateAndWait(page, '/info')
    await expectFooterVisible(page)
  })

  test('should navigate to admin pages', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Verify admin dashboard loads
    await expectUrl(page, '/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expectTextVisible(page, 'Total Users')
    await expectTextVisible(page, 'Revenue')
  })

  test('should navigate to admin users page', async ({ page }) => {
    await navigateAndWait(page, '/admin/users')
    
    // Verify users page loads
    await expectUrl(page, '/admin/users')
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
    await expect(page.getByPlaceholder('Search users...')).toBeVisible()
    await expectTextVisible(page, 'John Doe')
  })

  test('should navigate between admin pages', async ({ page }) => {
    // Start at admin dashboard
    await navigateAndWait(page, '/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Click Users link in sidebar (exact match)
    await page.getByRole('link', { name: 'Users', exact: true }).click()
    await page.waitForLoadState('networkidle')
    await expectUrl(page, '/admin/users')
    await expect(page.getByPlaceholder('Search users...')).toBeVisible()
    
    // Click Dashboard in sidebar (exact match)
    await page.getByRole('link', { name: 'Dashboard', exact: true }).click()
    await page.waitForLoadState('networkidle')
    await expectUrl(page, '/admin')
    await expectTextVisible(page, 'Total Users')
  })

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate through pages
    await navigateAndWait(page, '/')
    await clickLinkAndWait(page, 'Info')
    await expectUrl(page, '/info')
    
    // Go back
    await page.goBack()
    await expectUrl(page, '/')
    await expectTextVisible(page, 'Hello World')
    
    // Go forward
    await page.goForward()
    await expectUrl(page, '/info')
    await expectTextVisible(page, 'About Our Platform')
  })

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to info page (not via click)
    await navigateAndWait(page, '/info')
    await expectTextVisible(page, 'About Our Platform')
    
    // Navigate directly to admin
    await navigateAndWait(page, '/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Navigate directly to admin users
    await navigateAndWait(page, '/admin/users')
    await expectTextVisible(page, 'John Doe')
  })
})

/**
 * Cross-Section Navigation Tests (Feature 002-basic-usability-i, User Story 2)
 * 
 * Tests navigation between frontend and admin sections via header links.
 * This is where we test actual routing behavior that can't be tested in unit tests.
 */
test.describe('Cross-Section Navigation', () => {
  test('should display Admin Panel link in frontend header', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Admin Panel link should be visible in header
    const adminLink = page.getByRole('link', { name: 'Admin Panel' })
    await expect(adminLink).toBeVisible()
  })

  test('should navigate from frontend to admin via header link', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Click Admin Panel link
    await page.getByRole('link', { name: 'Admin Panel' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify we're now in admin section
    await expectUrl(page, '/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Verify admin layout is applied (sidebar should be visible)
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Users', exact: true })).toBeVisible()
  })

  test('should display View Site link in admin header', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // View Site link should be visible in header
    const viewSiteLink = page.getByRole('link', { name: 'View Site' })
    await expect(viewSiteLink).toBeVisible()
  })

  test('should navigate from admin to frontend via header link', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Click View Site link
    await page.getByRole('link', { name: 'View Site' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify we're now in frontend section
    await expectUrl(page, '/')
    await expectTextVisible(page, 'Hello World')
    
    // Verify frontend layout is applied (footer should be visible, sidebar should not)
    await expectFooterVisible(page)
    await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).not.toBeVisible()
  })

  test('should show correct link based on current section', async ({ page }) => {
    // In frontend, should show Admin Panel link
    await navigateAndWait(page, '/')
    await expect(page.getByRole('link', { name: 'Admin Panel' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'View Site' })).not.toBeVisible()
    
    // In admin, should show View Site link
    await navigateAndWait(page, '/admin')
    await expect(page.getByRole('link', { name: 'View Site' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Admin Panel' })).not.toBeVisible()
  })

  test('should complete cross-section navigation quickly', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Measure navigation time from frontend to admin
    const startTime = Date.now()
    await page.getByRole('link', { name: 'Admin Panel' }).click()
    await page.waitForLoadState('networkidle')
    const navigationTime = Date.now() - startTime
    
    // Navigation should complete in under 500ms (reasonable for SPA)
    expect(navigationTime).toBeLessThan(500)
    await expectUrl(page, '/admin')
  })

  test('should navigate from admin subpage to frontend', async ({ page }) => {
    // Start on admin users page (not dashboard)
    await navigateAndWait(page, '/admin/users')
    
    // Click View Site link
    await page.getByRole('link', { name: 'View Site' }).click()
    await page.waitForLoadState('networkidle')
    
    // Should navigate to frontend home
    await expectUrl(page, '/')
    await expectTextVisible(page, 'Hello World')
  })

  test('should navigate from frontend subpage to admin', async ({ page }) => {
    // Start on frontend info page (not home)
    await navigateAndWait(page, '/info')
    
    // Click Admin Panel link
    await page.getByRole('link', { name: 'Admin Panel' }).click()
    await page.waitForLoadState('networkidle')
    
    // Should navigate to admin dashboard
    await expectUrl(page, '/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })
})

