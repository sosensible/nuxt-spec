/**
 * useNavigation Composable - Phase 3.2: Minimal Version
 * Simple wrapper around navigation store
 * Extended for cross-section navigation (feature 002-basic-usability-i)
 */

export type SectionType = 'frontend' | 'admin'

export interface CrossSectionNav {
  /** Current section: 'frontend' or 'admin' */
  currentSection: SectionType
  /** Path to navigate to opposite section */
  targetPath: string
  /** User-facing label for cross-section link */
  targetLabel: string
  /** Whether to show cross-section navigation (always true for now) */
  showNav: boolean
}

export const useNavigation = () => {
  const navStore = useNavigationStore()
  const route = useRoute()

  /**
   * Cross-section navigation context
   * Computed based on current route
   *
   * @example
   * ```vue
   * <script setup>
   * const { crossSection } = useNavigation()
   * </script>
   *
   * <template>
   *   <NuxtLink v-if="crossSection.showNav" :to="crossSection.targetPath">
   *     {{ crossSection.targetLabel }}
   *   </NuxtLink>
   * </template>
   * ```
   */
  const crossSection = computed<CrossSectionNav>(() => {
    const isAdmin = route.path.startsWith('/admin')

    return {
      currentSection: isAdmin ? 'admin' : 'frontend',
      targetPath: isAdmin ? '/' : '/admin',
      targetLabel: isAdmin ? 'View Site' : 'Admin Panel',
      showNav: true,
    }
  })

  return {
    // Getters - expose store state as computed
    activeNavigationId: computed(() => navStore.activeNavigationId),
    breadcrumbs: computed(() => navStore.breadcrumbs),
    currentPath: computed(() => navStore.currentPath),
    isAdminRoute: computed(() => navStore.isAdminRoute),

    // Cross-section navigation (feature 002-basic-usability-i)
    crossSection,

    // Actions - expose store actions
    setNavigationActive: navStore.setNavigationActive,
    setBreadcrumbs: navStore.setBreadcrumbs,
  }
}
