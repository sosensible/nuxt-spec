<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-50">
          Users
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Manage user accounts from Appwrite.
        </p>
      </div>
      <UButton to="/admin" variant="soft" color="neutral" icon="i-heroicons-arrow-left">
        Back to Dashboard
      </UButton>
    </div>

    <!-- Search Bar -->
    <div class="flex flex-col sm:flex-row gap-4">
      <UInput v-model="searchQuery" placeholder="Search by email or name..." icon="i-heroicons-magnifying-glass"
        size="lg" class="flex-1" />
    </div>

    <!-- Users List Component -->
    <AdminUsersList :search-query="searchQuery" @edit="handleEdit" @delete="handleDelete" @view="handleView" />

    <!-- Success Toast -->
    <div v-if="successMessage"
      class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div class="flex items-center">
        <UIcon name="i-heroicons-check-circle" class="text-green-600 dark:text-green-400 text-xl mr-3" />
        <p class="text-sm text-green-800 dark:text-green-200">
          {{ successMessage }}
        </p>
      </div>
    </div>

    <!-- Edit User Popup -->
    <EditUserPopup v-model="showEditPopup" :user="selectedUser" @save="handleSaveEdit" />

    <!-- Delete User Modal -->
    <DeleteUserModal v-model="showDeleteModal" :user="selectedUser" @delete="handleConfirmDelete" />

    <!-- User Detail Modal -->
    <UserDetailModal v-model="showViewModal" :user-id="selectedUserId" @edit="handleEditFromModal"
      @delete="handleDeleteFromModal" />
  </div>
</template>

<script setup lang="ts">
import type { UserRecord, UpdateUserPayload } from '~/types/admin'
import UserDetailModal from '~/components/UserDetailModal.vue'

// Define layout
definePageMeta({
  layout: 'admin'
})

// Use the Pinia store
const store = useAdminUsersStore()

// State
const searchQuery = ref('')
const showEditPopup = ref(false)
const showDeleteModal = ref(false)
const showViewModal = ref(false)
const selectedUser = ref<UserRecord | null>(null)
const selectedUserId = ref<string | undefined>(undefined)
const successMessage = ref('')

// (UserDetailModal already imported above)

// Handlers
function handleEdit(user: UserRecord) {
  selectedUser.value = user
  showEditPopup.value = true
}

async function handleSaveEdit(payload: UpdateUserPayload) {
  if (!selectedUser.value) return

  const success = await store.updateUser(selectedUser.value.id, payload)

  if (success) {
    successMessage.value = 'User updated successfully'
    showEditPopup.value = false

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

function handleDelete(user: UserRecord) {
  selectedUser.value = user
  showDeleteModal.value = true
}

// Open the detail modal
function handleView(user: UserRecord) {
  selectedUserId.value = user.id
  // Set a light-weight selectedUser so edit/delete warm up UI
  selectedUser.value = user
  showViewModal.value = true
}

// Handlers called from modal emits (only provide id)
function handleEditFromModal(userId: string) {
  // Find the user record in the store if available
  const u = store.items.find((it: import('~/types/admin').UserRecord) => it.id === userId)
  if (u) selectedUser.value = u
  selectedUserId.value = userId
  showViewModal.value = false
  showEditPopup.value = true
}

function handleDeleteFromModal(userId: string) {
  const u = store.items.find((it: import('~/types/admin').UserRecord) => it.id === userId)
  if (u) selectedUser.value = u
  selectedUserId.value = userId
  showViewModal.value = false
  showDeleteModal.value = true
}

async function handleConfirmDelete() {
  if (!selectedUser.value) return

  const success = await store.deleteUser(selectedUser.value.id)

  if (success) {
    successMessage.value = 'User deleted successfully'
    showDeleteModal.value = false

    // Clear success message after 3 seconds
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  }
}

// SEO
useHead({
  title: 'Users - Admin Panel',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>
