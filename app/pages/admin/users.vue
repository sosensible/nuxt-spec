<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Users
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage user accounts and permissions.
        </p>
      </div>
      <UButton to="/admin" variant="soft" color="neutral" icon="i-heroicons-arrow-left">
        Back to Dashboard
      </UButton>
    </div>

    <!-- Search and Actions -->
    <div class="flex flex-col sm:flex-row gap-4">
      <UInput
v-model="searchQuery" placeholder="Search users..." icon="i-heroicons-magnifying-glass" size="lg"
        class="flex-1" />
      <UButton variant="solid" color="primary" icon="i-heroicons-plus">
        Add User
      </UButton>
    </div>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UIcon name="i-heroicons-user-circle" class="text-3xl text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge
:color="user.role === 'Admin' ? 'error' : user.role === 'Editor' ? 'warning' : 'neutral'"
                  variant="subtle">
                  {{ user.role }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UBadge :color="user.isActive ? 'success' : 'neutral'" variant="subtle">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </UBadge>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <UButton variant="ghost" color="primary" size="xs" icon="i-heroicons-pencil">
                    Edit
                  </UButton>
                  <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-trash">
                    Delete
                  </UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination Info -->
    <div class="text-sm text-gray-600 dark:text-gray-400 text-center">
      Showing {{ filteredUsers.length }} of {{ users.length }} users
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 1.3: Simplified users page without composables/stores

// Define layout
definePageMeta({
  layout: 'admin'
})

// State
const searchQuery = ref('')

// Mock users data
const users = ref([
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    isActive: true,
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    isActive: true,
    createdAt: new Date('2024-01-10')
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    isActive: false,
    createdAt: new Date('2024-01-05')
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'User',
    isActive: true,
    createdAt: new Date('2024-01-12')
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'User',
    isActive: true,
    createdAt: new Date('2024-01-08')
  }
])

// Computed
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

// Methods
const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// SEO
useHead({
  title: 'Users - Admin Panel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
