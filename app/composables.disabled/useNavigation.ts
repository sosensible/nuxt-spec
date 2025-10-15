/**
 * useNavigation Composable
 * Provides reactive navigation state management and routing utilities
 */

import type { NavigationItem, LayoutType } from '~/types/layout'

export const useNavigation = (options?: {
  autoInit?: boolean
  trackHistory?: boolean
  generateBreadcrumbs?: boolean
}) => {
  const navigationStore = useNavigationStore()
  const layoutStore = useLayoutStore()
  const { autoInit = true, trackHistory = true, generateBreadcrumbs = true } = options || {}

  // Initialize store if auto-init is enabled
  if (autoInit && import.meta.client) {
    onMounted(() => {
      navigationStore.init()
    })
  }

  // Reactive state from store
  const history = computed(() => navigationStore.history)
  const breadcrumbs = computed(() => navigationStore.breadcrumbs)
  const isNavigating = computed(() => navigationStore.isNavigating)

  // Route information
  const currentPath = computed(() => navigationStore.currentPath)
  const currentQuery = computed(() => navigationStore.currentQuery)
  const currentParams = computed(() => navigationStore.currentParams)
  const isAdminRoute = computed(() => navigationStore.isAdminRoute)
  const isFrontendRoute = computed(() => navigationStore.isFrontendRoute)
  const navigationContext = computed(() => navigationStore.navigationContext)

  // Navigation configurations
  const frontendNavigation = computed(() => layoutStore.frontendConfig.navigation)
  const adminNavigation = computed(() => layoutStore.adminConfig.navigation)
  const currentNavigation = computed(() =>
    navigationContext.value === 'admin' ? adminNavigation.value : frontendNavigation.value
  )

  // Active navigation item
  const activeNavigationItem = computed(() =>
    navigationStore.getActiveNavigationItem(currentNavigation.value, currentPath.value)
  )

  // Navigation tree with active states
  const navigationTree = computed(() =>
    navigationStore.getNavigationTree(currentNavigation.value, currentPath.value)
  )

  // Navigation actions
  const navigateTo = (path: string, title?: string, options?: {
    replace?: boolean
    external?: boolean
    openInNewTab?: boolean
  }) => {
    if (options?.openInNewTab) {
      window.open(path, '_blank')
      return Promise.resolve()
    }

    if (trackHistory) {
      navigationStore.addToHistory(path, title)
    }

    return navigationStore.navigateTo(path, title, options)
  }

  const navigateBack = () => {
    navigationStore.navigateBack()
  }

  const navigateToItem = (item: NavigationItem, options?: {
    replace?: boolean
    openInNewTab?: boolean
  }) => {
    return navigateTo(item.path, item.label, options)
  }

  // Breadcrumb management
  const updateBreadcrumbs = (path?: string) => {
    if (generateBreadcrumbs) {
      navigationStore.updateBreadcrumbs(path)
    }
  }

  const setBreadcrumbs = (_crumbs: Array<{ label: string, path?: string }>) => {
    // This needs to be handled through the store properly
    navigationStore.updateBreadcrumbs()
  }

  const addBreadcrumb = (label: string, path?: string) => {
    const currentBreadcrumbs = [...breadcrumbs.value]
    currentBreadcrumbs.push({ label, path })
    setBreadcrumbs(currentBreadcrumbs)
  }

  // Navigation item management
  const setNavigationActive = (itemId: string) => {
    layoutStore.setNavigationActive(navigationContext.value, itemId)
  }

  const findNavigationItem = (id: string): NavigationItem | null => {
    return navigationStore.findNavigationItem(currentNavigation.value, id)
  }

  const updateNavigationItem = (id: string, updates: Partial<NavigationItem>): boolean => {
    const config = navigationContext.value === 'admin' ? 'admin' : 'frontend'

    if (config === 'admin') {
      const updated = navigationStore.updateNavigationItem(adminNavigation.value, id, updates)
      if (updated) {
        layoutStore.updateAdminConfig({ navigation: adminNavigation.value })
      }
      return updated
    } else {
      const updated = navigationStore.updateNavigationItem(frontendNavigation.value, id, updates)
      if (updated) {
        layoutStore.updateFrontendConfig({ navigation: frontendNavigation.value })
      }
      return updated
    }
  }

  const addNavigationItem = (item: NavigationItem, parentId?: string): boolean => {
    const navigation = [...currentNavigation.value]

    if (parentId) {
      const parent = navigationStore.findNavigationItem(navigation, parentId)
      if (parent) {
        if (!parent.children) parent.children = []
        parent.children.push(item)
      } else {
        return false
      }
    } else {
      navigation.push(item)
    }

    if (navigationContext.value === 'admin') {
      layoutStore.updateAdminConfig({ navigation })
    } else {
      layoutStore.updateFrontendConfig({ navigation })
    }

    return true
  }

  const removeNavigationItem = (id: string): boolean => {
    const removeFromArray = (items: NavigationItem[]): boolean => {
      const index = items.findIndex(item => item.id === id)
      if (index !== -1) {
        items.splice(index, 1)
        return true
      }

      for (const item of items) {
        if (item.children && removeFromArray(item.children)) {
          return true
        }
      }

      return false
    }

    const navigation = [...currentNavigation.value]
    const removed = removeFromArray(navigation)

    if (removed) {
      if (navigationContext.value === 'admin') {
        layoutStore.updateAdminConfig({ navigation })
      } else {
        layoutStore.updateFrontendConfig({ navigation })
      }
    }

    return removed
  }

  // Navigation utilities
  const isRouteActive = (path: string, exact = false): boolean => {
    if (exact) {
      return currentPath.value === path
    }
    return currentPath.value.startsWith(path) && path !== '/'
  }

  const isNavigationItemActive = (item: NavigationItem): boolean => {
    return isRouteActive(item.path, item.path === '/')
  }

  const getNavigationItemUrl = (item: NavigationItem, includeQuery = false): string => {
    let url = item.path
    if (includeQuery && Object.keys(currentQuery.value).length > 0) {
      const queryString = new URLSearchParams(currentQuery.value as Record<string, string>).toString()
      url += `?${queryString}`
    }
    return url
  }

  // Search functionality
  const searchNavigation = (query: string): NavigationItem[] => {
    return navigationStore.searchNavigation(currentNavigation.value, query)
  }

  // History management
  const clearHistory = () => {
    navigationStore.clearHistory()
  }

  const removeFromHistory = (path: string) => {
    navigationStore.removeFromHistory(path)
  }

  const getRecentPages = (limit = 10) => {
    return history.value.slice(0, limit)
  }

  // Route guards and middleware helpers
  const canNavigateTo = (path: string): boolean => {
    // Add custom navigation guards here
    // For example, check permissions for admin routes
    if (path.startsWith('/admin')) {
      // Check admin permissions
      return true // Implement your permission logic
    }
    return true
  }

  const withNavigationGuard = async (path: string, callback: () => Promise<void> | void) => {
    if (!canNavigateTo(path)) {
      throw new Error(`Navigation to ${path} is not allowed`)
    }
    await callback()
  }

  // Layout integration
  const switchToLayout = (layout: LayoutType, path?: string) => {
    layoutStore.setLayoutType(layout)
    if (path) {
      navigateTo(path)
    }
  }

  const goToAdmin = (path = '/admin') => {
    switchToLayout('admin', path)
  }

  const goToFrontend = (path = '/') => {
    switchToLayout('frontend', path)
  }

  // Mobile navigation helpers
  const isMobileNavigation = computed(() => {
    return layoutStore.isMobile && navigationContext.value === 'frontend'
  })

  const closeMobileNavigation = () => {
    // Emit event or trigger mobile navigation close
    // This would be handled by the mobile navigation component
  }

  // Advanced navigation patterns
  const navigateWithConfirmation = async (
    path: string,
    message = 'Are you sure you want to leave this page?'
  ): Promise<boolean> => {
    if (confirm(message)) {
      await navigateTo(path)
      return true
    }
    return false
  }

  const navigateWithLoading = async (path: string, title?: string) => {
    layoutStore.setLoading(true)
    try {
      await navigateTo(path, title)
    } finally {
      layoutStore.setLoading(false)
    }
  }

  // URL utilities
  const getCurrentUrl = (includeQuery = true, includeHash = false): string => {
    let url = currentPath.value

    if (includeQuery && Object.keys(currentQuery.value).length > 0) {
      const queryString = new URLSearchParams(currentQuery.value as Record<string, string>).toString()
      url += `?${queryString}`
    }

    if (includeHash && import.meta.client && window.location.hash) {
      url += window.location.hash
    }

    return url
  }

  const shareCurrentPage = async () => {
    const url = getCurrentUrl()
    const title = layoutStore.layoutContext.title || 'Shared Page'

    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url)
      }
    } else {
      // Fallback to clipboard
      await navigator.clipboard.writeText(url)
    }
  }

  // Initialize navigation
  const init = () => {
    navigationStore.init()
  }

  return {
    // State
    history,
    breadcrumbs,
    isNavigating,

    // Route information
    currentPath,
    currentQuery,
    currentParams,
    isAdminRoute,
    isFrontendRoute,
    navigationContext,

    // Navigation data
    frontendNavigation,
    adminNavigation,
    currentNavigation,
    activeNavigationItem,
    navigationTree,

    // Navigation actions
    navigateTo,
    navigateBack,
    navigateToItem,

    // Breadcrumb management
    updateBreadcrumbs,
    setBreadcrumbs,
    addBreadcrumb,

    // Navigation item management
    setNavigationActive,
    findNavigationItem,
    updateNavigationItem,
    addNavigationItem,
    removeNavigationItem,

    // Utilities
    isRouteActive,
    isNavigationItemActive,
    getNavigationItemUrl,
    searchNavigation,

    // History management
    clearHistory,
    removeFromHistory,
    getRecentPages,

    // Route guards
    canNavigateTo,
    withNavigationGuard,

    // Layout integration
    switchToLayout,
    goToAdmin,
    goToFrontend,

    // Mobile helpers
    isMobileNavigation,
    closeMobileNavigation,

    // Advanced patterns
    navigateWithConfirmation,
    navigateWithLoading,

    // URL utilities
    getCurrentUrl,
    shareCurrentPage,

    // Initialization
    init
  }
}
