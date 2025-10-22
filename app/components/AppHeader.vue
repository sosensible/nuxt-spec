<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Logo and Brand -->
      <NuxtLink
to="/"
        class="flex items-center gap-3 text-gray-900 dark:text-gray-50 hover:text-primary transition-colors no-underline">
        <AppLogo />
        <span class="text-xl font-bold">{{ siteName }}</span>
      </NuxtLink>

      <!-- Navigation and Theme Toggle -->
      <div class="flex items-center gap-4">
        <nav class="flex gap-2">
          <UButton v-for="item in navigation" :key="item.path" :to="item.path" variant="ghost" color="neutral">
            {{ item.label }}
          </UButton>
          <!-- Cross-section navigation to admin -->
          <UButton v-if="crossSection.showNav" :to="crossSection.targetPath" variant="ghost" color="neutral">
            {{ crossSection.targetLabel }}
          </UButton>
        </nav>

        <!-- Auth Actions -->
        <div v-if="user" class="flex items-center gap-3">
          <span class="text-sm text-gray-600 dark:text-gray-400">
            {{ user.name }}
          </span>
          <UButton
            color="neutral"
            variant="ghost"
            :loading="loggingOut"
            @click="handleLogout"
          >
            Log Out
          </UButton>
        </div>
        <div v-else class="flex items-center gap-2">
          <UButton
            to="/login"
            variant="ghost"
            color="neutral"
          >
            Log In
          </UButton>
          <UButton
            to="/register"
            color="primary"
          >
            Sign Up
          </UButton>
        </div>

        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Phase 5.5: Enhanced header with Nuxt UI components
// Phase 4: Cross-section navigation (feature 002-basic-usability-i)
// Phase 2.3: Auth actions (login, logout, register)

interface Props {
  siteName?: string
}

const _props = withDefaults(defineProps<Props>(), {
  siteName: 'Our Site',
})

// Simple navigation items
const navigation = [
  { path: '/', label: 'Home' },
  { path: '/info', label: 'Info' },
]

// Cross-section navigation
const { crossSection } = useNavigation()

// Auth
const { user, logout } = useAuth()
const router = useRouter()
const loggingOut = ref(false)

async function handleLogout() {
  loggingOut.value = true
  try {
    await logout()
    await router.push('/login')
  }
  catch (error) {
    console.error('Logout error:', error)
  }
  finally {
    loggingOut.value = false
  }
}
</script>
