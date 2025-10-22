<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <UCard class="w-full max-w-md">
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">Email Verification</h1>
        </div>
      </template>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <UIcon name="i-lucide-loader-2" class="w-12 h-12 mx-auto animate-spin text-primary" />
        <p class="mt-4 text-gray-600 dark:text-gray-400">
          Verifying your email...
        </p>
      </div>

      <!-- Success State -->
      <div v-else-if="successMessage" class="space-y-4">
        <UAlert color="success" variant="soft" title="Success!" :description="successMessage" />

        <UButton to="/" block>
          Go to Home
        </UButton>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="space-y-4">
        <UAlert color="error" variant="soft" title="Verification Failed" :description="errorMessage" />

        <UButton v-if="canResend" block :loading="resending" :disabled="resending" @click="handleResend">
          Resend Verification Email
        </UButton>

        <UButton to="/login" variant="outline" block>
          Back to Login
        </UButton>
      </div>

      <!-- No Token State -->
      <div v-else class="space-y-4">
        <UAlert color="warning" variant="soft" title="Invalid Link"
          description="This verification link is invalid or incomplete. Please check your email for the correct link." />

        <UButton to="/login" variant="outline" block>
          Back to Login
        </UButton>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: [], // No auth required - users verify before logging in
})

const route = useRoute()
const userId = computed(() => route.query.userId as string | undefined)
const secret = computed(() => route.query.secret as string | undefined)

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const resending = ref(false)
const canResend = ref(false)

// Auto-verify on page load if userId and secret are present
onMounted(async () => {
  if (!userId.value || !secret.value) {
    // No verification parameters - show error
    return
  }

  await verifyEmail()
})

async function verifyEmail() {
  if (!userId.value || !secret.value) {
    errorMessage.value = 'Invalid verification link. Please check your email for the correct link.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: {
        userId: userId.value,
        secret: secret.value,
      },
    })

    if (response && typeof response === 'object' && 'message' in response) {
      successMessage.value = String(response.message)
    }
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'data' in error) {
      const fetchError = error as { data?: { message?: string }; message?: string }
      errorMessage.value = fetchError.data?.message || fetchError.message || 'Verification failed. Please try again.'
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }

    // Allow resending if verification failed
    canResend.value = true
  } finally {
    loading.value = false
  }
}

async function handleResend() {
  resending.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch('/api/auth/verify-email/resend', {
      method: 'POST',
    })

    if (response && typeof response === 'object' && 'message' in response) {
      successMessage.value = String(response.message)
    }
    errorMessage.value = ''
    canResend.value = false
  } catch (error: unknown) {
    if (error && typeof error === 'object') {
      const fetchError = error as { statusCode?: number; data?: { message?: string }; message?: string }

      if (fetchError.statusCode === 401) {
        errorMessage.value = 'Please log in to resend verification email.'
      } else {
        errorMessage.value = fetchError.data?.message || fetchError.message || 'Failed to resend email. Please try again.'
      }
    } else {
      errorMessage.value = 'An unexpected error occurred. Please try again.'
    }
  } finally {
    resending.value = false
  }
}
</script>
