<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p class="text-gray-600">
          Welcome back! Here's what's happening with your system.
        </p>
      </div>
      <NuxtLink
to="/admin/users"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors no-underline">
        Manage Users
      </NuxtLink>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <UCard v-for="stat in stats" :key="stat.id" class="hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-3">
              <UIcon :name="stat.icon" class="text-3xl text-primary" />
            </div>
            <div class="text-2xl font-bold text-gray-900">
              {{ stat.value }}
            </div>
            <div class="text-sm font-medium text-gray-600 mt-1">
              {{ stat.label }}
            </div>
          </div>
        </div>
        <div class="text-sm mt-3 flex items-center gap-1" :class="stat.change > 0 ? 'text-green-600' : 'text-red-600'">
          <UIcon
:name="stat.change > 0 ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'"
            class="text-base" />
          {{ Math.abs(stat.change) }}% from last month
        </div>
      </UCard>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          Recent Activity
        </h2>
      </div>
      <div class="p-6">
        <div v-if="activities.length === 0" class="text-center py-8">
          <p class="text-gray-500">No recent activity</p>
        </div>
        <div v-else class="space-y-4">
          <div v-for="activity in activities.slice(0, 5)" :key="activity.id" class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <UIcon :name="activity.icon" class="text-2xl text-gray-600" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-900">
                {{ activity.title }}
              </div>
              <div class="text-sm text-gray-600">
                {{ activity.description }}
              </div>
              <div class="text-xs text-gray-500 mt-1">
                {{ formatTime(activity.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="bg-white rounded-lg border border-gray-200">
      <div class="flex items-center justify-between p-6 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">
          System Status
        </h2>
        <div class="flex items-center space-x-2">
          <div class="w-2 h-2 rounded-full bg-green-400"/>
          <span class="text-sm text-gray-600">All systems operational</span>
        </div>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div v-for="service in systemStatus" :key="service.id" class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-900">
                {{ service.name }}
              </div>
              <div class="text-sm text-gray-600">
                {{ service.description }}
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <div
class="w-2 h-2 rounded-full" :class="{
                'bg-green-400': service.status === 'healthy',
                'bg-yellow-400': service.status === 'warning',
                'bg-red-400': service.status === 'error'
              }"/>
              <span class="text-sm text-gray-600">
                {{ service.statusText }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 1.3: Simplified admin dashboard without composables/stores

// Define layout
definePageMeta({
  layout: 'admin'
})

// Mock data
const stats = ref([
  {
    id: 'users',
    label: 'Total Users',
    value: '2,543',
    icon: 'i-heroicons-users',
    change: 12.5
  },
  {
    id: 'revenue',
    label: 'Revenue',
    value: '$45,231',
    icon: 'i-heroicons-currency-dollar',
    change: 8.2
  },
  {
    id: 'orders',
    label: 'Orders',
    value: '1,423',
    icon: 'i-heroicons-shopping-cart',
    change: -3.1
  },
  {
    id: 'performance',
    label: 'Performance',
    value: '98.5%',
    icon: 'i-heroicons-chart-bar',
    change: 2.4
  }
])

const activities = ref([
  {
    id: '1',
    title: 'New user registered',
    description: 'John Doe created an account',
    icon: 'i-heroicons-user-circle',
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

const formatTime = (timestamp: Date) => {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

// SEO
useHead({
  title: 'Dashboard - Admin Panel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
