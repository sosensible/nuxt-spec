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
        <ThemeToggle />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Phase 5.5: Enhanced header with Nuxt UI components
// Phase 4: Cross-section navigation (feature 002-basic-usability-i)

interface Props {
  siteName?: string
}

const _props = withDefaults(defineProps<Props>(), {
  siteName: 'Our Site'
})

// Simple navigation items
const navigation = [
  { path: '/', label: 'Home' },
  { path: '/info', label: 'Info' }
]

// Cross-section navigation
const { crossSection } = useNavigation()
</script>
