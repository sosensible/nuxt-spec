/**
 * Layout Pinia Store - Phase 2.2: Minimal Version
 * Basic state management for layout without complex initialization
 */

import { defineStore } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  // Simple reactive state
  const layoutType = ref<'frontend' | 'admin'>('frontend')
  const pageTitle = ref<string>('')
  const pageDescription = ref<string | undefined>()
  const isLoading = ref(false)
  const sidebarCollapsed = ref(false)

  // Computed
  const isFrontend = computed(() => layoutType.value === 'frontend')
  const isAdmin = computed(() => layoutType.value === 'admin')

  // Actions
  function setLayoutType(type: 'frontend' | 'admin') {
    layoutType.value = type
  }

  function setPageTitle(title: string, description?: string) {
    pageTitle.value = title
    pageDescription.value = description
  }

  function setLoading(loading: boolean) {
    isLoading.value = loading
  }

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  return {
    // State
    layoutType: readonly(layoutType),
    pageTitle: readonly(pageTitle),
    pageDescription: readonly(pageDescription),
    isLoading: readonly(isLoading),
    sidebarCollapsed: readonly(sidebarCollapsed),

    // Computed
    isFrontend,
    isAdmin,

    // Actions
    setLayoutType,
    setPageTitle,
    setLoading,
    toggleSidebar
  }
})
