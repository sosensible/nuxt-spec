<template>
  <UContainer class="flex items-center justify-center min-h-screen py-12">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center">
          Create Account
        </h1>
      </template>

      <!-- Error Alert -->
      <UAlert v-if="error" color="error" variant="subtle" title="Registration Failed" :description="error" class="mb-6"
        :close-button="{ icon: 'i-lucide-x', color: 'gray', variant: 'link', padded: false }" @close="error = ''" />

      <!-- Success Alert -->
      <UAlert v-if="success" color="success" variant="subtle" title="Account Created"
        description="Your account has been created successfully." class="mb-6" />

      <!-- GitHub OAuth Button -->
      <UButton color="neutral" variant="outline" size="lg" block icon="i-simple-icons-github" :loading="oauthLoading"
        :disabled="oauthLoading" @click="handleGitHubRegister">
        Continue with GitHub
      </UButton>

      <!-- Divider -->
      <USeparator label="or" class="my-6" />

      <!-- Registration Form -->
      <UForm :schema="registerSchema" :state="state" class="space-y-4" @submit="onSubmit">
        <!-- Name Field -->
        <UFormGroup label="Full Name" name="name" required>
          <UInput v-model="state.name" type="text" placeholder="John Doe" autocomplete="name" size="lg" />
        </UFormGroup>

        <!-- Email Field -->
        <UFormGroup label="Email" name="email" required>
          <UInput v-model="state.email" type="email" placeholder="you@example.com" autocomplete="email" size="lg" />
        </UFormGroup>

        <!-- Password Field -->
        <UFormGroup label="Password" name="password" required :hint="passwordHint">
          <PasswordInput v-model="state.password" placeholder="Create a strong password" autocomplete="new-password" />
        </UFormGroup>

        <!-- Password Strength Indicator -->
        <div v-if="state.password" class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div :class="[
                'h-full transition-all duration-300',
                passwordStrength.color,
              ]" :style="{ width: `${passwordStrength.percentage}%` }" />
            </div>
            <span class="text-xs font-medium">{{ passwordStrength.label }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <UButton type="submit" color="primary" size="lg" block :loading="loading" :disabled="loading">
          Sign Up
        </UButton>
      </UForm>

      <template #footer>
        <div class="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?
          <NuxtLink to="/login" class="text-primary hover:underline font-medium">
            Log in
          </NuxtLink>
        </div>
      </template>
    </UCard>
  </UContainer>
</template>

<script setup lang="ts">
import { registerSchema } from '~/schemas/auth'
import type { RegisterForm } from '~/schemas/auth'

// Page meta
definePageMeta({
  layout: 'default',
  middleware: 'guest'
})

// SEO
useHead({
  title: 'Sign Up',
  meta: [
    { name: 'description', content: 'Create a new account' },
  ],
})

// Composables
const { register } = useAuth()
const router = useRouter()

// State
const state = reactive<RegisterForm>({
  name: '',
  email: '',
  password: '',
})

const loading = ref(false)
const error = ref('')
const success = ref(false)
const oauthLoading = ref(false)

// Methods
async function handleGitHubRegister() {
  oauthLoading.value = true
  error.value = ''

  try {
    // Get OAuth URL from Appwrite
    const response = await $fetch<{ url: string }>('/api/auth/oauth/github')

    // Redirect to GitHub OAuth
    window.location.href = response.url
  } catch (err: unknown) {
    oauthLoading.value = false
    error.value = 'Failed to initiate GitHub registration. Please try again.'
    console.error('GitHub OAuth error:', err)
  }
}

// Password hint
const passwordHint = 'At least 8 characters with uppercase, lowercase, number, and special character'

// Password strength calculation
const passwordStrength = computed(() => {
  const password = state.password
  if (!password) {
    return { percentage: 0, label: '', color: '' }
  }

  let strength = 0
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }

  // Calculate strength (0-5)
  strength = Object.values(checks).filter(Boolean).length

  // Determine label and color
  if (strength <= 2) {
    return {
      percentage: (strength / 5) * 100,
      label: 'Weak',
      color: 'bg-red-500',
    }
  }
  else if (strength === 3) {
    return {
      percentage: (strength / 5) * 100,
      label: 'Fair',
      color: 'bg-orange-500',
    }
  }
  else if (strength === 4) {
    return {
      percentage: (strength / 5) * 100,
      label: 'Good',
      color: 'bg-yellow-500',
    }
  }
  else {
    return {
      percentage: 100,
      label: 'Strong',
      color: 'bg-green-500',
    }
  }
})

// Methods
async function onSubmit() {
  loading.value = true
  error.value = ''
  success.value = false

  try {
    // Call register API
    await register(state.name, state.email, state.password)

    // Show success message
    success.value = true

    // Redirect to home after successful registration (auto-logged in)
    setTimeout(async () => {
      await router.push('/')
    }, 1500)
  }
  catch (err: unknown) {
    // Handle error with user-friendly message
    error.value = getAuthErrorMessage(err)
    console.error('Registration error:', err)
  }
  finally {
    loading.value = false
  }
}
</script>
