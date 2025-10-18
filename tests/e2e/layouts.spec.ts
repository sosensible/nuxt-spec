import { test, expect } from '@playwright/test'
import {
  navigateAndWait,
  expectTextVisible,
  expectUrl,
  expectHeaderNavigationVisible,
  expectFooterVisible,
  expectAdminSidebarVisible,
} from './utils/helpers'

/**
 * E2E Layout Tests
 * 
 * Tests that layouts render correctly and switch properly between
 * frontend and admin layouts when navigating between sections.
 */

test.describe('Layout Rendering', () => {
  test('should render frontend layout on home page', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Check header is present
    await expectHeaderNavigationVisible(page)
    await expectTextVisible(page, 'Our Site')
    
    // Check main content area
    await expectTextVisible(page, 'Hello World')
    
    // Check footer is present
    await expectFooterVisible(page)
  })

  test('should render frontend layout on info page', async ({ page }) => {
    await navigateAndWait(page, '/info')
    
    // Check header
    await expectHeaderNavigationVisible(page)
    
    // Check main content
    await expectTextVisible(page, 'About Our Platform')
    
    // Check footer
    await expectFooterVisible(page)
  })

  test('should render admin layout on admin pages', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Check admin header
    await expectTextVisible(page, 'Admin Panel')
    
    // Check admin sidebar
    await expectAdminSidebarVisible(page)
    
    // Check main content heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should switch from frontend to admin layout', async ({ page }) => {
    // Start on frontend
    await navigateAndWait(page, '/')
    await expectHeaderNavigationVisible(page)
    await expectFooterVisible(page)
    
    // Navigate to admin
    await navigateAndWait(page, '/admin')
    
    // Verify admin layout
    await expectUrl(page, '/admin')
    await expectTextVisible(page, 'Admin Panel')
    await expectAdminSidebarVisible(page)
  })

  test('should switch from admin to frontend layout', async ({ page }) => {
    // Start on admin
    await navigateAndWait(page, '/admin')
    await expectTextVisible(page, 'Admin Panel')
    await expectAdminSidebarVisible(page)
    
    // Navigate to frontend
    await navigateAndWait(page, '/')
    
    // Verify frontend layout
    await expectUrl(page, '/')
    await expectHeaderNavigationVisible(page)
    await expectFooterVisible(page)
    await expectTextVisible(page, 'Hello World')
  })

  test('should maintain admin layout when navigating between admin pages', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Verify admin layout on dashboard
    await expectTextVisible(page, 'Admin Panel')
    await expectAdminSidebarVisible(page)
    
    // Navigate to users page via sidebar (more specific)
    await page.locator('aside').getByRole('link', { name: 'Users' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify admin layout persists
    await expectUrl(page, '/admin/users')
    await expectTextVisible(page, 'Admin Panel')
    await expectAdminSidebarVisible(page)
    
    // Navigate back to dashboard via sidebar
    await page.locator('aside').getByRole('link', { name: 'Dashboard' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify admin layout still present
    await expectUrl(page, '/admin')
    await expectTextVisible(page, 'Admin Panel')
    await expectAdminSidebarVisible(page)
  })

  test('should maintain frontend layout when navigating between frontend pages', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Verify frontend layout on home
    await expectHeaderNavigationVisible(page)
    await expectFooterVisible(page)
    
    // Navigate to info via header navigation
    await page.getByRole('navigation').getByRole('link', { name: 'Info' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify frontend layout persists
    await expectUrl(page, '/info')
    await expectHeaderNavigationVisible(page)
    await expectFooterVisible(page)
    
    // Navigate back to home via header navigation
    await page.getByRole('navigation').getByRole('link', { name: 'Home' }).click()
    await page.waitForLoadState('networkidle')
    
    // Verify frontend layout still present
    await expectUrl(page, '/')
    await expectHeaderNavigationVisible(page)
    await expectFooterVisible(page)
  })

  test('should display logo in frontend header', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Check logo link is visible
    const logoLink = page.getByRole('link', { name: /N Our Site/ })
    await expect(logoLink).toBeVisible()
  })

  test('should display footer sections on frontend', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Check all footer sections
    await expectTextVisible(page, 'Quick Links')
    await expectTextVisible(page, 'Contact')
    await expectTextVisible(page, 'Building something amazing together')
    await expectTextVisible(page, '© 2025')
  })

  test('should not show footer on admin pages', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Admin should have sidebar
    await expectAdminSidebarVisible(page)
    
    // Footer should not exist (no contentinfo role)
    const footer = page.getByRole('contentinfo')
    await expect(footer).not.toBeVisible()
  })

  test('should show admin sidebar on all admin pages', async ({ page }) => {
    // Check on admin dashboard
    await navigateAndWait(page, '/admin')
    await expectAdminSidebarVisible(page)
    
    // Check on admin users
    await navigateAndWait(page, '/admin/users')
    await expectAdminSidebarVisible(page)
  })
})
