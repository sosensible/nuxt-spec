/**
 * Layout Pinia Store - Phase 8.3: Enhanced with persistence
 * State management for layout with localStorage persistence
 */

import { defineStore } from 'pinia'

const SIDEBAR_STORAGE_KEY = 'nuxt-layout-sidebar-collapsed'

export const useLayoutStore = defineStore('layout', () => {
  // Initialize sidebar state from localStorage (client-side only)
  const savedSidebarState = import.meta.client
    ? localStorage.getItem(SIDEBAR_STORAGE_KEY)
    : null
  const initialSidebarCollapsed = savedSidebarState ? savedSidebarState === 'true' : false

  // Simple reactive state
  const layoutType = ref<'frontend' | 'admin'>('frontend')
  const pageTitle = ref<string>('')
  const pageDescription = ref<string | undefined>()
  const isLoading = ref(false)
  const sidebarCollapsed = ref(initialSidebarCollapsed)

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
    // Persist to localStorage (client-side only)
    if (import.meta.client) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed.value))
    }
  }

  function setSidebarCollapsed(collapsed: boolean) {
    sidebarCollapsed.value = collapsed
    // Persist to localStorage (client-side only)
    if (import.meta.client) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed))
    }
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
    toggleSidebar,
    setSidebarCollapsed
  }
})
