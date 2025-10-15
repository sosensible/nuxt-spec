/**
 * Navigation Pinia Store
 * Manages navigation state, route tracking, and breadcrumb generation
 */

import { defineStore } from 'pinia'
import type { NavigationItem, LayoutType } from '~/types/layout'

export const useNavigationStore = defineStore('navigation', () => {
  const route = useRoute()
  const router = useRouter()

  // Reactive state
  const history = ref<Array<{ path: string, title: string, timestamp: Date }>>([])
  const breadcrumbs = ref<Array<{ label: string, path?: string }>>([])
  const isNavigating = ref(false)

  // Computed properties
  const currentPath = computed(() => route.path)
  const currentQuery = computed(() => route.query)
  const currentParams = computed(() => route.params)
  const isAdminRoute = computed(() => route.path.startsWith('/admin'))
  const isFrontendRoute = computed(() => !route.path.startsWith('/admin'))

  // Get navigation context based on current route
  const navigationContext = computed((): LayoutType => {
    return isAdminRoute.value ? 'admin' : 'frontend'
  })

  // Actions
  function addToHistory(path: string, title?: string) {
    const historyItem = {
      path,
      title: title || path,
      timestamp: new Date()
    }

    // Remove existing entry for this path
    const existingIndex = history.value.findIndex(item => item.path === path)
    if (existingIndex !== -1) {
      history.value.splice(existingIndex, 1)
    }

    // Add to beginning of history
    history.value.unshift(historyItem)

    // Keep only last 50 items
    if (history.value.length > 50) {
      history.value = history.value.slice(0, 50)
    }
  }

  function generateBreadcrumbs(path: string = route.path): Array<{ label: string, path?: string }> {
    const segments = path.split('/').filter(Boolean)
    const crumbs: Array<{ label: string, path?: string }> = []

    if (segments[0] === 'admin') {
      // Admin breadcrumbs
      crumbs.push({ label: 'Dashboard', path: '/admin' })

      const adminSegments = segments.slice(1)
      let currentPath = '/admin'

      adminSegments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === adminSegments.length - 1

        // Format segment label
        const label = formatSegmentLabel(segment)

        crumbs.push({
          label,
          path: isLast ? undefined : currentPath
        })
      })
    } else {
      // Frontend breadcrumbs
      crumbs.push({ label: 'Home', path: '/' })

      let currentPath = ''
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`
        const isLast = index === segments.length - 1

        // Format segment label
        const label = formatSegmentLabel(segment)

        crumbs.push({
          label,
          path: isLast ? undefined : currentPath
        })
      })
    }

    return crumbs
  }

  function formatSegmentLabel(segment: string): string {
    // Convert kebab-case and snake_case to Title Case
    return segment
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  function updateBreadcrumbs(path?: string) {
    breadcrumbs.value = generateBreadcrumbs(path)
  }

  function navigateTo(path: string, title?: string, options?: { replace?: boolean, external?: boolean }) {
    isNavigating.value = true

    addToHistory(path, title)

    if (options?.external) {
      window.location.href = path
      return
    }

    const navigationPromise = options?.replace
      ? router.replace(path)
      : router.push(path)

    navigationPromise
      .then(() => {
        updateBreadcrumbs(path)
      })
      .finally(() => {
        isNavigating.value = false
      })
  }

  function navigateBack() {
    if (history.value.length > 1) {
      const previousPage = history.value[1]
      if (previousPage) {
        navigateTo(previousPage.path, previousPage.title, { replace: true })
      }
    } else {
      router.back()
    }
  }

  function getActiveNavigationItem(navigation: NavigationItem[], path: string = route.path): NavigationItem | null {
    for (const item of navigation) {
      // Exact match
      if (item.path === path) {
        return item
      }

      // Check children
      if (item.children) {
        const activeChild = getActiveNavigationItem(item.children, path)
        if (activeChild) {
          return activeChild
        }
      }

      // Partial match for nested routes
      if (path.startsWith(item.path) && item.path !== '/') {
        return item
      }
    }

    return null
  }

  function findNavigationItem(navigation: NavigationItem[], id: string): NavigationItem | null {
    for (const item of navigation) {
      if (item.id === id) {
        return item
      }

      if (item.children) {
        const found = findNavigationItem(item.children, id)
        if (found) {
          return found
        }
      }
    }

    return null
  }

  function updateNavigationItem(navigation: NavigationItem[], id: string, updates: Partial<NavigationItem>): boolean {
    for (const item of navigation) {
      if (item.id === id) {
        Object.assign(item, updates)
        return true
      }

      if (item.children) {
        const updated = updateNavigationItem(item.children, id, updates)
        if (updated) {
          return true
        }
      }
    }

    return false
  }

  function sortNavigation(navigation: NavigationItem[]): NavigationItem[] {
    return navigation
      .filter(item => item.isVisible !== false)
      .sort((a, b) => (a.order || 0) - (b.order || 0))
      .map(item => ({
        ...item,
        children: item.children ? sortNavigation(item.children) : undefined
      }))
  }

  function getNavigationTree(navigation: NavigationItem[], currentPath: string = route.path): NavigationItem[] {
    return sortNavigation(navigation).map(item => ({
      ...item,
      isActive: item.path === currentPath
        || (currentPath.startsWith(item.path) && item.path !== '/'),
      children: item.children ? getNavigationTree(item.children, currentPath) : undefined
    }))
  }

  function clearHistory() {
    history.value = []
  }

  function removeFromHistory(path: string) {
    const index = history.value.findIndex(item => item.path === path)
    if (index !== -1) {
      history.value.splice(index, 1)
    }
  }

  // Watch for route changes
  watch(() => route.path, (newPath, oldPath) => {
    if (newPath !== oldPath) {
      updateBreadcrumbs(newPath)
      addToHistory(newPath)
    }
  }, { immediate: true })

  // Initialize navigation
  function init() {
    updateBreadcrumbs()
    addToHistory(route.path)
  }

  // Search functionality for navigation items
  function searchNavigation(navigation: NavigationItem[], query: string): NavigationItem[] {
    const results: NavigationItem[] = []
    const searchTerm = query.toLowerCase()

    const searchRecursive = (items: NavigationItem[]) => {
      items.forEach((item) => {
        const matches = item.label.toLowerCase().includes(searchTerm)
          || item.path.toLowerCase().includes(searchTerm)

        if (matches) {
          results.push(item)
        }

        if (item.children) {
          searchRecursive(item.children)
        }
      })
    }

    searchRecursive(navigation)
    return results
  }

  return {
    // State - Using computed instead of readonly to avoid deep readonly issues
    history: computed(() => history.value),
    breadcrumbs: computed(() => breadcrumbs.value),
    isNavigating: computed(() => isNavigating.value),

    // Computed
    currentPath,
    currentQuery,
    currentParams,
    isAdminRoute,
    isFrontendRoute,
    navigationContext,

    // Actions
    addToHistory,
    generateBreadcrumbs,
    updateBreadcrumbs,
    navigateTo,
    navigateBack,
    getActiveNavigationItem,
    findNavigationItem,
    updateNavigationItem,
    sortNavigation,
    getNavigationTree,
    clearHistory,
    removeFromHistory,
    searchNavigation,
    init
  }
})
