<template>
  <div class="space-y-6">
    <!-- Error Banner -->
    <div v-if="store.error"
      class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div class="flex items-start">
        <UIcon name="i-heroicons-exclamation-triangle" class="text-red-600 dark:text-red-400 text-xl mr-3 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium text-red-800 dark:text-red-200">
            Error loading users
          </p>
          <p class="text-sm text-red-700 dark:text-red-300 mt-1">
            {{ store.error }}
          </p>
        </div>
        <UButton variant="ghost" color="error" size="xs" @click="store.refresh">
          Retry
        </UButton>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="store.loading" class="flex items-center justify-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="text-4xl text-gray-400 animate-spin" />
      <span class="ml-3 text-gray-600 dark:text-gray-400">Loading users...</span>
    </div>

    <!-- Users Table -->
    <div v-else-if="store.items.length > 0"
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
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
                Status
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email Verified
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
            <tr v-for="user in store.items" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-gray-800">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <UIcon name="i-heroicons-user-circle" class="text-3xl text-gray-400 dark:text-gray-500 mr-3" />
                  <div>
                    <div class="text-sm font-medium text-gray-900 dark:text-gray-50">
                      {{ user.name || 'No name' }}
                    </div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">
                      {{ user.email || 'No email' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="user.status === 'active' ? 'success' : 'neutral'" variant="subtle">
                  {{ user.status || 'Unknown' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <UBadge :color="user.emailVerified ? 'success' : 'warning'" variant="subtle">
                  {{ user.emailVerified ? 'Verified' : 'Not Verified' }}
                </UBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex gap-2">
                  <UButton variant="ghost" color="neutral" size="xs" icon="i-heroicons-eye" @click="$emit('view', user)">View</UButton>
                  <UButton variant="ghost" color="primary" size="xs" icon="i-heroicons-pencil" @click="$emit('edit', user)">Edit</UButton>
                  <UButton variant="ghost" color="error" size="xs" icon="i-heroicons-trash" @click="$emit('delete', user)">Delete</UButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else
      class="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
      <UIcon name="i-heroicons-users" class="text-6xl text-gray-400 dark:text-gray-600 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-50 mb-2">
        No users found
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        {{ store.searchQuery ? 'Try adjusting your search query.' : 'No users in the system yet.' }}
      </p>
    </div>

    <!-- Pagination Controls -->
    <div v-if="store.items.length > 0" class="flex flex-col sm:flex-row items-center justify-between gap-4">
      <!-- Page Info -->
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <span v-if="store.totalCount !== null">
          Showing {{ store.items.length }} of {{ store.totalCount }} users
        </span>
        <span v-else>
          Showing {{ store.items.length }} users
        </span>
      </div>

      <!-- Page Size Selector -->
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
        <select :value="store.pageSize" @change="handlePageSizeChange"
          class="rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
          <option :value="10">10</option>
          <option :value="25">25</option>
          <option :value="50">50</option>
        </select>
      </div>

      <!-- Navigation Buttons -->
      <div class="flex items-center gap-2">
        <UButton variant="soft" color="neutral" size="sm" icon="i-heroicons-chevron-left"
          :disabled="store.hasPrevPage === false || store.loading" @click="store.goPrev">
          Previous
        </UButton>
        <UButton variant="soft" color="neutral" size="sm" icon="i-heroicons-chevron-right" trailing
          :disabled="store.hasNextPage === false || store.loading" @click="store.goNext">
          Next
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserRecord } from '~/types/admin'

// Props
interface Props {
  searchQuery?: string
}

const props = withDefaults(defineProps<Props>(), {
  searchQuery: ''
})

// Emits
defineEmits<{
  edit: [user: UserRecord]
  delete: [user: UserRecord]
  view: [user: UserRecord]
}>()

// Use Pinia store for state management
const store = useAdminUsersStore()

// Initialize data on mount
onMounted(() => {
  store.load()
})

// Watch search query from parent
watch(() => props.searchQuery, (newQuery) => {
  store.setSearchQuery(newQuery)
})

// Handle page size change
function handlePageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  store.setPageSize(Number(target.value))
}

// Format date helper
function formatDate(dateStr?: string) {
  if (!dateStr) return 'N/A'

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}
</script>
