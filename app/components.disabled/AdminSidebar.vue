<template>
  <aside
    class="admin-sidebar"
    :class="sidebarClasses"
  >
    <!-- Sidebar Header -->
    <div class="admin-sidebar__header">
      <div class="admin-sidebar__brand">
        <AppLogo class="admin-sidebar__logo" />
        <transition name="sidebar-text">
          <span
            v-if="!isCollapsed"
            class="admin-sidebar__brand-text"
          >
            Admin Panel
          </span>
        </transition>
      </div>

      <UButton
        v-if="canToggle"
        variant="ghost"
        size="sm"
        class="admin-sidebar__toggle"
        :class="{ 'admin-sidebar__toggle--collapsed': isCollapsed }"
        :aria-label="isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'"
        @click="toggleSidebar"
      >
        <UIcon
          :name="isCollapsed ? 'i-heroicons-chevron-right' : 'i-heroicons-chevron-left'"
          class="admin-sidebar__toggle-icon"
        />
      </UButton>
    </div>

    <!-- Navigation -->
    <nav
      class="admin-sidebar__nav"
      aria-label="Admin navigation"
    >
      <ul class="admin-sidebar__nav-list">
        <li
          v-for="item in visibleNavigation"
          :key="item.id"
          class="admin-sidebar__nav-item"
          :class="{ 'admin-sidebar__nav-item--has-children': item.children }"
        >
          <!-- Main Navigation Link -->
          <component
            :is="item.children ? 'button' : 'NuxtLink'"
            :to="item.children ? undefined : item.path"
            class="admin-sidebar__nav-link"
            :class="{
              'admin-sidebar__nav-link--active': item.isActive,
              'admin-sidebar__nav-link--parent': item.children,
              'admin-sidebar__nav-link--collapsed': isCollapsed
            }"
            :aria-expanded="item.children ? submenuStates[item.id] : undefined"
            @click="item.children ? toggleSubmenu(item.id) : handleNavigationClick(item)"
          >
            <div class="admin-sidebar__nav-link-content">
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="admin-sidebar__nav-icon"
              />

              <transition name="sidebar-text">
                <span
                  v-if="!isCollapsed"
                  class="admin-sidebar__nav-text"
                >
                  {{ item.label }}
                </span>
              </transition>

              <UBadge
                v-if="item.badge && !isCollapsed"
                class="admin-sidebar__nav-badge"
                size="xs"
                variant="solid"
                color="primary"
              >
                {{ item.badge }}
              </UBadge>

              <UIcon
                v-if="item.children && !isCollapsed"
                :name="submenuStates[item.id] ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="admin-sidebar__nav-chevron"
              />
            </div>
          </component>

          <!-- Submenu -->
          <transition name="submenu">
            <ul
              v-if="item.children && submenuStates[item.id] && !isCollapsed"
              class="admin-sidebar__submenu"
            >
              <li
                v-for="child in item.children"
                :key="child.id"
                class="admin-sidebar__submenu-item"
              >
                <NuxtLink
                  :to="child.path"
                  class="admin-sidebar__submenu-link"
                  :class="{ 'admin-sidebar__submenu-link--active': child.isActive }"
                  @click="handleNavigationClick(child)"
                >
                  <UIcon
                    v-if="child.icon"
                    :name="child.icon"
                    class="admin-sidebar__submenu-icon"
                  />
                  <span class="admin-sidebar__submenu-text">
                    {{ child.label }}
                  </span>
                  <UBadge
                    v-if="child.badge"
                    class="admin-sidebar__submenu-badge"
                    size="xs"
                    variant="soft"
                    color="neutral"
                  >
                    {{ child.badge }}
                  </UBadge>
                </NuxtLink>
              </li>
            </ul>
          </transition>

          <!-- Collapsed Tooltip -->
          <div
            v-if="isCollapsed && item.children"
            class="admin-sidebar__tooltip"
          >
            <div class="admin-sidebar__tooltip-content">
              <div class="admin-sidebar__tooltip-title">
                {{ item.label }}
              </div>
              <ul class="admin-sidebar__tooltip-list">
                <li
                  v-for="child in item.children"
                  :key="child.id"
                  class="admin-sidebar__tooltip-item"
                >
                  <NuxtLink
                    :to="child.path"
                    class="admin-sidebar__tooltip-link"
                    @click="handleNavigationClick(child)"
                  >
                    {{ child.label }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>
    </nav>

    <!-- Sidebar Footer -->
    <div class="admin-sidebar__footer">
      <div class="admin-sidebar__user">
        <div class="admin-sidebar__user-avatar">
          <UIcon
            name="i-heroicons-user-circle"
            class="admin-sidebar__user-icon"
          />
        </div>
        <transition name="sidebar-text">
          <div
            v-if="!isCollapsed"
            class="admin-sidebar__user-info"
          >
            <div class="admin-sidebar__user-name">
              Admin User
            </div>
            <div class="admin-sidebar__user-role">
              Administrator
            </div>
          </div>
        </transition>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationItem } from '~/types/layout'

// Props
interface Props {
  navigation?: NavigationItem[]
}

const props = defineProps<Props>()

// Composables
const {
  adminConfig,
  sidebarCollapsed: isCollapsed,
  canToggleSidebar: canToggle,
  toggleSidebar,
  isMobile
} = useLayoutState()

const { setNavigationActive } = useNavigation()

// State
const submenuStates = ref<Record<string, boolean>>({})

// Computed
const visibleNavigation = computed(() => {
  const nav = props.navigation || adminConfig.value.navigation
  return nav.filter(item => item.isVisible !== false)
})

const sidebarClasses = computed(() => ({
  'admin-sidebar--collapsed': isCollapsed.value,
  'admin-sidebar--mobile': isMobile.value,
  'admin-sidebar--expanded': !isCollapsed.value
}))

// Methods
const toggleSubmenu = (itemId: string) => {
  submenuStates.value[itemId] = !submenuStates.value[itemId]
}

const handleNavigationClick = (item: NavigationItem) => {
  setNavigationActive(item.id)

  // Close mobile sidebar after navigation
  if (isMobile.value) {
    toggleSidebar()
  }
}

// Initialize submenu states
onMounted(() => {
  visibleNavigation.value.forEach((item) => {
    if (item.children) {
      // Open submenus that contain active items
      const hasActiveChild = item.children.some(child => child.isActive)
      submenuStates.value[item.id] = hasActiveChild || false
    }
  })
})

// Watch for navigation changes to update submenu states
watch(visibleNavigation, (newNav) => {
  newNav.forEach((item) => {
    if (item.children && !(item.id in submenuStates.value)) {
      const hasActiveChild = item.children.some(child => child.isActive)
      submenuStates.value[item.id] = hasActiveChild || false
    }
  })
}, { deep: true })

// Auto-collapse on mobile
watch(isMobile, (newIsMobile) => {
  if (newIsMobile && !isCollapsed.value) {
    toggleSidebar()
  }
})
</script>

<style scoped>
.admin-sidebar {
  @apply fixed left-0 top-0 h-full bg-white border-r border-gray-200;
  @apply flex flex-col z-30 transition-all duration-300 ease-in-out;
  width: var(--layout-sidebar-expanded-width, 240px);
}

.admin-sidebar--collapsed {
  width: var(--layout-sidebar-collapsed-width, 64px);
}

.admin-sidebar--mobile {
  @apply absolute shadow-xl;
}

/* Header */
.admin-sidebar__header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
  @apply min-h-[60px];
}

.admin-sidebar__brand {
  @apply flex items-center space-x-3 min-w-0;
}

.admin-sidebar__logo {
  @apply w-8 h-8 flex-shrink-0 text-blue-600;
}

.admin-sidebar__brand-text {
  @apply text-lg font-semibold text-gray-900 truncate;
}

.admin-sidebar__toggle {
  @apply flex-shrink-0 w-8 h-8 p-0;
  @apply hover:bg-gray-100 transition-colors;
}

.admin-sidebar__toggle-icon {
  @apply w-4 h-4;
}

/* Navigation */
.admin-sidebar__nav {
  @apply flex-1 overflow-y-auto p-2;
}

.admin-sidebar__nav-list {
  @apply space-y-1 list-none m-0 p-0;
}

.admin-sidebar__nav-item {
  @apply relative;
}

.admin-sidebar__nav-link {
  @apply w-full flex items-center px-3 py-2 rounded-lg;
  @apply text-gray-700 hover:bg-gray-100 hover:text-gray-900;
  @apply transition-all duration-200 no-underline;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}

.admin-sidebar__nav-link--active {
  @apply bg-blue-50 text-blue-700 border border-blue-200;
}

.admin-sidebar__nav-link--parent {
  @apply cursor-pointer;
}

.admin-sidebar__nav-link--collapsed {
  @apply justify-center px-2;
}

.admin-sidebar__nav-link-content {
  @apply flex items-center w-full min-w-0;
}

.admin-sidebar__nav-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.admin-sidebar__nav-text {
  @apply ml-3 font-medium truncate flex-1;
}

.admin-sidebar__nav-badge {
  @apply ml-auto flex-shrink-0;
}

.admin-sidebar__nav-chevron {
  @apply w-4 h-4 ml-2 flex-shrink-0;
}

/* Submenu */
.admin-sidebar__submenu {
  @apply ml-8 mt-1 space-y-1 list-none m-0 p-0;
}

.admin-sidebar__submenu-item {
  @apply block;
}

.admin-sidebar__submenu-link {
  @apply flex items-center px-3 py-2 rounded-lg text-sm;
  @apply text-gray-600 hover:bg-gray-50 hover:text-gray-900;
  @apply transition-colors duration-200 no-underline;
}

.admin-sidebar__submenu-link--active {
  @apply bg-blue-50 text-blue-600;
}

.admin-sidebar__submenu-icon {
  @apply w-4 h-4 flex-shrink-0;
}

.admin-sidebar__submenu-text {
  @apply ml-2 font-medium truncate flex-1;
}

.admin-sidebar__submenu-badge {
  @apply ml-auto flex-shrink-0;
}

/* Tooltip for collapsed state */
.admin-sidebar__tooltip {
  @apply absolute left-full top-0 ml-2 z-50;
  @apply opacity-0 invisible group-hover:opacity-100 group-hover:visible;
  @apply transition-all duration-200;
}

.admin-sidebar__tooltip-content {
  @apply bg-gray-900 text-white text-sm rounded-lg p-3 shadow-lg;
  @apply min-w-[200px];
}

.admin-sidebar__tooltip-title {
  @apply font-semibold mb-2 text-gray-200;
}

.admin-sidebar__tooltip-list {
  @apply space-y-1 list-none m-0 p-0;
}

.admin-sidebar__tooltip-item {
  @apply block;
}

.admin-sidebar__tooltip-link {
  @apply block px-2 py-1 rounded text-gray-300 hover:text-white hover:bg-gray-800;
  @apply transition-colors no-underline;
}

/* Footer */
.admin-sidebar__footer {
  @apply p-4 border-t border-gray-200;
}

.admin-sidebar__user {
  @apply flex items-center space-x-3;
}

.admin-sidebar__user-avatar {
  @apply flex-shrink-0;
}

.admin-sidebar__user-icon {
  @apply w-8 h-8 text-gray-400;
}

.admin-sidebar__user-info {
  @apply min-w-0 flex-1;
}

.admin-sidebar__user-name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.admin-sidebar__user-role {
  @apply text-xs text-gray-500 truncate;
}

/* Transitions */
.sidebar-text-enter-active,
.sidebar-text-leave-active {
  @apply transition-all duration-300;
}

.sidebar-text-enter-from,
.sidebar-text-leave-to {
  @apply opacity-0 transform scale-95;
}

.submenu-enter-active,
.submenu-leave-active {
  @apply transition-all duration-200;
}

.submenu-enter-from,
.submenu-leave-to {
  @apply opacity-0 transform -translate-y-2;
}

/* Dark mode */
.dark .admin-sidebar {
  @apply bg-gray-800 border-gray-700;
}

.dark .admin-sidebar__header {
  @apply border-gray-700;
}

.dark .admin-sidebar__brand-text {
  @apply text-white;
}

.dark .admin-sidebar__toggle {
  @apply hover:bg-gray-700;
}

.dark .admin-sidebar__nav-link {
  @apply text-gray-300 hover:bg-gray-700 hover:text-white;
}

.dark .admin-sidebar__nav-link--active {
  @apply bg-blue-600 text-white border-blue-500;
}

.dark .admin-sidebar__submenu-link {
  @apply text-gray-400 hover:bg-gray-700 hover:text-white;
}

.dark .admin-sidebar__submenu-link--active {
  @apply bg-blue-600 text-white;
}

.dark .admin-sidebar__footer {
  @apply border-gray-700;
}

.dark .admin-sidebar__user-name {
  @apply text-white;
}

.dark .admin-sidebar__user-role {
  @apply text-gray-400;
}

/* Responsive */
@media (max-width: 1024px) {
  .admin-sidebar--mobile {
    @apply transform -translate-x-full;
  }

  .admin-sidebar--mobile.admin-sidebar--expanded {
    @apply transform translate-x-0;
  }
}

/* Hover effects for tooltip trigger */
.admin-sidebar--collapsed .admin-sidebar__nav-item:hover .admin-sidebar__tooltip {
  @apply opacity-100 visible;
}
</style>
