<template>
  <header class="admin-header">
    <div class="admin-header__container">
      <!-- Left Section -->
      <div class="admin-header__left">
        <!-- Mobile Menu Toggle (only visible on mobile) -->
        <UButton
variant="ghost" size="sm" class="admin-header__mobile-toggle"
          :aria-label="sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'" @click="toggleSidebar">
          <UIcon name="i-heroicons-bars-3" class="admin-header__mobile-toggle-icon" />
        </UButton>

        <!-- Breadcrumbs -->
        <nav v-if="showBreadcrumb && breadcrumbs.length > 0" class="admin-header__breadcrumb" aria-label="Breadcrumb">
          <UBreadcrumb :links="breadcrumbLinks" class="admin-header__breadcrumb-list" />
        </nav>

        <!-- Page Title (fallback if no breadcrumbs) -->
        <h1 v-else-if="pageTitle" class="admin-header__title">
          {{ pageTitle }}
        </h1>
      </div>

      <!-- Right Section -->
      <div class="admin-header__right">
        <!-- Search -->
        <div v-if="showSearch" class="admin-header__search">
          <UInput
v-model="searchQuery" placeholder="Search..." icon="i-heroicons-magnifying-glass" size="sm"
            class="admin-header__search-input" @keydown.enter="handleSearch" />
        </div>

        <!-- Quick Actions -->
        <div class="admin-header__actions">
          <!-- Notifications -->
          <div v-if="showNotifications" class="admin-header__notifications">
            <UButton
variant="ghost" size="sm" class="admin-header__notification-button"
              :class="{ 'admin-header__notification-button--has-unread': hasUnreadNotifications }"
              :aria-label="`Notifications ${hasUnreadNotifications ? `(${unreadCount} unread)` : ''}`"
              @click="toggleNotifications">
              <UIcon name="i-heroicons-bell" class="admin-header__notification-icon" />
              <span v-if="hasUnreadNotifications" class="admin-header__notification-badge">
                {{ unreadCount > 99 ? '99+' : unreadCount }}
              </span>
            </UButton>

            <!-- Notification Dropdown -->
            <div v-if="showNotificationDropdown" class="admin-header__notification-dropdown">
              <div class="admin-header__notification-header">
                <h3 class="admin-header__notification-title">
                  Notifications
                </h3>
                <UButton variant="ghost" size="xs" @click="markAllAsRead">
                  Mark all read
                </UButton>
              </div>

              <div class="admin-header__notification-list">
                <div v-if="notifications.length === 0" class="admin-header__notification-empty">
                  <UIcon name="i-heroicons-bell-slash" class="admin-header__notification-empty-icon" />
                  <p class="admin-header__notification-empty-text">
                    No notifications
                  </p>
                </div>

                <div
v-for="notification in notifications.slice(0, 5)" :key="notification.id"
                  class="admin-header__notification-item"
                  :class="{ 'admin-header__notification-item--unread': !notification.isRead }">
                  <div class="admin-header__notification-content">
                    <h4 class="admin-header__notification-item-title">
                      {{ notification.title }}
                    </h4>
                    <p v-if="notification.message" class="admin-header__notification-item-message">
                      {{ notification.message }}
                    </p>
                    <time class="admin-header__notification-item-time">
                      {{ formatNotificationTime(notification.timestamp) }}
                    </time>
                  </div>
                </div>
              </div>

              <div class="admin-header__notification-footer">
                <UButton variant="ghost" size="sm" to="/admin/notifications" block>
                  View all notifications
                </UButton>
              </div>
            </div>
          </div>

          <!-- User Menu -->
          <div v-if="showUserMenu" class="admin-header__user-menu">
            <UButton
variant="ghost" size="sm" class="admin-header__user-button" :aria-expanded="showUserDropdown"
              aria-haspopup="menu" @click="toggleUserMenu">
              <div class="admin-header__user-avatar">
                <UIcon name="i-heroicons-user-circle" class="admin-header__user-avatar-icon" />
              </div>
              <div class="admin-header__user-info">
                <span class="admin-header__user-name">Admin User</span>
                <span class="admin-header__user-role">Administrator</span>
              </div>
              <UIcon
name="i-heroicons-chevron-down" class="admin-header__user-chevron"
                :class="{ 'admin-header__user-chevron--open': showUserDropdown }" />
            </UButton>

            <!-- User Dropdown -->
            <div v-if="showUserDropdown" class="admin-header__user-dropdown" role="menu">
              <div class="admin-header__user-dropdown-header">
                <div class="admin-header__user-dropdown-info">
                  <div class="admin-header__user-dropdown-name">
                    Admin User
                  </div>
                  <div class="admin-header__user-dropdown-email">
                    admin@example.com
                  </div>
                </div>
              </div>

              <div class="admin-header__user-dropdown-menu">
                <UButton
variant="ghost" size="sm" to="/admin/profile" class="admin-header__user-dropdown-item"
                  role="menuitem">
                  <UIcon name="i-heroicons-user" />
                  Profile
                </UButton>

                <UButton
variant="ghost" size="sm" to="/admin/settings" class="admin-header__user-dropdown-item"
                  role="menuitem">
                  <UIcon name="i-heroicons-cog-6-tooth" />
                  Settings
                </UButton>

                <div class="admin-header__user-dropdown-divider" />

                <UButton
variant="ghost" size="sm"
                  class="admin-header__user-dropdown-item admin-header__user-dropdown-item--danger" role="menuitem"
                  @click="handleLogout">
                  <UIcon name="i-heroicons-arrow-right-on-rectangle" />
                  Sign out
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import type { AdminNotification } from '~/types/admin'

// Props
interface Props {
  showBreadcrumb?: boolean
  showSearch?: boolean
  showNotifications?: boolean
  showUserMenu?: boolean
}

const _props = withDefaults(defineProps<Props>(), {
  showBreadcrumb: true,
  showSearch: true,
  showNotifications: true,
  showUserMenu: true
})

// Composables
const {
  adminConfig: _adminConfig,
  sidebarCollapsed,
  toggleSidebar,
  pageTitle,
  isMobile: _isMobile
} = useLayoutState()

const { breadcrumbs, navigateTo } = useNavigation()

// State
const searchQuery = ref('')
const showNotificationDropdown = ref(false)
const showUserDropdown = ref(false)

// Mock notifications (replace with real data)
const notifications = ref<AdminNotification[]>([
  {
    id: '1',
    type: 'info',
    title: 'System Update',
    message: 'New features have been deployed',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false
  },
  {
    id: '2',
    type: 'warning',
    title: 'Storage Warning',
    message: 'Disk usage is approaching 85%',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false
  },
  {
    id: '3',
    type: 'success',
    title: 'Backup Complete',
    message: 'Daily backup completed successfully',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true
  }
])

// Computed
const breadcrumbLinks = computed(() =>
  breadcrumbs.value.map(crumb => ({
    label: crumb.label,
    to: crumb.path
  }))
)

const hasUnreadNotifications = computed(() =>
  notifications.value.some(n => !n.isRead)
)

const unreadCount = computed(() =>
  notifications.value.filter(n => !n.isRead).length
)

// Methods
const toggleNotifications = () => {
  showNotificationDropdown.value = !showNotificationDropdown.value
  if (showUserDropdown.value) {
    showUserDropdown.value = false
  }
}

const toggleUserMenu = () => {
  showUserDropdown.value = !showUserDropdown.value
  if (showNotificationDropdown.value) {
    showNotificationDropdown.value = false
  }
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    // Implement search functionality
    console.log('Searching for:', searchQuery.value)
    navigateTo(`/admin/search?q=${encodeURIComponent(searchQuery.value)}`)
  }
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
}

const formatNotificationTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const handleLogout = () => {
  // Implement logout functionality
  if (confirm('Are you sure you want to sign out?')) {
    navigateTo('/')
  }
}

// Close dropdowns when clicking outside
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.admin-header__notifications')) {
      showNotificationDropdown.value = false
    }
    if (!target.closest('.admin-header__user-menu')) {
      showUserDropdown.value = false
    }
  })
})

// Close dropdowns on escape key
onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      showNotificationDropdown.value = false
      showUserDropdown.value = false
    }
  })
})
</script>

<style scoped>
.admin-header {
  @apply bg-white border-b border-gray-200 sticky top-0 z-20;
  height: var(--admin-header-height, 60px);
}

.admin-header__container {
  @apply h-full px-4 lg:px-6 flex items-center justify-between;
}

/* Left Section */
.admin-header__left {
  @apply flex items-center space-x-4 min-w-0 flex-1;
}

.admin-header__mobile-toggle {
  @apply lg:hidden flex-shrink-0;
}

.admin-header__mobile-toggle-icon {
  @apply w-5 h-5;
}

.admin-header__breadcrumb {
  @apply hidden sm:block;
}

.admin-header__title {
  @apply text-xl font-semibold text-gray-900 truncate;
}

/* Right Section */
.admin-header__right {
  @apply flex items-center space-x-3;
}

.admin-header__search {
  @apply hidden md:block;
}

.admin-header__search-input {
  @apply w-64;
}

.admin-header__actions {
  @apply flex items-center space-x-2;
}

/* Notifications */
.admin-header__notifications {
  @apply relative;
}

.admin-header__notification-button {
  @apply relative p-2;
}

.admin-header__notification-button--has-unread {
  @apply text-blue-600;
}

.admin-header__notification-icon {
  @apply w-5 h-5;
}

.admin-header__notification-badge {
  @apply absolute -top-1 -right-1 bg-red-500 text-white text-xs;
  @apply rounded-full w-5 h-5 flex items-center justify-center;
  @apply font-medium min-w-[20px];
}

.admin-header__notification-dropdown {
  @apply absolute right-0 top-full mt-2 w-80;
  @apply bg-white rounded-lg shadow-lg border border-gray-200;
  @apply max-h-96 overflow-hidden z-50;
}

.admin-header__notification-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.admin-header__notification-title {
  @apply font-semibold text-gray-900;
}

.admin-header__notification-list {
  @apply max-h-64 overflow-y-auto;
}

.admin-header__notification-empty {
  @apply p-8 text-center;
}

.admin-header__notification-empty-icon {
  @apply w-12 h-12 text-gray-400 mx-auto mb-3;
}

.admin-header__notification-empty-text {
  @apply text-gray-500;
}

.admin-header__notification-item {
  @apply p-4 border-b border-gray-100 hover:bg-gray-50;
  @apply transition-colors cursor-pointer;
}

.admin-header__notification-item--unread {
  @apply bg-blue-50 border-blue-100;
}

.admin-header__notification-content {
  @apply space-y-1;
}

.admin-header__notification-item-title {
  @apply font-medium text-gray-900 text-sm;
}

.admin-header__notification-item-message {
  @apply text-gray-600 text-sm;
}

.admin-header__notification-item-time {
  @apply text-gray-500 text-xs;
}

.admin-header__notification-footer {
  @apply p-3 border-t border-gray-200;
}

/* User Menu */
.admin-header__user-menu {
  @apply relative;
}

.admin-header__user-button {
  @apply flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg;
  @apply transition-colors;
}

.admin-header__user-avatar {
  @apply flex-shrink-0;
}

.admin-header__user-avatar-icon {
  @apply w-8 h-8 text-gray-400;
}

.admin-header__user-info {
  @apply hidden sm:flex flex-col items-start min-w-0;
}

.admin-header__user-name {
  @apply text-sm font-medium text-gray-900 truncate;
}

.admin-header__user-role {
  @apply text-xs text-gray-500 truncate;
}

.admin-header__user-chevron {
  @apply w-4 h-4 text-gray-400 transition-transform;
}

.admin-header__user-chevron--open {
  @apply transform rotate-180;
}

.admin-header__user-dropdown {
  @apply absolute right-0 top-full mt-2 w-64;
  @apply bg-white rounded-lg shadow-lg border border-gray-200;
  @apply overflow-hidden z-50;
}

.admin-header__user-dropdown-header {
  @apply p-4 bg-gray-50 border-b border-gray-200;
}

.admin-header__user-dropdown-info {
  @apply space-y-1;
}

.admin-header__user-dropdown-name {
  @apply font-medium text-gray-900;
}

.admin-header__user-dropdown-email {
  @apply text-sm text-gray-500;
}

.admin-header__user-dropdown-menu {
  @apply p-2;
}

.admin-header__user-dropdown-item {
  @apply w-full justify-start px-3 py-2 text-sm;
  @apply hover:bg-gray-50 rounded-md;
}

.admin-header__user-dropdown-item--danger {
  @apply text-red-600 hover:text-red-700 hover:bg-red-50;
}

.admin-header__user-dropdown-divider {
  @apply border-t border-gray-200 my-2;
}

/* Dark mode */
.dark .admin-header {
  @apply bg-gray-800 border-gray-700;
}

.dark .admin-header__title {
  @apply text-white;
}

.dark .admin-header__user-button {
  @apply hover:bg-gray-700;
}

.dark .admin-header__user-name {
  @apply text-white;
}

.dark .admin-header__user-role {
  @apply text-gray-400;
}

.dark .admin-header__notification-dropdown,
.dark .admin-header__user-dropdown {
  @apply bg-gray-800 border-gray-700;
}

.dark .admin-header__notification-header,
.dark .admin-header__user-dropdown-header {
  @apply bg-gray-700 border-gray-600;
}

.dark .admin-header__notification-title,
.dark .admin-header__user-dropdown-name {
  @apply text-white;
}

.dark .admin-header__notification-item {
  @apply border-gray-700 hover:bg-gray-700;
}

.dark .admin-header__notification-item--unread {
  @apply bg-blue-900 border-blue-800;
}

.dark .admin-header__user-dropdown-item {
  @apply hover:bg-gray-700;
}

.dark .admin-header__user-dropdown-item--danger {
  @apply text-red-400 hover:text-red-300 hover:bg-red-900;
}
</style>
