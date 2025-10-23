<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Set New Password</h1>
          <p class="text-gray-600 dark:text-gray-400 mt-2">
            Enter your new password below.
          </p>
        </div>
      </template>

  <UAlert v-if="errorMessage" color="error" variant="soft" title="Error" :description="errorMessage" class="mb-4" />

      <UForm v-if="!successMessage" :state="formState" :schema="passwordResetConfirmFormSchema" @submit="handleSubmit">
        <UFormField name="password" label="New Password">
          <PasswordInput v-model="formState.password" placeholder="Create a strong password" :disabled="loading" />
        </UFormField>

        <UFormField name="confirmPassword" label="Confirm New Password">
          <PasswordInput v-model="formState.confirmPassword" placeholder="Confirm your password" :disabled="loading" />
        </UFormField>

        <div class="flex flex-col gap-3 mt-6">
          <UButton type="submit" block :loading="loading" :disabled="loading">
            Reset Password
          </UButton>
        </div>
      </UForm>

      <div v-else class="text-center space-y-4">
        <UAlert color="success" variant="soft" title="Success!" :description="successMessage" />

        <UButton to="/login" block>
          Go to Login
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import type { z } from 'zod'
import { passwordResetConfirmSchema, type PasswordResetConfirm } from '~/schemas/password-reset'
import { passwordSchema } from '~/schemas/auth'

definePageMeta({
  layout: 'default',
  middleware: ['guest'],
})

// Form schema with password confirmation
const passwordResetConfirmFormSchema = passwordResetConfirmSchema
  .extend({
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type PasswordResetConfirmForm = z.infer<typeof passwordResetConfirmFormSchema>

// Get userId and secret from URL query parameters
const route = useRoute()
const userId = computed(() => route.query.userId as string | undefined)
const secret = computed(() => route.query.secret as string | undefined)

const formState = ref<PasswordResetConfirmForm>({
  userId: '',
  secret: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

// Validate that userId and secret are present
onMounted(() => {
  if (!userId.value || !secret.value) {
    errorMessage.value = 'Invalid or missing reset link. Please request a new password reset.'
  } else {
    formState.value.userId = userId.value
    formState.value.secret = secret.value
  }
})

async function handleSubmit() {
  if (!userId.value || !secret.value) {
    errorMessage.value = 'Invalid reset link. Please request a new password reset.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    // Only send required fields to API
    const response = await $fetch('/api/auth/password-reset/confirm', {
      method: 'POST',
      body: {
        userId: formState.value.userId,
        secret: formState.value.secret,
        password: formState.value.password,
      } satisfies PasswordResetConfirm,
    })

    // Show success and redirect to login
    successMessage.value = response.message
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const fetchError = error as { statusCode: number; message?: string; data?: { message?: string } }

      // Extract error message from response
      const message = fetchError.data?.message || fetchError.message

      if (fetchError.statusCode === 400) {
        errorMessage.value = message || 'Invalid or expired reset token. Please request a new password reset.'
      } else {
        errorMessage.value = message || 'An unexpected error occurred. Please try again.'
      }
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>
