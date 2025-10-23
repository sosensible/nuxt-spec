import { chromium, type FullConfig } from '@playwright/test'

/**
 * Global setup for Playwright tests
 * 
 * This runs once before all tests to ensure the Nuxt dev server
 * is fully ready (Vite has finished building) before tests start.
 */
async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  const baseURL = 'http://localhost:3000'
  const maxRetries = 30 // Wait up to 30 seconds
  const retryDelay = 1000 // 1 second between retries
  
  console.log('⏳ Waiting for Nuxt dev server to finish building...')
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await page.goto(baseURL, { waitUntil: 'networkidle', timeout: 5000 })
      
      // Check if we're past the Nuxt loading screen
      // If the page has navigation elements, we know it's ready
      const hasNavigation = await page.locator('nav, header, [role="navigation"]').count() > 0
      const hasLoadingScreen = await page.getByText(/^\d+\.\d+\.\d+$/).isVisible().catch(() => false)
      
      if (hasNavigation && !hasLoadingScreen) {
        console.log('✅ Nuxt dev server is ready!')
        await browser.close()
        return
      }
      
      console.log(`   Attempt ${i + 1}/${maxRetries}: Still building...`)
      await page.waitForTimeout(retryDelay)
    } catch {
      // Server not responding yet, continue waiting
      if (i === maxRetries - 1) {
        console.error('❌ Nuxt dev server failed to become ready')
        await browser.close()
        throw new Error('Nuxt dev server did not become ready within the timeout period')
      }
      await page.waitForTimeout(retryDelay)
    }
  }
  
  await browser.close()
}

export default globalSetup
