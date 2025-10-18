/**
 * Navigation Pinia Store - Phase 8.3: Enhanced with better state management
 * Navigation state with improved breadcrumb and route tracking
 */

import { defineStore } from 'pinia'

export type Breadcrumb = {
  label: string
  to?: string
}

export const useNavigationStore = defineStore('navigation', () => {
  const route = useRoute()

  // Simple reactive state
  const activeNavigationId = ref<string>('')
  const breadcrumbs = ref<Breadcrumb[]>([])

  // Computed
  const currentPath = computed(() => route.path)
  const isAdminRoute = computed(() => route.path.startsWith('/admin'))
  const isFrontendRoute = computed(() => !isAdminRoute.value)

  // Actions
  function setNavigationActive(id: string) {
    activeNavigationId.value = id
  }

  function setBreadcrumbs(crumbs: Breadcrumb[]) {
    breadcrumbs.value = crumbs
  }

  function addBreadcrumb(breadcrumb: Breadcrumb) {
    breadcrumbs.value.push(breadcrumb)
  }

  function clearBreadcrumbs() {
    breadcrumbs.value = []
  }

  return {
    // State
    activeNavigationId: readonly(activeNavigationId),
    breadcrumbs: readonly(breadcrumbs),

    // Computed
    currentPath,
    isAdminRoute,
    isFrontendRoute,

    // Actions
    setNavigationActive,
    setBreadcrumbs,
    addBreadcrumb,
    clearBreadcrumbs
  }
})
