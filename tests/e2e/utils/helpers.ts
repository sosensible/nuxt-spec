import { expect, type Page } from '@playwright/test'

/**
 * E2E Test Helper Utilities
 * 
 * Common functions for Playwright E2E tests to reduce duplication
 * and provide consistent test patterns.
 */

/**
 * Wait for page to be fully loaded including hydration
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

/**
 * Navigate to a route and wait for it to load
 */
export async function navigateAndWait(page: Page, path: string) {
  await page.goto(path)
  await waitForPageLoad(page)
}

/**
 * Check if an element contains specific text
 */
export async function expectTextVisible(page: Page, text: string) {
  await expect(page.getByText(text)).toBeVisible()
}

/**
 * Check if a link with specific text exists and is visible
 */
export async function expectLinkVisible(page: Page, text: string) {
  await expect(page.getByRole('link', { name: text })).toBeVisible()
}

/**
 * Check if a button with specific text exists and is visible
 */
export async function expectButtonVisible(page: Page, text: string) {
  await expect(page.getByRole('button', { name: text })).toBeVisible()
}

/**
 * Click a link and wait for navigation
 * Uses first() to handle cases where multiple links exist
 */
export async function clickLinkAndWait(page: Page, text: string) {
  await page.getByRole('link', { name: text }).first().click()
  await waitForPageLoad(page)
}

/**
 * Click a button and wait for any network activity to complete
 */
export async function clickButtonAndWait(page: Page, text: string) {
  await page.getByRole('button', { name: text }).click()
  await page.waitForLoadState('networkidle')
}

/**
 * Check current URL matches expected path
 */
export async function expectUrl(page: Page, path: string) {
  await expect(page).toHaveURL(path)
}

/**
 * Check page title matches expected value
 */
export async function expectTitle(page: Page, title: string) {
  await expect(page).toHaveTitle(title)
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `screenshots/${name}.png`, fullPage: true })
}

/**
 * Check if header navigation is visible
 */
export async function expectHeaderNavigationVisible(page: Page) {
  // Use navigation role to be more specific
  const nav = page.getByRole('navigation')
  await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Info' })).toBeVisible()
}

/**
 * Check if footer is visible with expected sections
 */
export async function expectFooterVisible(page: Page) {
  const footer = page.getByRole('contentinfo')
  await expect(footer.getByText('Quick Links')).toBeVisible()
  await expect(footer.getByText('Contact')).toBeVisible()
  await expect(footer.getByText('© 2025')).toBeVisible()
}

/**
 * Check if admin sidebar is visible
 */
export async function expectAdminSidebarVisible(page: Page) {
  // Look for sidebar links specifically
  await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Users', exact: true })).toBeVisible()
}

/**
 * Fill a form input field
 */
export async function fillInput(page: Page, label: string, value: string) {
  await page.getByLabel(label).fill(value)
}

/**
 * Check if element with role and name is clickable
 */
export async function expectClickable(page: Page, role: 'link' | 'button', name: string) {
  const element = page.getByRole(role, { name })
  await expect(element).toBeVisible()
  await expect(element).toBeEnabled()
}

/**
 * Wait for element to appear with custom timeout
 */
export async function waitForElement(page: Page, selector: string, timeout = 5000) {
  await page.waitForSelector(selector, { timeout })
}
