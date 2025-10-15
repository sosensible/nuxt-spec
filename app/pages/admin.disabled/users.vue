<template>
  <div class="admin-users">
    <!-- Page Header -->
    <div class="admin-users__header">
      <div class="admin-users__title-section">
        <h1 class="admin-users__title">
          Users
        </h1>
        <p class="admin-users__subtitle">
          Manage user accounts and permissions.
        </p>
      </div>

      <div class="admin-users__actions">
        <UInput v-model="searchQuery" placeholder="Search users..." icon="i-heroicons-magnifying-glass" size="sm"
          class="admin-users__search" />

        <UButton variant="outline" color="neutral" size="sm" :loading="isExporting" @click="exportUsers">
          <UIcon name="i-heroicons-arrow-down-tray" />
          Export
        </UButton>

        <UButton variant="solid" color="primary" size="sm" to="/admin/users/new">
          <UIcon name="i-heroicons-plus" />
          Add User
        </UButton>
      </div>
    </div>

    <!-- Filters -->
    <div class="admin-users__filters">
      <div class="admin-users__filter-group">
        <label class="admin-users__filter-label">Role</label>
        <USelectMenu v-model="selectedRole" :options="roleOptions" placeholder="All roles" size="sm" />
      </div>

      <div class="admin-users__filter-group">
        <label class="admin-users__filter-label">Status</label>
        <USelectMenu v-model="selectedStatus" :options="statusOptions" placeholder="All statuses" size="sm" />
      </div>

      <div class="admin-users__filter-group">
        <label class="admin-users__filter-label">Sort by</label>
        <USelectMenu v-model="sortBy" :options="sortOptions" size="sm" />
      </div>

      <UButton v-if="hasActiveFilters" variant="ghost" size="sm" class="admin-users__clear-filters"
        @click="clearFilters">
        <UIcon name="i-heroicons-x-mark" />
        Clear filters
      </UButton>
    </div>

    <!-- Users Table -->
    <div class="admin-users__table-container">
      <div class="admin-users__table">
        <!-- Table Header -->
        <div class="admin-users__table-header">
          <div class="admin-users__header-cell admin-users__header-cell--checkbox">
            <UCheckbox v-model="selectAll" :indeterminate="isIndeterminate" @change="toggleSelectAll" />
          </div>
          <div class="admin-users__header-cell admin-users__header-cell--user">
            User
          </div>
          <div class="admin-users__header-cell admin-users__header-cell--role">
            Role
          </div>
          <div class="admin-users__header-cell admin-users__header-cell--status">
            Status
          </div>
          <div class="admin-users__header-cell admin-users__header-cell--date">
            Created
          </div>
          <div class="admin-users__header-cell admin-users__header-cell--date">
            Last Login
          </div>
          <div class="admin-users__header-cell admin-users__header-cell--actions">
            Actions
          </div>
        </div>

        <!-- Table Body -->
        <div class="admin-users__table-body">
          <div v-if="isLoading" class="admin-users__loading">
            <div class="admin-users__loading-spinner">
              <UIcon name="i-heroicons-arrow-path" class="admin-users__loading-icon animate-spin" />
            </div>
            <p class="admin-users__loading-text">
              Loading users...
            </p>
          </div>

          <div v-else-if="filteredUsers.length === 0" class="admin-users__empty">
            <UIcon name="i-heroicons-users" class="admin-users__empty-icon" />
            <h3 class="admin-users__empty-title">
              No users found
            </h3>
            <p class="admin-users__empty-description">
              {{ searchQuery ? 'Try adjusting your search or filters.' : 'Get started by adding your first user.' }}
            </p>
            <UButton v-if="!searchQuery" variant="solid" color="primary" to="/admin/users/new">
              <UIcon name="i-heroicons-plus" />
              Add User
            </UButton>
          </div>

          <div v-for="user in paginatedUsers" v-else :key="user.id" class="admin-users__table-row"
            :class="{ 'admin-users__table-row--selected': selectedUsers.includes(user.id) }">
            <div class="admin-users__cell admin-users__cell--checkbox">
              <UCheckbox :model-value="selectedUsers.includes(user.id)"
                @update:model-value="toggleUserSelection(user.id)" />
            </div>

            <div class="admin-users__cell admin-users__cell--user">
              <div class="admin-users__user-info">
                <div class="admin-users__user-avatar">
                  <UIcon name="i-heroicons-user-circle" class="admin-users__user-avatar-icon" />
                </div>
                <div class="admin-users__user-details">
                  <div class="admin-users__user-name">
                    {{ user.name }}
                  </div>
                  <div class="admin-users__user-email">
                    {{ user.email }}
                  </div>
                </div>
              </div>
            </div>

            <div class="admin-users__cell admin-users__cell--role">
              <UBadge :variant="user.role === 'Admin' ? 'solid' : 'soft'" :color="getRoleColor(user.role)" size="xs">
                {{ user.role }}
              </UBadge>
            </div>

            <div class="admin-users__cell admin-users__cell--status">
              <div class="admin-users__status">
                <div class="admin-users__status-dot" :class="{
                  'admin-users__status-dot--active': user.isActive,
                  'admin-users__status-dot--inactive': !user.isActive
                }" />
                <span class="admin-users__status-text">
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </div>
            </div>

            <div class="admin-users__cell admin-users__cell--date">
              <span class="admin-users__date">
                {{ formatDate(user.createdAt) }}
              </span>
            </div>

            <div class="admin-users__cell admin-users__cell--date">
              <span class="admin-users__date">
                {{ user.lastLogin ? formatDate(user.lastLogin) : 'Never' }}
              </span>
            </div>

            <div class="admin-users__cell admin-users__cell--actions">
              <div class="admin-users__actions-group">
                <UButton variant="ghost" size="xs" :to="`/admin/users/${user.id}`">
                  View
                </UButton>

                <UButton variant="ghost" size="xs" :to="`/admin/users/${user.id}/edit`">
                  Edit
                </UButton>

                <UButton variant="ghost" size="xs" color="error"
                  :disabled="user.role === 'Admin' && user.id === currentUserId" @click="deleteUser(user)">
                  Delete
                </UButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bulk Actions -->
    <div v-if="selectedUsers.length > 0" class="admin-users__bulk-actions">
      <div class="admin-users__bulk-info">
        {{ selectedUsers.length }} user{{ selectedUsers.length === 1 ? '' : 's' }} selected
      </div>

      <div class="admin-users__bulk-buttons">
        <UButton variant="outline" size="sm" :loading="isBulkProcessing" @click="bulkActivate">
          <UIcon name="i-heroicons-check-circle" />
          Activate
        </UButton>

        <UButton variant="outline" size="sm" :loading="isBulkProcessing" @click="bulkDeactivate">
          <UIcon name="i-heroicons-x-circle" />
          Deactivate
        </UButton>

        <UButton variant="outline" color="error" size="sm" :loading="isBulkProcessing" @click="bulkDelete">
          <UIcon name="i-heroicons-trash" />
          Delete
        </UButton>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="admin-users__pagination">
      <div class="admin-users__pagination-info">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ filteredUsers.length }} users
      </div>

      <div class="admin-users__pagination-controls">
        <UButton variant="outline" size="sm" :disabled="currentPage === 1" @click="currentPage = currentPage - 1">
          <UIcon name="i-heroicons-chevron-left" />
          Previous
        </UButton>

        <div class="admin-users__pagination-pages">
          <UButton v-for="page in visiblePages" :key="page" :variant="page === currentPage ? 'solid' : 'ghost'"
            size="sm" @click="currentPage = page">
            {{ page }}
          </UButton>
        </div>

        <UButton variant="outline" size="sm" :disabled="currentPage === totalPages"
          @click="currentPage = currentPage + 1">
          Next
          <UIcon name="i-heroicons-chevron-right" />
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AdminUser } from '~/types/admin'

// Define layout
definePageMeta({
  layout: 'admin'
})

// Composables
const { setPageTitle } = useLayoutState()
const { setNavigationActive } = useNavigation()

// Set page title and active navigation
setPageTitle('Users - Admin Panel')
setNavigationActive('users')

// State
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')
const sortBy = ref('name-asc')
const selectedUsers = ref<string[]>([])
const currentPage = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)
const isExporting = ref(false)
const isBulkProcessing = ref(false)
const currentUserId = ref('1') // Mock current user ID

// Filter options
const roleOptions = [
  { label: 'All roles', value: '' },
  { label: 'Admin', value: 'Admin' },
  { label: 'User', value: 'User' },
  { label: 'Manager', value: 'Manager' }
]

const statusOptions = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

const sortOptions = [
  { label: 'Name (A-Z)', value: 'name-asc' },
  { label: 'Name (Z-A)', value: 'name-desc' },
  { label: 'Email (A-Z)', value: 'email-asc' },
  { label: 'Email (Z-A)', value: 'email-desc' },
  { label: 'Created (Newest)', value: 'created-desc' },
  { label: 'Created (Oldest)', value: 'created-asc' },
  { label: 'Last Login (Recent)', value: 'login-desc' },
  { label: 'Last Login (Oldest)', value: 'login-asc' }
]

// Mock users data (replace with real API)
const users = ref([
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    isActive: true,
    permissions: ['admin', 'read', 'write', 'delete'],
    createdAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-20T10:30:00')
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'User',
    isActive: true,
    permissions: ['read'],
    createdAt: new Date('2024-01-10'),
    lastLogin: new Date('2024-01-19T14:20:00')
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    role: 'Manager',
    isActive: false,
    permissions: ['read', 'write'],
    createdAt: new Date('2024-01-05'),
    lastLogin: new Date('2024-01-18T09:15:00')
  },
  {
    id: '4',
    name: 'Alice Brown',
    email: 'alice@example.com',
    role: 'User',
    isActive: true,
    permissions: ['read'],
    createdAt: new Date('2024-01-12'),
    lastLogin: null
  },
  {
    id: '5',
    name: 'Charlie Wilson',
    email: 'charlie@example.com',
    role: 'User',
    isActive: true,
    permissions: ['read'],
    createdAt: new Date('2024-01-08'),
    lastLogin: new Date('2024-01-17T16:45:00')
  }
])

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedRole.value || selectedStatus.value
})

const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
    )
  }

  // Role filter
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  // Status filter
  if (selectedStatus.value) {
    const isActive = selectedStatus.value === 'active'
    filtered = filtered.filter(user => user.isActive === isActive)
  }

  // Sort
  const [field, direction] = sortBy.value.split('-')
  filtered.sort((a: AdminUser, b: AdminUser) => {
    const fieldKey = field === 'created' ? 'createdAt' : field === 'login' ? 'lastLogin' : field as keyof AdminUser
    let aVal = a[fieldKey]
    let bVal = b[fieldKey]

    if (field === 'login') {
      aVal = aVal || new Date(0)
      bVal = bVal || new Date(0)
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }

    if (aVal < bVal) return direction === 'asc' ? -1 : 1
    if (aVal > bVal) return direction === 'asc' ? 1 : -1
    return 0
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, filteredUsers.value.length)
})

const paginatedUsers = computed(() => {
  return filteredUsers.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages.value, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

const selectAll = computed({
  get: () => selectedUsers.value.length === paginatedUsers.value.length && paginatedUsers.value.length > 0,
  set: (value: boolean) => {
    if (value) {
      selectedUsers.value = paginatedUsers.value.map(user => user.id)
    } else {
      selectedUsers.value = []
    }
  }
})

const isIndeterminate = computed(() => {
  return selectedUsers.value.length > 0 && selectedUsers.value.length < paginatedUsers.value.length
})

// Methods
const toggleSelectAll = () => {
  if (selectedUsers.value.length === paginatedUsers.value.length) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = paginatedUsers.value.map(user => user.id)
  }
}

const toggleUserSelection = (userId: string) => {
  const index = selectedUsers.value.indexOf(userId)
  if (index > -1) {
    selectedUsers.value.splice(index, 1)
  } else {
    selectedUsers.value.push(userId)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedRole.value = ''
  selectedStatus.value = ''
  currentPage.value = 1
}

const getRoleColor = (role: string) => {
  switch (role) {
    case 'Admin': return 'error'
    case 'Manager': return 'warning'
    case 'User': return 'neutral'
    default: return 'neutral'
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const exportUsers = async () => {
  isExporting.value = true
  // Simulate export
  await new Promise(resolve => setTimeout(resolve, 1000))
  isExporting.value = false
}

const deleteUser = async (user: AdminUser) => {
  if (confirm(`Are you sure you want to delete ${user.name}?`)) {
    users.value = users.value.filter(u => u.id !== user.id)
    selectedUsers.value = selectedUsers.value.filter(id => id !== user.id)
  }
}

const bulkActivate = async () => {
  isBulkProcessing.value = true
  // Simulate bulk operation
  await new Promise(resolve => setTimeout(resolve, 1000))
  users.value.forEach((user) => {
    if (selectedUsers.value.includes(user.id)) {
      user.isActive = true
    }
  })
  selectedUsers.value = []
  isBulkProcessing.value = false
}

const bulkDeactivate = async () => {
  isBulkProcessing.value = true
  // Simulate bulk operation
  await new Promise(resolve => setTimeout(resolve, 1000))
  users.value.forEach((user) => {
    if (selectedUsers.value.includes(user.id)) {
      user.isActive = false
    }
  })
  selectedUsers.value = []
  isBulkProcessing.value = false
}

const bulkDelete = async () => {
  if (confirm(`Are you sure you want to delete ${selectedUsers.value.length} user(s)?`)) {
    isBulkProcessing.value = true
    // Simulate bulk operation
    await new Promise(resolve => setTimeout(resolve, 1000))
    users.value = users.value.filter(user => !selectedUsers.value.includes(user.id))
    selectedUsers.value = []
    isBulkProcessing.value = false
  }
}

// Watch for filter changes to reset pagination
watch([searchQuery, selectedRole, selectedStatus], () => {
  currentPage.value = 1
})

// SEO
useHead({
  title: 'Users - Admin Panel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.admin-users {
  @apply space-y-6;
}

/* Page Header */
.admin-users__header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between;
  @apply space-y-4 sm:space-y-0;
}

.admin-users__title-section {
  @apply space-y-1;
}

.admin-users__title {
  @apply text-2xl font-bold text-gray-900;
}

.admin-users__subtitle {
  @apply text-gray-600;
}

.admin-users__actions {
  @apply flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3;
}

.admin-users__search {
  @apply w-full sm:w-64;
}

/* Filters */
.admin-users__filters {
  @apply flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-lg;
}

.admin-users__filter-group {
  @apply space-y-1;
}

.admin-users__filter-label {
  @apply text-sm font-medium text-gray-700;
}

.admin-users__clear-filters {
  @apply ml-auto;
}

/* Table */
.admin-users__table-container {
  @apply bg-white rounded-lg border border-gray-200 overflow-hidden;
}

.admin-users__table {
  @apply min-w-full;
}

.admin-users__table-header {
  @apply grid gap-4 p-4 bg-gray-50 border-b border-gray-200;
  @apply text-sm font-medium text-gray-500;
  grid-template-columns: auto 2fr 1fr 1fr 1fr 1fr 1fr;
}

.admin-users__header-cell {
  @apply text-left;
}

.admin-users__table-body {
  @apply divide-y divide-gray-200;
}

.admin-users__table-row {
  @apply grid gap-4 p-4 items-center hover:bg-gray-50 transition-colors;
  grid-template-columns: auto 2fr 1fr 1fr 1fr 1fr 1fr;
}

.admin-users__table-row--selected {
  @apply bg-blue-50;
}

.admin-users__cell {
  @apply text-sm;
}

/* Loading State */
.admin-users__loading {
  @apply flex flex-col items-center justify-center py-12;
}

.admin-users__loading-spinner {
  @apply w-8 h-8 mb-4;
}

.admin-users__loading-icon {
  @apply w-8 h-8 text-gray-400;
}

.admin-users__loading-text {
  @apply text-gray-600;
}

/* Empty State */
.admin-users__empty {
  @apply text-center py-12;
}

.admin-users__empty-icon {
  @apply w-12 h-12 text-gray-400 mx-auto mb-4;
}

.admin-users__empty-title {
  @apply text-lg font-semibold text-gray-900 mb-2;
}

.admin-users__empty-description {
  @apply text-gray-600 mb-6;
}

/* User Info */
.admin-users__user-info {
  @apply flex items-center space-x-3;
}

.admin-users__user-avatar {
  @apply flex-shrink-0;
}

.admin-users__user-avatar-icon {
  @apply w-8 h-8 text-gray-400;
}

.admin-users__user-details {
  @apply min-w-0;
}

.admin-users__user-name {
  @apply font-medium text-gray-900;
}

.admin-users__user-email {
  @apply text-gray-600;
}

/* Status */
.admin-users__status {
  @apply flex items-center space-x-2;
}

.admin-users__status-dot {
  @apply w-2 h-2 rounded-full;
}

.admin-users__status-dot--active {
  @apply bg-green-400;
}

.admin-users__status-dot--inactive {
  @apply bg-gray-400;
}

.admin-users__status-text {
  @apply text-gray-600;
}

/* Date */
.admin-users__date {
  @apply text-gray-600;
}

/* Actions */
.admin-users__actions-group {
  @apply flex space-x-2;
}

/* Bulk Actions */
.admin-users__bulk-actions {
  @apply flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg;
}

.admin-users__bulk-info {
  @apply text-sm font-medium text-blue-900;
}

.admin-users__bulk-buttons {
  @apply flex space-x-2;
}

/* Pagination */
.admin-users__pagination {
  @apply flex items-center justify-between;
}

.admin-users__pagination-info {
  @apply text-sm text-gray-600;
}

.admin-users__pagination-controls {
  @apply flex items-center space-x-2;
}

.admin-users__pagination-pages {
  @apply flex space-x-1;
}

/* Responsive */
@media (max-width: 768px) {

  .admin-users__table-header,
  .admin-users__table-row {
    @apply grid-cols-1 gap-2;
  }

  .admin-users__table-header {
    @apply hidden;
  }

  .admin-users__table-row {
    @apply p-4 space-y-3;
  }

  .admin-users__cell {
    @apply flex justify-between items-center;
  }

  .admin-users__cell::before {
    @apply font-medium text-gray-500 mr-2;
    content: attr(data-label);
  }

  .admin-users__cell--user::before {
    content: 'User: ';
  }

  .admin-users__cell--role::before {
    content: 'Role: ';
  }

  .admin-users__cell--status::before {
    content: 'Status: ';
  }

  .admin-users__cell--date:nth-of-type(5)::before {
    content: 'Created: ';
  }

  .admin-users__cell--date:nth-of-type(6)::before {
    content: 'Last Login: ';
  }

  .admin-users__cell--actions::before {
    content: 'Actions: ';
  }

  .admin-users__pagination {
    @apply flex-col space-y-4;
  }
}

/* Dark mode */
.dark .admin-users__title {
  @apply text-white;
}

.dark .admin-users__subtitle {
  @apply text-gray-300;
}

.dark .admin-users__filters {
  @apply bg-gray-800;
}

.dark .admin-users__filter-label {
  @apply text-gray-300;
}

.dark .admin-users__table-container {
  @apply bg-gray-800 border-gray-700;
}

.dark .admin-users__table-header {
  @apply bg-gray-700 border-gray-600;
}

.dark .admin-users__table-row {
  @apply hover:bg-gray-700;
}

.dark .admin-users__table-row--selected {
  @apply bg-blue-900;
}

.dark .admin-users__user-name {
  @apply text-white;
}

.dark .admin-users__user-email,
.dark .admin-users__status-text,
.dark .admin-users__date {
  @apply text-gray-300;
}
</style>
