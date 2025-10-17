import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useLayoutStore } from '../../app/stores/layout'
import { useNavigationStore } from '../../app/stores/navigation'

describe('Store Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('Layout Store', () => {
    it('should initialize with default values', () => {
      const store = useLayoutStore()
      
      expect(store.layoutType).toBe('frontend')
      expect(store.pageTitle).toBe('')
      expect(store.isLoading).toBe(false)
      expect(store.sidebarCollapsed).toBe(false)
    })

    it('should change layout type', () => {
      const store = useLayoutStore()
      
      store.setLayoutType('admin')
      expect(store.layoutType).toBe('admin')
      expect(store.isAdmin).toBe(true)
      expect(store.isFrontend).toBe(false)
    })

    it('should update page title', () => {
      const store = useLayoutStore()
      
      store.setPageTitle('Test Page', 'Test description')
      expect(store.pageTitle).toBe('Test Page')
      expect(store.pageDescription).toBe('Test description')
    })

    it('should toggle sidebar state', () => {
      const store = useLayoutStore()
      
      expect(store.sidebarCollapsed).toBe(false)
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(true)
      store.toggleSidebar()
      expect(store.sidebarCollapsed).toBe(false)
    })
  })

  describe('Navigation Store', () => {
    it('should initialize with default values', () => {
      const store = useNavigationStore()
      
      expect(store.activeNavigationId).toBe('')
      expect(store.breadcrumbs).toEqual([])
    })

    it('should set active navigation', () => {
      const store = useNavigationStore()
      
      store.setNavigationActive('home')
      expect(store.activeNavigationId).toBe('home')
    })

    it('should update breadcrumbs', () => {
      const store = useNavigationStore()
      const breadcrumbs = [
        { label: 'Home', to: '/' },
        { label: 'Admin', to: '/admin' }
      ]
      
      store.setBreadcrumbs(breadcrumbs)
      expect(store.breadcrumbs).toEqual(breadcrumbs)
    })

    it('should add single breadcrumb', () => {
      const store = useNavigationStore()
      
      store.addBreadcrumb({ label: 'Home', to: '/' })
      expect(store.breadcrumbs).toHaveLength(1)
      expect(store.breadcrumbs[0].label).toBe('Home')
    })
  })
})
