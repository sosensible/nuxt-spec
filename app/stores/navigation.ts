/**
 * Navigation Pinia Store - Phase 2.3: Minimal Version
 * Basic navigation state without complex route tracking
 */

import { defineStore } from 'pinia'

export const useNavigationStore = defineStore('navigation', () => {
  const route = useRoute()

  // Simple reactive state
  const activeNavigationId = ref<string>('')
  const breadcrumbs = ref<Array<{ label: string, to?: string }>>([])

  // Computed
  const currentPath = computed(() => route.path)
  const isAdminRoute = computed(() => route.path.startsWith('/admin'))

  // Actions
  function setNavigationActive(id: string) {
    activeNavigationId.value = id
  }

  function setBreadcrumbs(crumbs: Array<{ label: string, to?: string }>) {
    breadcrumbs.value = crumbs
  }

  return {
    // State
    activeNavigationId: readonly(activeNavigationId),
    breadcrumbs: readonly(breadcrumbs),

    // Computed
    currentPath,
    isAdminRoute,

    // Actions
    setNavigationActive,
    setBreadcrumbs
  }
})
