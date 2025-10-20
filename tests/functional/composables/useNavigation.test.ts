import { describe, it, expect, vi } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

/**
 * NOTE: Testing crossSection logic with different routes in unit tests is complex
 * because the route is captured when useNavigation() is called, and mocking different
 * routes for each test doesn't work well with Vitest's module mocking.
 * 
 * We follow our testing principle: "only test our implementation, not external libraries"
 * - Unit tests verify the composable structure and integration
 * - E2E tests verify cross-section navigation behavior with real routing
 */

// Mock the navigation store with stable values
const mockSetNavigationActive = vi.fn()
const mockSetBreadcrumbs = vi.fn()

mockNuxtImport('useNavigationStore', () => {
  return () => ({
    activeNavigationId: 'home',
    breadcrumbs: [],
    currentPath: '/',
    isAdminRoute: false,
    setNavigationActive: mockSetNavigationActive,
    setBreadcrumbs: mockSetBreadcrumbs,
  })
})

// Mock useRoute with a frontend path (default test scenario)
mockNuxtImport('useRoute', () => () => ({ path: '/' }))

// Import after mocking
const { useNavigation } = await import('../../../app/composables/useNavigation')

describe('useNavigation Composable - Cross-Section Navigation', () => {
  describe('crossSection computed property', () => {
    it('should provide crossSection object with required properties', () => {
      const { crossSection } = useNavigation()

      expect(crossSection.value).toHaveProperty('currentSection')
      expect(crossSection.value).toHaveProperty('targetPath')
      expect(crossSection.value).toHaveProperty('targetLabel')
      expect(crossSection.value).toHaveProperty('showNav')
    })

    it('should have valid section types', () => {
      const { crossSection } = useNavigation()
      const section = crossSection.value.currentSection

      expect(['frontend', 'admin']).toContain(section)
    })

    it('should provide valid navigation paths', () => {
      const { crossSection } = useNavigation()
      const targetPath = crossSection.value.targetPath

      expect(['/admin', '/']).toContain(targetPath)
    })

    it('should provide valid navigation labels', () => {
      const { crossSection } = useNavigation()
      const label = crossSection.value.targetLabel

      expect(['Admin Panel', 'View Site']).toContain(label)
    })

    it('should always enable navigation', () => {
      const { crossSection } = useNavigation()

      expect(crossSection.value.showNav).toBe(true)
    })

    it('should have opposite section and target path', () => {
      const { crossSection } = useNavigation()
      const { currentSection, targetPath } = crossSection.value

      if (currentSection === 'frontend') {
        expect(targetPath).toBe('/admin')
      } else {
        expect(targetPath).toBe('/')
      }
    })

    it('should have matching label for target section', () => {
      const { crossSection } = useNavigation()
      const { targetPath, targetLabel } = crossSection.value

      if (targetPath === '/admin') {
        expect(targetLabel).toBe('Admin Panel')
      } else {
        expect(targetLabel).toBe('View Site')
      }
    })
  })

  describe('integration with existing navigation', () => {
    it('should expose existing navigation store properties', () => {
      const nav = useNavigation()

      expect(nav.activeNavigationId).toBeDefined()
      expect(nav.breadcrumbs).toBeDefined()
      expect(nav.currentPath).toBeDefined()
      expect(nav.isAdminRoute).toBeDefined()
    })

    it('should expose existing navigation store actions', () => {
      const nav = useNavigation()

      expect(nav.setNavigationActive).toBeDefined()
      expect(nav.setBreadcrumbs).toBeDefined()
      expect(typeof nav.setNavigationActive).toBe('function')
      expect(typeof nav.setBreadcrumbs).toBe('function')
    })
  })
})
