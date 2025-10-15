<template>
  <div class="admin-dashboard">
    <!-- Page Header -->
    <div class="admin-dashboard__header">
      <div class="admin-dashboard__title-section">
        <h1 class="admin-dashboard__title">
          Dashboard
        </h1>
        <p class="admin-dashboard__subtitle">
          Welcome back! Here's what's happening with your system.
        </p>
      </div>

      <div class="admin-dashboard__actions">
        <UButton variant="outline" color="neutral" size="sm" :loading="isRefreshing" @click="refreshData">
          <UIcon name="i-heroicons-arrow-path" />
          Refresh
        </UButton>

        <UButton variant="solid" color="primary" size="sm" to="/admin/users">
          <UIcon name="i-heroicons-plus" />
          Add User
        </UButton>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="admin-dashboard__stats">
      <div v-for="stat in stats" :key="stat.id" class="admin-dashboard__stat-card">
        <div class="admin-dashboard__stat-icon">
          <UIcon :name="stat.icon" class="admin-dashboard__stat-icon-svg" :class="stat.color" />
        </div>
        <div class="admin-dashboard__stat-content">
          <div class="admin-dashboard__stat-value">
            {{ stat.value }}
          </div>
          <div class="admin-dashboard__stat-label">
            {{ stat.label }}
          </div>
          <div class="admin-dashboard__stat-change">
            <UIcon :name="stat.change > 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
              class="admin-dashboard__stat-change-icon" :class="stat.change > 0 ? 'text-green-500' : 'text-red-500'" />
            <span class="admin-dashboard__stat-change-text"
              :class="stat.change > 0 ? 'text-green-600' : 'text-red-600'">
              {{ Math.abs(stat.change) }}% from last month
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="admin-dashboard__content">
      <!-- Recent Activity -->
      <div class="admin-dashboard__card">
        <div class="admin-dashboard__card-header">
          <h2 class="admin-dashboard__card-title">
            Recent Activity
          </h2>
          <UButton variant="ghost" size="xs" to="/admin/activity">
            View all
          </UButton>
        </div>

        <div class="admin-dashboard__card-content">
          <div v-if="activities.length === 0" class="admin-dashboard__empty">
            <UIcon name="i-heroicons-clock" class="admin-dashboard__empty-icon" />
            <p class="admin-dashboard__empty-text">
              No recent activity
            </p>
          </div>

          <div v-else class="admin-dashboard__activity-list">
            <div v-for="activity in activities.slice(0, 5)" :key="activity.id" class="admin-dashboard__activity-item">
              <div class="admin-dashboard__activity-icon">
                <UIcon :name="activity.icon" class="admin-dashboard__activity-icon-svg" />
              </div>
              <div class="admin-dashboard__activity-content">
                <div class="admin-dashboard__activity-title">
                  {{ activity.title }}
                </div>
                <div class="admin-dashboard__activity-description">
                  {{ activity.description }}
                </div>
                <div class="admin-dashboard__activity-time">
                  {{ formatTime(activity.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="admin-dashboard__card">
        <div class="admin-dashboard__card-header">
          <h2 class="admin-dashboard__card-title">
            System Status
          </h2>
          <div class="admin-dashboard__status-indicator">
            <div class="admin-dashboard__status-dot admin-dashboard__status-dot--healthy" />
            <span class="admin-dashboard__status-text">All systems operational</span>
          </div>
        </div>

        <div class="admin-dashboard__card-content">
          <div class="admin-dashboard__status-list">
            <div v-for="service in systemStatus" :key="service.id" class="admin-dashboard__status-item">
              <div class="admin-dashboard__status-item-info">
                <div class="admin-dashboard__status-item-name">
                  {{ service.name }}
                </div>
                <div class="admin-dashboard__status-item-description">
                  {{ service.description }}
                </div>
              </div>
              <div class="admin-dashboard__status-item-status">
                <div class="admin-dashboard__status-item-dot" :class="{
                  'admin-dashboard__status-item-dot--healthy': service.status === 'healthy',
                  'admin-dashboard__status-item-dot--warning': service.status === 'warning',
                  'admin-dashboard__status-item-dot--error': service.status === 'error'
                }" />
                <span class="admin-dashboard__status-item-text">
                  {{ service.statusText }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="admin-dashboard__card">
        <div class="admin-dashboard__card-header">
          <h2 class="admin-dashboard__card-title">
            Quick Actions
          </h2>
        </div>

        <div class="admin-dashboard__card-content">
          <div class="admin-dashboard__quick-actions">
            <UButton v-for="action in quickActions" :key="action.id" :variant="action.variant" :color="action.color"
              size="sm" :to="action.to" class="admin-dashboard__quick-action">
              <UIcon :name="action.icon" />
              {{ action.label }}
            </UButton>
          </div>
        </div>
      </div>

      <!-- Recent Users -->
      <div class="admin-dashboard__card admin-dashboard__card--full">
        <div class="admin-dashboard__card-header">
          <h2 class="admin-dashboard__card-title">
            Recent Users
          </h2>
          <UButton variant="ghost" size="xs" to="/admin/users">
            Manage users
          </UButton>
        </div>

        <div class="admin-dashboard__card-content">
          <div class="admin-dashboard__users-table">
            <div class="admin-dashboard__users-header">
              <div class="admin-dashboard__users-header-cell">
                User
              </div>
              <div class="admin-dashboard__users-header-cell">
                Role
              </div>
              <div class="admin-dashboard__users-header-cell">
                Status
              </div>
              <div class="admin-dashboard__users-header-cell">
                Last Login
              </div>
              <div class="admin-dashboard__users-header-cell">
                Actions
              </div>
            </div>

            <div class="admin-dashboard__users-body">
              <div v-for="user in recentUsers" :key="user.id" class="admin-dashboard__users-row">
                <div class="admin-dashboard__users-cell">
                  <div class="admin-dashboard__user-info">
                    <div class="admin-dashboard__user-avatar">
                      <UIcon name="i-heroicons-user-circle" class="admin-dashboard__user-avatar-icon" />
                    </div>
                    <div class="admin-dashboard__user-details">
                      <div class="admin-dashboard__user-name">
                        {{ user.name }}
                      </div>
                      <div class="admin-dashboard__user-email">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="admin-dashboard__users-cell">
                  <UBadge :variant="user.role === 'Admin' ? 'solid' : 'soft'"
                    :color="user.role === 'Admin' ? 'error' : 'neutral'" size="xs">
                    {{ user.role }}
                  </UBadge>
                </div>
                <div class="admin-dashboard__users-cell">
                  <UBadge :variant="user.isActive ? 'solid' : 'soft'" :color="user.isActive ? 'success' : 'neutral'"
                    size="xs">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </UBadge>
                </div>
                <div class="admin-dashboard__users-cell">
                  <span class="admin-dashboard__users-time">
                    {{ formatTime(user.lastLogin) }}
                  </span>
                </div>
                <div class="admin-dashboard__users-cell">
                  <UButton variant="ghost" size="xs" :to="`/admin/users/${user.id}`">
                    View
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Define layout
definePageMeta({
  layout: 'admin'
})

// Composables
const { setPageTitle } = useLayoutState()
const { setNavigationActive } = useNavigation()

// Set page title and active navigation
setPageTitle('Dashboard - Admin Panel')
setNavigationActive('dashboard')

// State
const isRefreshing = ref(false)

// Mock data (replace with real API calls)
const stats = ref([
  {
    id: 'users',
    label: 'Total Users',
    value: '2,543',
    icon: 'i-heroicons-users',
    color: 'text-blue-600',
    change: 12.5
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$45,231',
    icon: 'i-heroicons-currency-dollar',
    color: 'text-green-600',
    change: 8.2
  },
  {
    id: 'orders',
    label: 'Orders',
    value: '1,423',
    icon: 'i-heroicons-shopping-bag',
    color: 'text-purple-600',
    change: -3.1
  },
  {
    id: 'performance',
    label: 'Performance',
    value: '98.5%',
    icon: 'i-heroicons-chart-bar',
    color: 'text-orange-600',
    change: 2.4
  }
])

const activities = ref([
  {
    id: '1',
    title: 'New user registered',
    description: 'John Doe created an account',
    icon: 'i-heroicons-user-plus',
    timestamp: new Date(Date.now() - 30 * 60 * 1000)
  },
  {
    id: '2',
    title: 'System backup completed',
    description: 'Daily backup finished successfully',
    icon: 'i-heroicons-server',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: '3',
    title: 'Payment processed',
    description: 'Order #1234 payment confirmed',
    icon: 'i-heroicons-credit-card',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
  }
])

const systemStatus = ref([
  {
    id: 'api',
    name: 'API Server',
    description: 'Main application server',
    status: 'healthy',
    statusText: 'Operational'
  },
  {
    id: 'database',
    name: 'Database',
    description: 'PostgreSQL cluster',
    status: 'healthy',
    statusText: 'Operational'
  },
  {
    id: 'storage',
    name: 'File Storage',
    description: 'S3 compatible storage',
    status: 'warning',
    statusText: '85% capacity'
  }
])

const quickActions = ref([
  {
    id: 'add-user',
    label: 'Add User',
    icon: 'i-heroicons-user-plus',
    to: '/admin/users/new',
    variant: 'solid' as const,
    color: 'primary' as const
  },
  {
    id: 'view-reports',
    label: 'View Reports',
    icon: 'i-heroicons-chart-bar',
    to: '/admin/reports',
    variant: 'outline' as const,
    color: 'neutral' as const
  },
  {
    id: 'system-settings',
    label: 'Settings',
    icon: 'i-heroicons-cog-6-tooth',
    to: '/admin/settings',
    variant: 'outline' as const,
    color: 'neutral' as const
  },
  {
    id: 'backup',
    label: 'Run Backup',
    icon: 'i-heroicons-server',
    to: '/admin/backup',
    variant: 'outline' as const,
    color: 'neutral' as const
  }
])

const recentUsers = ref([
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'User',
    isActive: true,
    lastLogin: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'Admin',
    isActive: true,
    lastLogin: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'User',
    isActive: false,
    lastLogin: new Date(Date.now() - 24 * 60 * 60 * 1000)
  }
])

// Methods
const refreshData = async () => {
  isRefreshing.value = true
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  isRefreshing.value = false
}

const formatTime = (timestamp: Date) => {
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

// SEO
useHead({
  title: 'Dashboard - Admin Panel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.admin-dashboard {
  @apply space-y-6;
}

/* Page Header */
.admin-dashboard__header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between;
  @apply space-y-4 sm:space-y-0;
}

.admin-dashboard__title-section {
  @apply space-y-1;
}

.admin-dashboard__title {
  @apply text-2xl font-bold text-gray-900;
}

.admin-dashboard__subtitle {
  @apply text-gray-600;
}

.admin-dashboard__actions {
  @apply flex space-x-3;
}

/* Stats Grid */
.admin-dashboard__stats {
  @apply grid gap-6;
  @apply grid-cols-1 sm:grid-cols-2 lg:grid-cols-4;
}

.admin-dashboard__stat-card {
  @apply bg-white rounded-lg border border-gray-200 p-6;
  @apply hover:shadow-md transition-shadow duration-200;
}

.admin-dashboard__stat-icon {
  @apply w-12 h-12 rounded-lg flex items-center justify-center mb-4;
  @apply bg-gray-50;
}

.admin-dashboard__stat-icon-svg {
  @apply w-6 h-6;
}

.admin-dashboard__stat-content {
  @apply space-y-2;
}

.admin-dashboard__stat-value {
  @apply text-2xl font-bold text-gray-900;
}

.admin-dashboard__stat-label {
  @apply text-sm font-medium text-gray-600;
}

.admin-dashboard__stat-change {
  @apply flex items-center space-x-1;
}

.admin-dashboard__stat-change-icon {
  @apply w-4 h-4;
}

.admin-dashboard__stat-change-text {
  @apply text-sm font-medium;
}

/* Content Grid */
.admin-dashboard__content {
  @apply grid gap-6;
  @apply grid-cols-1 lg:grid-cols-2 xl:grid-cols-3;
}

.admin-dashboard__card {
  @apply bg-white rounded-lg border border-gray-200;
  @apply col-span-1;
}

.admin-dashboard__card--full {
  @apply lg:col-span-2 xl:col-span-3;
}

.admin-dashboard__card-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.admin-dashboard__card-title {
  @apply text-lg font-semibold text-gray-900;
}

.admin-dashboard__card-content {
  @apply p-6;
}

/* Empty State */
.admin-dashboard__empty {
  @apply text-center py-8;
}

.admin-dashboard__empty-icon {
  @apply w-12 h-12 text-gray-400 mx-auto mb-3;
}

.admin-dashboard__empty-text {
  @apply text-gray-500;
}

/* Activity List */
.admin-dashboard__activity-list {
  @apply space-y-4;
}

.admin-dashboard__activity-item {
  @apply flex space-x-3;
}

.admin-dashboard__activity-icon {
  @apply w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center;
  @apply flex-shrink-0;
}

.admin-dashboard__activity-icon-svg {
  @apply w-4 h-4 text-blue-600;
}

.admin-dashboard__activity-content {
  @apply min-w-0 flex-1 space-y-1;
}

.admin-dashboard__activity-title {
  @apply text-sm font-medium text-gray-900;
}

.admin-dashboard__activity-description {
  @apply text-sm text-gray-600;
}

.admin-dashboard__activity-time {
  @apply text-xs text-gray-500;
}

/* System Status */
.admin-dashboard__status-indicator {
  @apply flex items-center space-x-2;
}

.admin-dashboard__status-dot {
  @apply w-2 h-2 rounded-full;
}

.admin-dashboard__status-dot--healthy {
  @apply bg-green-400;
}

.admin-dashboard__status-text {
  @apply text-sm text-gray-600;
}

.admin-dashboard__status-list {
  @apply space-y-4;
}

.admin-dashboard__status-item {
  @apply flex items-center justify-between;
}

.admin-dashboard__status-item-info {
  @apply space-y-1;
}

.admin-dashboard__status-item-name {
  @apply text-sm font-medium text-gray-900;
}

.admin-dashboard__status-item-description {
  @apply text-sm text-gray-600;
}

.admin-dashboard__status-item-status {
  @apply flex items-center space-x-2;
}

.admin-dashboard__status-item-dot {
  @apply w-2 h-2 rounded-full;
}

.admin-dashboard__status-item-dot--healthy {
  @apply bg-green-400;
}

.admin-dashboard__status-item-dot--warning {
  @apply bg-yellow-400;
}

.admin-dashboard__status-item-dot--error {
  @apply bg-red-400;
}

.admin-dashboard__status-item-text {
  @apply text-sm text-gray-600;
}

/* Quick Actions */
.admin-dashboard__quick-actions {
  @apply grid gap-3;
  @apply grid-cols-1 sm:grid-cols-2;
}

.admin-dashboard__quick-action {
  @apply justify-start;
}

/* Users Table */
.admin-dashboard__users-table {
  @apply overflow-x-auto;
}

.admin-dashboard__users-header {
  @apply grid gap-4 pb-3 border-b border-gray-200;
  @apply text-sm font-medium text-gray-500;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
}

.admin-dashboard__users-header-cell {
  @apply text-left;
}

.admin-dashboard__users-body {
  @apply space-y-3 pt-3;
}

.admin-dashboard__users-row {
  @apply grid gap-4 items-center;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
}

.admin-dashboard__users-cell {
  @apply text-sm;
}

.admin-dashboard__user-info {
  @apply flex items-center space-x-3;
}

.admin-dashboard__user-avatar {
  @apply flex-shrink-0;
}

.admin-dashboard__user-avatar-icon {
  @apply w-8 h-8 text-gray-400;
}

.admin-dashboard__user-details {
  @apply min-w-0;
}

.admin-dashboard__user-name {
  @apply font-medium text-gray-900;
}

.admin-dashboard__user-email {
  @apply text-gray-600;
}

.admin-dashboard__users-time {
  @apply text-gray-600;
}

/* Responsive */
@media (max-width: 640px) {
  .admin-dashboard__stats {
    @apply grid-cols-1;
  }

  .admin-dashboard__content {
    @apply grid-cols-1;
  }

  .admin-dashboard__users-header,
  .admin-dashboard__users-row {
    @apply grid-cols-1 gap-2;
  }

  .admin-dashboard__users-header {
    @apply hidden;
  }

  .admin-dashboard__users-row {
    @apply p-4 bg-gray-50 rounded-lg space-y-2;
  }
}

/* Dark mode */
.dark .admin-dashboard__title {
  @apply text-white;
}

.dark .admin-dashboard__subtitle {
  @apply text-gray-300;
}

.dark .admin-dashboard__stat-card,
.dark .admin-dashboard__card {
  @apply bg-gray-800 border-gray-700;
}

.dark .admin-dashboard__stat-value,
.dark .admin-dashboard__card-title {
  @apply text-white;
}

.dark .admin-dashboard__stat-label {
  @apply text-gray-300;
}

.dark .admin-dashboard__card-header {
  @apply border-gray-700;
}
</style>
