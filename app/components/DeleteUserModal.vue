<template>
  <UModal v-model:open="isOpen" :ui="{ footer: 'justify-end' }">
    <template #header>
      <div class="flex items-start gap-4">
        <div class="shrink-0">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <UIcon name="i-heroicons-exclamation-triangle" class="text-2xl text-red-600 dark:text-red-400" />
          </div>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold">
            Delete User
          </h3>
          <p class="mt-1 text-sm text-muted-foreground">
            This action cannot be undone.
          </p>
        </div>
      </div>
    </template>

    <template #body>
      <!-- User Info -->
      <div v-if="user" class="mb-6">
        <div class="flex items-center gap-3 mb-3">
          <UIcon name="i-heroicons-user-circle" class="text-3xl text-muted-foreground" />
          <div>
            <div class="text-sm font-medium">
              {{ user.name || 'No name' }}
            </div>
            <div class="text-sm text-muted-foreground">
              {{ user.email || 'No email' }}
            </div>
          </div>
        </div>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-muted-foreground">Status:</span>
            <UBadge :color="user.status === 'active' ? 'success' : 'neutral'" variant="subtle" size="xs">
              {{ user.status || 'Unknown' }}
            </UBadge>
          </div>
          <div class="flex justify-between">
            <span class="text-muted-foreground">Created:</span>
            <span>{{ formatDate(user.createdAt) }}</span>
          </div>
        </div>
      </div>

      <!-- Warning Message -->
      <UAlert color="error" variant="soft" icon="i-heroicons-shield-exclamation" title="⚠️ Permanent Deletion Warning"
        description="This will permanently delete the user account and all associated data. This action is irreversible and cannot be undone."
        class="mb-6" />

      <!-- Confirmation Input -->
      <UFormGroup label="Confirmation" help="Type DELETE to confirm" class="mb-6">
        <UInput id="confirm" v-model="confirmText" placeholder="Type DELETE to confirm" :disabled="loading"
          @keyup.enter="confirmText === 'DELETE' && handleDelete()" />
      </UFormGroup>

      <!-- Error Message -->
      <UAlert v-if="error" color="error" variant="soft" icon="i-heroicons-exclamation-circle" :title="error" />
    </template>

    <template #footer="{ close: closeModal }">
      <UButton type="button" variant="soft" color="neutral" :disabled="loading" @click="closeModal">
        Cancel
      </UButton>
      <UButton type="button" variant="solid" color="error" :loading="loading" :disabled="confirmText !== 'DELETE'"
        @click="handleDelete">
        Delete User
      </UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { UserRecord } from '~/types/admin'

// Props
interface Props {
  user: UserRecord | null
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'delete': []
}>()

// Local state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const confirmText = ref('')
const loading = ref(false)
const error = ref('')

// Watch modal open state to reset
watch(isOpen, (newValue) => {
  if (newValue) {
    confirmText.value = ''
    error.value = ''
  }
})

// Handle delete
async function handleDelete() {
  if (confirmText.value !== 'DELETE') {
    error.value = 'Please type DELETE to confirm'
    return
  }

  loading.value = true
  error.value = ''

  try {
    emit('delete')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete user'
    loading.value = false
  }
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
