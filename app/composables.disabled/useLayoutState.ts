/**
 * useLayoutState Composable
 * Provides reactive layout state management with convenience methods
 */

import type {
  LayoutContext,
  LayoutType,
  FrontendLayoutConfig,
  AdminLayoutConfig,
  BreakpointState,
  LayoutEventHandlers
} from '~/types/layout'

export const useLayoutState = (options?: {
  autoInit?: boolean
  eventHandlers?: LayoutEventHandlers
}) => {
  const layoutStore = useLayoutStore()
  const { autoInit = true, eventHandlers } = options || {}

  // Initialize store if auto-init is enabled
  if (autoInit && import.meta.client) {
    onMounted(() => {
      layoutStore.init()
    })
  }

  // Reactive state (from store)
  const layoutContext = computed(() => layoutStore.layoutContext)
  const frontendConfig = computed(() => layoutStore.frontendConfig)
  const adminConfig = computed(() => layoutStore.adminConfig)

  // Computed layout properties
  const currentLayout = computed(() => layoutStore.currentLayout)
  const isFrontend = computed(() => layoutStore.isFrontend)
  const isAdmin = computed(() => layoutStore.isAdmin)
  const isLoading = computed(() => layoutContext.value.isLoading)

  // Responsive state
  const breakpoint = computed(() => layoutContext.value.breakpoint)
  const isMobile = computed(() => layoutStore.isMobile)
  const isTablet = computed(() => layoutStore.isTablet)
  const isDesktop = computed(() => layoutStore.isDesktop)

  // Sidebar state (admin only)
  const sidebarCollapsed = computed(() => layoutStore.sidebarCollapsed)
  const sidebarWidth = computed(() => layoutStore.sidebarWidth)
  const canToggleSidebar = computed(() =>
    isAdmin.value && adminConfig.value.sidebar.isCollapsible
  )

  // Layout configuration getters
  const showHeader = computed(() => layoutContext.value.showHeader)
  const showFooter = computed(() => layoutContext.value.showFooter)
  const showSidebar = computed(() => layoutContext.value.showSidebar)

  // Page meta
  const pageTitle = computed(() => layoutContext.value.title)
  const pageDescription = computed(() => layoutContext.value.description)

  // Navigation configurations
  const frontendNavigation = computed(() => frontendConfig.value.navigation)
  const adminNavigation = computed(() => adminConfig.value.navigation)
  const currentNavigation = computed(() =>
    isFrontend.value ? frontendNavigation.value : adminNavigation.value
  )

  // Actions with event handler integration
  const setLayoutType = (type: LayoutType) => {
    layoutStore.setLayoutType(type)
    eventHandlers?.onLayoutChange?.(type)
  }

  const setPageTitle = (title: string, description?: string) => {
    layoutStore.setPageTitle(title, description)
  }

  const setLoading = (loading: boolean) => {
    layoutStore.setLoading(loading)
  }

  const toggleSidebar = () => {
    if (canToggleSidebar.value) {
      layoutStore.toggleSidebar()
      eventHandlers?.onSidebarToggle?.()
    }
  }

  const setSidebarCollapsed = (collapsed: boolean) => {
    if (canToggleSidebar.value) {
      layoutStore.setSidebarCollapsed(collapsed)
      eventHandlers?.onSidebarToggle?.()
    }
  }

  const updateBreakpoint = (newBreakpoint: BreakpointState) => {
    layoutStore.updateBreakpoint(newBreakpoint)
    eventHandlers?.onBreakpointChange?.(newBreakpoint)
  }

  // Layout context management
  const updateLayoutContext = (context: Partial<LayoutContext>) => {
    layoutStore.setLayoutContext(context)
  }

  const updateFrontendConfig = (config: Partial<FrontendLayoutConfig>) => {
    layoutStore.updateFrontendConfig(config)
  }

  const updateAdminConfig = (config: Partial<AdminLayoutConfig>) => {
    layoutStore.updateAdminConfig(config)
  }

  // Utility functions
  const getLayoutClasses = () => {
    const classes = ['layout', `layout--${currentLayout.value}`]

    if (isLoading.value) classes.push('layout--loading')
    if (isMobile.value) classes.push('layout--mobile')
    if (isTablet.value) classes.push('layout--tablet')
    if (isDesktop.value) classes.push('layout--desktop')

    if (isAdmin.value) {
      classes.push('layout--admin')
      if (sidebarCollapsed.value) classes.push('layout--sidebar-collapsed')
      if (showSidebar.value) classes.push('layout--with-sidebar')
    } else {
      classes.push('layout--frontend')
    }

    if (!showHeader.value) classes.push('layout--no-header')
    if (!showFooter.value) classes.push('layout--no-footer')

    return classes
  }

  const getContentClasses = () => {
    const classes = ['layout-content']

    if (isAdmin.value && showSidebar.value) {
      classes.push('layout-content--with-sidebar')
      if (sidebarCollapsed.value) {
        classes.push('layout-content--sidebar-collapsed')
      }
    }

    if (isMobile.value) classes.push('layout-content--mobile')
    if (isTablet.value) classes.push('layout-content--tablet')

    return classes
  }

  // Responsive utilities
  const isScreenSize = (size: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop') => {
    switch (size) {
      case 'mobile':
        return isMobile.value
      case 'tablet':
        return isTablet.value
      case 'desktop':
        return isDesktop.value
      case 'mobile-tablet':
        return isMobile.value || isTablet.value
      case 'tablet-desktop':
        return isTablet.value || isDesktop.value
      default:
        return false
    }
  }

  const onBreakpointChange = (callback: (breakpoint: BreakpointState) => void) => {
    watch(breakpoint, callback, { immediate: true })
  }

  // Layout transition helpers
  const withLayoutTransition = async (callback: () => Promise<void> | void) => {
    setLoading(true)
    try {
      await callback()
    } finally {
      setLoading(false)
    }
  }

  // CSS custom properties for dynamic layout values
  const layoutCssProperties = computed(() => {
    const props: Record<string, string> = {
      '--layout-sidebar-width': `${sidebarWidth.value}px`,
      '--layout-sidebar-collapsed-width': `${adminConfig.value.sidebar.collapsedWidth}px`,
      '--layout-sidebar-expanded-width': `${adminConfig.value.sidebar.width}px`,
      '--layout-breakpoint': breakpoint.value.currentBreakpoint
    }

    // Add admin-specific properties
    if (isAdmin.value) {
      props['--admin-header-height'] = '60px'
      props['--admin-sidebar-transition'] = 'width 0.3s ease-in-out'
    }

    // Add frontend-specific properties
    if (isFrontend.value) {
      props['--frontend-header-height'] = '64px'
      props['--frontend-footer-height'] = 'auto'
    }

    return props
  })

  // Apply CSS custom properties to document root
  const applyCssProperties = () => {
    if (import.meta.client) {
      const root = document.documentElement
      Object.entries(layoutCssProperties.value).forEach(([property, value]) => {
        root.style.setProperty(property, value)
      })
    }
  }

  // Watch for changes and apply CSS properties
  watch(layoutCssProperties, applyCssProperties, { immediate: true })

  // Cleanup
  onUnmounted(() => {
    if (import.meta.client) {
      const root = document.documentElement
      Object.keys(layoutCssProperties.value).forEach((property) => {
        root.style.removeProperty(property)
      })
    }
  })

  return {
    // State
    layoutContext,
    frontendConfig,
    adminConfig,

    // Computed layout properties
    currentLayout,
    isFrontend,
    isAdmin,
    isLoading,

    // Responsive state
    breakpoint,
    isMobile,
    isTablet,
    isDesktop,

    // Sidebar state
    sidebarCollapsed,
    sidebarWidth,
    canToggleSidebar,

    // Layout configuration
    showHeader,
    showFooter,
    showSidebar,

    // Page meta
    pageTitle,
    pageDescription,

    // Navigation
    frontendNavigation,
    adminNavigation,
    currentNavigation,

    // Actions
    setLayoutType,
    setPageTitle,
    setLoading,
    toggleSidebar,
    setSidebarCollapsed,
    updateBreakpoint,
    updateLayoutContext,
    updateFrontendConfig,
    updateAdminConfig,

    // Utilities
    getLayoutClasses,
    getContentClasses,
    isScreenSize,
    onBreakpointChange,
    withLayoutTransition,
    layoutCssProperties,
    applyCssProperties
  }
}
