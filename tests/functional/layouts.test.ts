import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DefaultLayout from '../../app/layouts/default.vue'
import AdminLayout from '../../app/layouts/admin.vue'

describe('Layout Behavior', () => {
  it('should render frontend layout with header and footer', async () => {
    const component = await mountSuspended(DefaultLayout, {
      slots: {
        default: '<div>Test Content</div>'
      }
    })
    const html = component.html()
    
    // Test visible elements users interact with
    expect(html).toContain('Our Site')
    expect(html).toContain('Home')
    expect(html).toContain('Info')
    expect(html).toContain('Quick Links') // Footer section
    expect(html).toContain('Test Content')
  })

  it('should render admin layout with sidebar', async () => {
    const component = await mountSuspended(AdminLayout, {
      slots: {
        default: '<div>Admin Content</div>'
      }
    })
    const html = component.html()
    
    // Test admin-specific elements
    expect(html).toContain('Admin')
    expect(html).toContain('Dashboard')
    expect(html).toContain('Users')
    expect(html).toContain('Admin Content')
  })
})
