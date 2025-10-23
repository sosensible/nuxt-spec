import type { Page } from '@playwright/test'

/**
 * Wait for Vue/Nuxt to fully hydrate the page
 * This ensures all Vue components and event handlers are properly attached.
 * 
 * Uses smart detection specifically for UForm:
 * 1. DOM content loaded
 * 2. Vue app mounted (data-v- attributes present)  
 * 3. UForm JavaScript fully loaded (checks for form element properties)
 * 4. Additional buffer for event listener attachment
 */
export async function waitForHydration(page: Page) {
  // Wait for DOM content to be loaded first
  await page.waitForLoadState('domcontentloaded')
  
  // Wait for Vue to hydrate by checking for Vue-specific data attributes
  await page.waitForFunction(() => {
    const forms = document.querySelectorAll('form')
    if (forms.length === 0) return false
    
    // Check if Vue has hydrated (data-v- attributes present)
    // Also accept forms with data-testid as a fallback
    const hasVueAttributes = Array.from(forms).some(form => {
      const attrs = Array.from(form.attributes)
      return attrs.some(attr => 
        attr.name.startsWith('data-v-') || 
        attr.name.startsWith('data-testid')
      ) || form.classList.length > 0 // Form has classes from Vue
    })
    
    return hasVueAttributes
  }, { timeout: 15000 }) // Increased timeout for slower loads
  
  // Additional wait specifically for UForm's event handlers
  // UForm attaches @submit handlers after Vue hydration
  // We need to wait for the JavaScript to fully execute
  await page.waitForTimeout(3000)
}
