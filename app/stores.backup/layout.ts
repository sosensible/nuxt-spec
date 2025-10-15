/**
 * Layout Pinia Store
 * Manages sidebar state, layout context, and responsive behavior
 */

import { defineStore } from 'pinia'
import type {
  LayoutState,
  LayoutContext,
  LayoutType,
  FrontendLayoutConfig,
  AdminLayoutConfig,
  BreakpointState,
  NavigationItem
} from '~/types/layout'

export const useLayoutStore = defineStore('layout', () => {
  // Reactive state
  const layoutContext = ref<LayoutContext>({
    type: 'frontend',
    title: undefined,
    description: undefined,
    showHeader: true,
    showFooter: true,
    showSidebar: false,
    isLoading: false,
    breakpoint: {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      currentBreakpoint: 'desktop'
    }
  })

  const frontendConfig = ref<FrontendLayoutConfig>({
    navigation: [
      {
        id: 'home',
        label: 'Home',
        path: '/',
        isActive: true,
        isVisible: true,
        order: 1
      },
      {
        id: 'info',
        label: 'Info',
        path: '/info',
        isActive: false,
        isVisible: true,
        order: 2
      }
    ],
    hero: {
      title: 'Welcome to Our Site',
      subtitle: 'Building something amazing together',
      showCta: true,
      ctaText: 'Get Started',
      ctaLink: '/info'
    },
    footer: {
      showSocial: true,
      showLinks: true,
      copyright: '© 2024 Our Company. All rights reserved.'
    }
  })

  const adminConfig = ref<AdminLayoutConfig>({
    navigation: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/admin',
        icon: 'i-heroicons-home',
        isActive: true,
        isVisible: true,
        order: 1
      },
      {
        id: 'users',
        label: 'Users',
        path: '/admin/users',
        icon: 'i-heroicons-users',
        badge: '12',
        isActive: false,
        isVisible: true,
        order: 2
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/admin/settings',
        icon: 'i-heroicons-cog-6-tooth',
        isActive: false,
        isVisible: true,
        order: 3,
        children: [
          {
            id: 'general',
            label: 'General',
            path: '/admin/settings/general',
            isActive: false,
            isVisible: true,
            order: 1
          },
          {
            id: 'security',
            label: 'Security',
            path: '/admin/settings/security',
            isActive: false,
            isVisible: true,
            order: 2
          }
        ]
      }
    ],
    sidebar: {
      isCollapsed: false,
      isCollapsible: true,
      width: 240,
      collapsedWidth: 64
    },
    header: {
      showBreadcrumb: true,
      showUserMenu: true,
      showNotifications: true,
      showSearch: true
    },
    permissions: []
  })

  // Computed properties
  const currentLayout = computed(() => layoutContext.value.type)
  const isFrontend = computed(() => layoutContext.value.type === 'frontend')
  const isAdmin = computed(() => layoutContext.value.type === 'admin')
  const isMobile = computed(() => layoutContext.value.breakpoint.isMobile)
  const isTablet = computed(() => layoutContext.value.breakpoint.isTablet)
  const isDesktop = computed(() => layoutContext.value.breakpoint.isDesktop)
  const sidebarCollapsed = computed(() => adminConfig.value.sidebar.isCollapsed)
  const sidebarWidth = computed(() =>
    adminConfig.value.sidebar.isCollapsed
      ? adminConfig.value.sidebar.collapsedWidth
      : adminConfig.value.sidebar.width
  )

  // Actions
  function setLayoutType(type: LayoutType) {
    layoutContext.value.type = type
    layoutContext.value.showSidebar = type === 'admin'

    // Update page title based on layout
    if (import.meta.client) {
      document.title = type === 'admin' ? 'Admin Dashboard' : 'Our Site'
    }
  }

  function setLayoutContext(context: Partial<LayoutContext>) {
    layoutContext.value = { ...layoutContext.value, ...context }
  }

  function setPageTitle(title: string, description?: string) {
    layoutContext.value.title = title
    layoutContext.value.description = description

    if (import.meta.client) {
      document.title = title

      if (description) {
        const metaDescription = document.querySelector('meta[name="description"]')
        if (metaDescription) {
          metaDescription.setAttribute('content', description)
        }
      }
    }
  }

  function setLoading(isLoading: boolean) {
    layoutContext.value.isLoading = isLoading
  }

  function toggleSidebar() {
    if (layoutContext.value.type === 'admin') {
      adminConfig.value.sidebar.isCollapsed = !adminConfig.value.sidebar.isCollapsed

      // Save preference to localStorage
      if (import.meta.client) {
        localStorage.setItem('admin-sidebar-collapsed', String(adminConfig.value.sidebar.isCollapsed))
      }
    }
  }

  function setSidebarCollapsed(collapsed: boolean) {
    if (layoutContext.value.type === 'admin') {
      adminConfig.value.sidebar.isCollapsed = collapsed

      // Save preference to localStorage
      if (import.meta.client) {
        localStorage.setItem('admin-sidebar-collapsed', String(collapsed))
      }
    }
  }

  function updateBreakpoint(breakpoint: BreakpointState) {
    layoutContext.value.breakpoint = breakpoint

    // Auto-collapse sidebar on mobile/tablet for admin layout
    if (layoutContext.value.type === 'admin') {
      if (breakpoint.isMobile || breakpoint.isTablet) {
        adminConfig.value.sidebar.isCollapsed = true
      } else {
        // Restore from localStorage on desktop
        if (import.meta.client) {
          const saved = localStorage.getItem('admin-sidebar-collapsed')
          if (saved !== null) {
            adminConfig.value.sidebar.isCollapsed = saved === 'true'
          }
        }
      }
    }
  }

  function updateFrontendConfig(config: Partial<FrontendLayoutConfig>) {
    frontendConfig.value = { ...frontendConfig.value, ...config }
  }

  function updateAdminConfig(config: Partial<AdminLayoutConfig>) {
    adminConfig.value = { ...adminConfig.value, ...config }
  }

  function setNavigationActive(layoutType: LayoutType, itemId: string) {
    const config = layoutType === 'frontend' ? frontendConfig.value : adminConfig.value

    // Reset all items to inactive
    const resetActive = (items: NavigationItem[]) => {
      items.forEach((item) => {
        item.isActive = false
        if (item.children) {
          resetActive(item.children)
        }
      })
    }

    resetActive(config.navigation)

    // Set the specified item as active
    const setActive = (items: NavigationItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId) {
          item.isActive = true
          return true
        }
        if (item.children && setActive(item.children)) {
          return true
        }
      }
      return false
    }

    setActive(config.navigation)
  }

  // Initialize store
  function init() {
    if (import.meta.client) {
      // Restore sidebar state from localStorage
      const savedSidebarState = localStorage.getItem('admin-sidebar-collapsed')
      if (savedSidebarState !== null) {
        adminConfig.value.sidebar.isCollapsed = savedSidebarState === 'true'
      }

      // Set up responsive breakpoint detection
      const updateBreakpoints = () => {
        const width = window.innerWidth
        const breakpoint: BreakpointState = {
          isMobile: width < 768,
          isTablet: width >= 768 && width < 1024,
          isDesktop: width >= 1024,
          currentBreakpoint: width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop'
        }
        updateBreakpoint(breakpoint)
      }

      // Initial breakpoint check
      updateBreakpoints()

      // Listen for window resize
      window.addEventListener('resize', updateBreakpoints)

      // Cleanup function
      onUnmounted(() => {
        window.removeEventListener('resize', updateBreakpoints)
      })
    }
  }

  // Getters for complete layout state
  const getLayoutState = computed((): LayoutState => ({
    context: layoutContext.value,
    frontend: frontendConfig.value,
    admin: adminConfig.value
  }))

  return {
    // State - Using computed instead of readonly to avoid deep readonly issues
    layoutContext: computed(() => layoutContext.value),
    frontendConfig: computed(() => frontendConfig.value),
    adminConfig: computed(() => adminConfig.value),

    // Computed
    currentLayout,
    isFrontend,
    isAdmin,
    isMobile,
    isTablet,
    isDesktop,
    sidebarCollapsed,
    sidebarWidth,
    getLayoutState,

    // Actions
    setLayoutType,
    setLayoutContext,
    setPageTitle,
    setLoading,
    toggleSidebar,
    setSidebarCollapsed,
    updateBreakpoint,
    updateFrontendConfig,
    updateAdminConfig,
    setNavigationActive,
    init
  }
})
