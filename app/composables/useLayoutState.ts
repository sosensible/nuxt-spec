/**
 * useLayoutState Composable - Phase 3.1: Minimal Version
 * Simple wrapper around layout store
 */

export const useLayoutState = () => {
  const layoutStore = useLayoutStore()

  return {
    // Getters - expose store state as computed
    layoutType: computed(() => layoutStore.layoutType),
    pageTitle: computed(() => layoutStore.pageTitle),
    pageDescription: computed(() => layoutStore.pageDescription),
    isLoading: computed(() => layoutStore.isLoading),
    sidebarCollapsed: computed(() => layoutStore.sidebarCollapsed),
    isFrontend: computed(() => layoutStore.isFrontend),
    isAdmin: computed(() => layoutStore.isAdmin),

    // Actions - expose store actions
    setLayoutType: layoutStore.setLayoutType,
    setPageTitle: layoutStore.setPageTitle,
    setLoading: layoutStore.setLoading,
    toggleSidebar: layoutStore.toggleSidebar
  }
}
