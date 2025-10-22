<template>
  <UContainer class="flex items-center justify-center min-h-screen py-12">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Log In
        </h1>
      </template>

      <!-- Error Alert -->
      <UAlert
        v-if="error"
        color="red"
        variant="subtle"
        title="Login Failed"
        :description="error"
        class="mb-6"
        :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }"
        @close="error = ''"
      />

      <!-- Login Form -->
      <UForm
        :schema="loginSchema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <!-- Email Field -->
        <UFormGroup
          label="Email"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="you@example.com"
            autocomplete="email"
            size="lg"
          />
        </UFormGroup>

        <!-- Password Field -->
        <UFormGroup
          label="Password"
          name="password"
          required
        >
          <PasswordInput
            v-model="state.password"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </UFormGroup>

        <!-- Forgot Password Link -->
        <div class="flex justify-end">
          <NuxtLink
            to="/password-reset"
            class="text-sm text-primary hover:underline"
          >
            Forgot password?
          </NuxtLink>
        </div>

        <!-- Submit Button -->
        <UButton
          type="submit"
          color="primary"
          size="lg"
          block
          :loading="loading"
          :disabled="loading"
        >
          Log In
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?
          <NuxtLink
            to="/register"
            class="text-primary hover:underline font-medium"
          >
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

// Methods
async function onSubmit() {
  loading.value = true
  error.value = ''

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
    error.value = getAuthErrorMessage(err)
    console.error('Login error:', err)
  }
  finally {
    loading.value = false
  }
}
</script>
