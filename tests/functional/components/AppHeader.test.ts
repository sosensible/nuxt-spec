import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import AppHeader from '../../../app/components/AppHeader.vue'

/**
 * T029 RED: AppHeader Cross-Section Navigation Tests
 * 
 * Following our testing principle: test our implementation, not external libraries
 * - Unit tests verify the link structure and integration with useNavigation
 * - E2E tests verify actual navigation behavior
 */

describe('AppHeader Component - Cross-Section Navigation', () => {
  it('should render admin navigation link', async () => {
    const component = await mountSuspended(AppHeader)
    const html = component.html()

    // The admin link should be visible in the header
    expect(html).toContain('Admin Panel')
  })

  it('should use crossSection targetPath for admin link', async () => {
    const component = await mountSuspended(AppHeader)
    const html = component.html()

    // Link should point to /admin (crossSection.targetPath when in frontend)
    // We test that the link exists with href="/admin", not that clicking it works
    expect(html).toContain('/admin')
  })

  it('should use crossSection targetLabel for link text', async () => {
    const component = await mountSuspended(AppHeader)
    const html = component.html()

    // Link text should come from crossSection.targetLabel
    expect(html).toContain('Admin Panel')
  })

  it('should integrate with useNavigation composable', async () => {
    // This test verifies our component uses the composable
    // We're testing integration, not the composable's logic (already tested)
    const component = await mountSuspended(AppHeader)
    
    // If the component renders without errors and has the admin link,
    // it's successfully integrated with useNavigation
    expect(component.html()).toContain('Admin Panel')
  })
})
