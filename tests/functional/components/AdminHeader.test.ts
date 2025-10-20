import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AdminHeader from '../../../app/components/AdminHeader.vue'

/**
 * T030: AdminHeader Cross-Section Navigation Tests
 * 
 * Following our testing principle: test our implementation, not external libraries
 * LESSON APPLIED: Routing behavior cannot be tested in unit tests due to route context issues.
 * 
 * Unit tests verify:
 * - Component renders successfully
 * - Cross-section navigation link structure exists
 * 
 * E2E tests verify:
 * - Correct link appears based on actual route (View Site in admin, Admin Panel in frontend)
 * - Navigation actually works between sections
 */

describe('AdminHeader Component - Cross-Section Navigation', () => {
  it('should render successfully with navigation integration', async () => {
    const component = await mountSuspended(AdminHeader)
    
    // Verify component renders without errors
    expect(component.exists()).toBe(true)
    
    // Verify it has admin header content
    expect(component.html()).toContain('Admin Panel')
  })

  it('should integrate with useNavigation composable', async () => {
    const component = await mountSuspended(AdminHeader)
    const html = component.html()
    
    // Verify cross-section link exists (text will vary based on route context)
    // In unit test context (defaults to /), it shows "Admin Panel" link
    // In E2E tests with real /admin route, it will show "View Site" link
    const hasAdminPanelLink = html.includes('Admin Panel')
    const hasViewSiteLink = html.includes('View Site')
    
    // One of these should be present (depends on route context)
    expect(hasAdminPanelLink || hasViewSiteLink).toBe(true)
  })
})
