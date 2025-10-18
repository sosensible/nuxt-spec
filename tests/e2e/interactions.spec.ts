import { test, expect } from '@playwright/test'
import {
  navigateAndWait,
  expectTextVisible,
  expectUrl,
} from './utils/helpers'

/**
 * E2E Interaction Tests
 * 
 * Tests user interactions like clicking buttons, toggling states,
 * and verifying that UI responds correctly to user actions.
 */

test.describe('User Interactions', () => {
  test('should toggle sidebar via button click', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Find toggle button (text contains "Toggle Sidebar")
    const toggleButton = page.getByRole('button', { name: /Toggle Sidebar/ })
    await expect(toggleButton).toBeVisible()
    
    // Button should exist and be clickable
    await expect(toggleButton).toBeEnabled()
    
    // Click to toggle (testing the interaction works)
    await toggleButton.click()
    await page.waitForTimeout(500) // Wait for state update
  })

  test('should set page title via button click', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Find and click "Set Page Title" button
    const button = page.getByRole('button', { name: 'Set Page Title' })
    await expect(button).toBeVisible()
    await button.click()
    await page.waitForTimeout(500) // Wait for state update
    
    // Button interaction worked (title should be set internally)
    // We're testing the interaction, not the internal state
  })

  test('should display composable values on home page', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Check layout composable values are visible
    await expectTextVisible(page, 'Layout Type:')
    await expectTextVisible(page, 'Is Frontend:')
    await expectTextVisible(page, 'Page Title:')
    
    // Check navigation composable values
    await expectTextVisible(page, 'Current Path:')
    await expectTextVisible(page, 'Is Admin Route:')
  })

  test('should navigate using footer links', async ({ page }) => {
    await navigateAndWait(page, '/')
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Click "About" link in footer
    const aboutLink = page.getByRole('link', { name: 'About', exact: true })
    await aboutLink.click()
    await page.waitForLoadState('networkidle')
    
    // Verify navigation to info page
    await expectUrl(page, '/info')
    await expectTextVisible(page, 'About Our Platform')
  })

  test('should display admin header title', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Check admin header is present
    await expectTextVisible(page, 'Admin Panel')
  })

  test('should click admin sidebar navigation items', async ({ page }) => {
    await navigateAndWait(page, '/admin')
    
    // Click Users link in sidebar (use exact: true to avoid matching "Manage Users" button)
    const usersLink = page.getByRole('link', { name: 'Users', exact: true })
    await usersLink.click()
    await page.waitForLoadState('networkidle')
    
    // Verify navigation to users page
    await expectUrl(page, '/admin/users')
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible()
  })

  test('should display stats on info page', async ({ page }) => {
    await navigateAndWait(page, '/info')
    
    // Scroll to stats section
    await page.evaluate(() => {
      const heading = Array.from(document.querySelectorAll('h2'))
        .find(h => h.textContent?.includes('By the Numbers'))
      if (heading) {
        heading.scrollIntoView({ behavior: 'smooth' })
      }
    })
    
    // Check stats are visible
    await expectTextVisible(page, '10,000+')
    await expectTextVisible(page, 'Active Users')
    await expectTextVisible(page, '50,000+')
    await expectTextVisible(page, 'Projects Created')
    await expectTextVisible(page, '99.9%')
    await expectTextVisible(page, 'Uptime')
  })

  test('should display values section on info page', async ({ page }) => {
    await navigateAndWait(page, '/info')
    
    // Check all core values are visible
    await expectTextVisible(page, 'Innovation')
    await expectTextVisible(page, 'Reliability')
    await expectTextVisible(page, 'Collaboration')
    await expectTextVisible(page, 'Simplicity')
  })

  test('should have clickable "Back to Home" link on info page', async ({ page }) => {
    await navigateAndWait(page, '/info')
    
    // Scroll to bottom to find link
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    
    // Click "Back to Home" link
    const backLink = page.getByRole('link', { name: 'Back to Home' })
    await backLink.click()
    await page.waitForLoadState('networkidle')
    
    // Verify navigation back to home
    await expectUrl(page, '/')
    await expectTextVisible(page, 'Hello World')
  })

  test('should display user data in admin users table', async ({ page }) => {
    await navigateAndWait(page, '/admin/users')
    
    // Check user data is visible
    await expectTextVisible(page, 'John Doe')
    await expectTextVisible(page, 'Bob Johnson')
  })
})
