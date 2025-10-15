/**
 * useNavigation Composable - Phase 3.2: Minimal Version
 * Simple wrapper around navigation store
 */

export const useNavigation = () => {
  const navStore = useNavigationStore()

  return {
    // Getters - expose store state as computed
    activeNavigationId: computed(() => navStore.activeNavigationId),
    breadcrumbs: computed(() => navStore.breadcrumbs),
    currentPath: computed(() => navStore.currentPath),
    isAdminRoute: computed(() => navStore.isAdminRoute),

    // Actions - expose store actions
    setNavigationActive: navStore.setNavigationActive,
    setBreadcrumbs: navStore.setBreadcrumbs
  }
}
