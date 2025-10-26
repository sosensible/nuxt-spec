<template>
  <UModal v-model:open="isOpen" title="Edit User" :ui="{ footer: 'justify-end' }">
    <!-- Form in body -->
    <template #body>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Name Field -->
        <UFormGroup label="Name" :error="errors.name">
          <UInput id="name" v-model="form.name" placeholder="Enter user name" :disabled="loading" />
        </UFormGroup>

        <!-- Email Field -->
        <UFormGroup label="Email" :error="errors.email">
          <UInput id="email" v-model="form.email" type="email" placeholder="Enter user email" :disabled="loading" />
        </UFormGroup>

        <!-- User Info -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-sm">Status:</span>
            <UBadge :color="user?.status === 'active' ? 'success' : 'neutral'" variant="subtle">
              {{ user?.status || 'Unknown' }}
            </UBadge>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">Email Verified:</span>
            <UBadge :color="user?.emailVerified ? 'success' : 'warning'" variant="subtle">
              {{ user?.emailVerified ? 'Yes' : 'No' }}
            </UBadge>
          </div>
        </div>

        <!-- Error Message -->
        <UAlert v-if="error" color="error" variant="soft" icon="i-heroicons-exclamation-triangle" :title="error" />
      </form>
    </template>

    <!-- Footer with actions -->
    <template #footer="{ close }">
      <UButton type="button" variant="soft" color="neutral" :disabled="loading" @click="close">
        Cancel
      </UButton>
      <UButton type="submit" variant="solid" color="primary" :loading="loading" :disabled="!isFormValid"
        @click="handleSubmit">
        Save Changes
      </UButton>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import type { UserRecord, UpdateUserPayload } from '~/types/admin'

// Props
interface Props {
  user: UserRecord | null
  modelValue: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [payload: UpdateUserPayload]
}>()

// Local state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const form = reactive({
  name: '',
  email: '',
})

const errors = reactive({
  name: '',
  email: '',
})

const loading = ref(false)
const error = ref('')

// Computed
const isFormValid = computed(() => {
  return form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    !errors.name &&
    !errors.email
})

// Watch user prop to populate form
watch(() => props.user, (newUser) => {
  if (newUser) {
    form.name = newUser.name || ''
    form.email = newUser.email || ''
    // Reset errors
    errors.name = ''
    errors.email = ''
    error.value = ''
  }
}, { immediate: true })

// Validation functions
function validateName() {
  errors.name = ''

  if (!form.name.trim()) {
    errors.name = 'Name is required'
    return false
  }

  if (form.name.length < 1 || form.name.length > 128) {
    errors.name = 'Name must be between 1 and 128 characters'
    return false
  }

  return true
}

function validateEmail() {
  errors.email = ''

  if (!form.email.trim()) {
    errors.email = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    return false
  }

  return true
}

// Validate on input
watch(() => form.name, () => {
  if (errors.name) validateName()
})

watch(() => form.email, () => {
  if (errors.email) validateEmail()
})

// Handle submit
async function handleSubmit() {
  // Validate all fields
  const nameValid = validateName()
  const emailValid = validateEmail()

  if (!nameValid || !emailValid) {
    return
  }

  // Check if anything changed
  if (form.name === props.user?.name && form.email === props.user?.email) {
    error.value = 'No changes detected'
    return
  }

  // Prepare payload
  const payload: UpdateUserPayload = {}

  if (form.name !== props.user?.name) {
    payload.name = form.name
  }

  if (form.email !== props.user?.email) {
    payload.email = form.email
  }

  // Emit save event
  loading.value = true
  error.value = ''

  try {
    emit('save', payload)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to save changes'
  } finally {
    loading.value = false
  }
}
</script>
