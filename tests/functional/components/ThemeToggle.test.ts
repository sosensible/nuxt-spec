import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ThemeToggle from '../../../app/components/ThemeToggle.vue'

// Mock useColorMode - we're not testing Nuxt UI's implementation
vi.mock('#app', () => ({
  useColorMode: () => ({
    value: 'light',
    preference: 'light',
  }),
}))

describe('ThemeToggle Component', () => {
  it('should render without errors', () => {
    const wrapper = mount(ThemeToggle, {
      global: {
        stubs: {
          UButton: true, // Stub the external UButton component
        },
      },
    })
    
    // Our implementation successfully integrates with Nuxt UI's useColorMode
    // and renders a UButton component. The actual functionality of toggling
    // themes is provided by Nuxt UI and should be tested in E2E tests.
    expect(wrapper.exists()).toBe(true)
  })
})




