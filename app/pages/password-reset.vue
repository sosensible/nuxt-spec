<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Reset Your Password</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
      </template>

  <UAlert
v-if="successMessage" color="success" variant="soft" title="Check Your Email" :description="successMessage"
    class="mb-4" />

  <UAlert v-if="errorMessage" color="error" variant="soft" title="Error" :description="errorMessage" class="mb-4" />

      <UForm :state="formState" :schema="passwordResetRequestSchema" @submit="handleSubmit">
        <UFormField name="email" label="Email">
          <UInput
v-model="formState.email" type="email" placeholder="you@example.com" :disabled="loading"
            autocomplete="email" />
        </UFormField>

        <div class="flex flex-col gap-3 mt-6">
          <UButton type="submit" block :loading="loading" :disabled="loading">
            Send Reset Link
          </UButton>

          <UButton to="/login" variant="ghost" block :disabled="loading">
            Back to Login
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { passwordResetRequestSchema } from '~/schemas/password-reset'
import type { PasswordResetRequest } from '~/schemas/password-reset'

definePageMeta({
  layout: 'default',
  middleware: ['guest'],
})

const formState = ref<PasswordResetRequest>({
  email: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

async function handleSubmit() {
  loading.value = true
  successMessage.value = ''
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/auth/password-reset', {
      method: 'POST',
      body: formState.value,
    })

    // Always show success message (security - prevent email enumeration)
    successMessage.value = response.message
    formState.value.email = '' // Clear form
  } catch (error: unknown) {
    // Only validation errors should be shown to user
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const fetchError = error as { statusCode: number; message?: string }
      if (fetchError.statusCode === 400) {
        errorMessage.value = fetchError.message || 'Please provide a valid email address.'
      } else {
        errorMessage.value = 'An unexpected error occurred. Please try again.'
      }
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
