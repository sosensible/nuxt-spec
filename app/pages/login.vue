<template>
  <UContainer class="flex items-center justify-center min-h-screen py-12">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Log In
        </h1>
      </template>

      <!-- Error Alert -->
      <UAlert v-if="error" color="error" variant="subtle" title="Login Failed" :description="error" class="mb-6"
        :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }" @close="error = ''" />

      <!-- Email Verification Alert -->
      <UAlert v-if="showVerificationAlert" color="warning" variant="subtle" title="Email Verification Required"
        description="Please verify your email address to continue. Check your inbox for the verification link."
        class="mb-6" :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
        @close="showVerificationAlert = false">
        <template #actions>
          <UButton color="warning" variant="solid" size="xs" :loading="resendingVerification"
            :disabled="resendingVerification" @click="resendVerificationEmail">
            Resend Verification Email
          </UButton>
        </template>
      </UAlert>

      <!-- GitHub OAuth Button -->
      <UButton color="neutral" variant="outline" size="lg" block icon="i-simple-icons-github" :loading="oauthLoading"
        :disabled="oauthLoading" @click="handleGitHubLogin">
        Continue with GitHub
      </UButton>

      <!-- Divider -->
      <USeparator label="or" class="my-6" />

      <!-- Login Form -->
      <UForm :schema="loginSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <!-- Email Field -->
        <UFormGroup label="Email" name="email" required>
          <UInput v-model="state.email" type="email" placeholder="you@example.com" autocomplete="email" size="lg" />
        </UFormGroup>

        <!-- Password Field -->
        <UFormGroup label="Password" name="password" required>
          <PasswordInput v-model="state.password" placeholder="Enter your password" autocomplete="current-password" />
        </UFormGroup>

        <!-- Forgot Password Link -->
        <div class="flex justify-end">
          <NuxtLink to="/password-reset" class="text-sm text-primary hover:underline">
            Forgot password?
          </NuxtLink>
        </div>

        <!-- Submit Button -->
        <UButton type="submit" color="primary" size="lg" block :loading="loading" :disabled="loading">
          Log In
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <NuxtLink to="/register" class="text-primary hover:underline font-medium">
            Sign up
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { loginSchema } from '~/schemas/auth'
import type { LoginForm } from '~/schemas/auth'

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

// SEO
useHead({
  title: 'Log In',
  meta: [
    { name: 'description', content: 'Log in to your account' },
  ],
})

// Composables
const { login } = useAuth()
const router = useRouter()
const route = useRoute()

// State
const state = reactive<LoginForm>({
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const showVerificationAlert = ref(false)
const resendingVerification = ref(false)

// OAuth composable
const { loading: oauthLoading, loginWithGitHub, getOAuthErrorMessage } = useOAuth()

// Check for OAuth error in URL
onMounted(() => {
  const oauthError = route.query.error as string | undefined
  if (oauthError) {
    error.value = getOAuthErrorMessage(oauthError)
  }
})

// Methods
async function handleGitHubLogin() {
  error.value = ''

  try {
    await loginWithGitHub()
  } catch {
    error.value = 'Failed to initiate GitHub login. Please try again.'
  }
}

async function onSubmit() {
  loading.value = true
  error.value = ''
  showVerificationAlert.value = false

  try {
    // Call login API
    await login(state.email, state.password)

    // Get return URL from query params or default to home
    const returnUrl = (route.query.returnUrl as string) || (route.query.redirect as string) || '/'

    // Redirect to return URL
    await router.push(returnUrl)
  }
  catch (err: unknown) {
    // Handle error with user-friendly message
    const errorMessage = getAuthErrorMessage(err)

    // Check if error is related to email verification
    if (errorMessage.toLowerCase().includes('verify') || errorMessage.toLowerCase().includes('verification')) {
      showVerificationAlert.value = true
      error.value = ''
    } else {
      error.value = errorMessage
    }

    console.error('Login error:', err)
  }
  finally {
    loading.value = false
  }
}

async function resendVerificationEmail() {
  resendingVerification.value = true

  try {
    await $fetch('/api/auth/verify-email/resend', {
      method: 'POST',
    })

    // Update alert to show success
    showVerificationAlert.value = false
    error.value = ''

    // Show success message
    alert('Verification email sent! Please check your inbox.')
  } catch (err: unknown) {
    console.error('Resend verification error:', err)

    // Show error
    if (err && typeof err === 'object' && 'data' in err) {
      const fetchError = err as { data?: { message?: string }; message?: string }
      error.value = fetchError.data?.message || fetchError.message || 'Failed to resend verification email.'
    } else {
      error.value = 'Failed to resend verification email. Please try again.'
    }
  } finally {
    resendingVerification.value = false
  }
}
</script>
