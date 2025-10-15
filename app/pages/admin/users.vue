<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          Users
        </h1>
        <p class="text-gray-600">
          Manage user accounts and permissions.
        </p>
      </div>
      <NuxtLink to="/admin" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
        Back to Dashboard
      </NuxtLink>
    </div>

    <!-- Search and Actions -->
    <div class="flex flex-col sm:flex-row gap-4">
      <input v-model="searchQuery" type="text" placeholder="Search users..."
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Add User
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="text-2xl mr-3">👤</div>
                  <div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ user.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                  'bg-red-100 text-red-800': user.role === 'Admin',
                  'bg-yellow-100 text-yellow-800': user.role === 'Manager',
                  'bg-gray-100 text-gray-800': user.role === 'User'
                }">
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="w-2 h-2 rounded-full mr-2" :class="{
                    'bg-green-400': user.isActive,
                    'bg-gray-400': !user.isActive
                  }"></div>
                  <span class="text-sm text-gray-600">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">
                  Edit
                </button>
                <button class="text-red-600 hover:text-red-900">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination Info -->
    <div class="text-sm text-gray-600 text-center">
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
