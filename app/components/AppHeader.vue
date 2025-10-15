<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between max-w-7xl mx-auto">
      <!-- Logo and Brand -->
      <NuxtLink to="/" class="flex items-center gap-3 text-gray-900 hover:text-primary transition-colors no-underline">
        <AppLogo />
        <span class="text-xl font-bold">{{ siteName }}</span>
      </NuxtLink>

      <!-- Navigation -->
      <nav class="flex gap-2">
        <UButton v-for="item in navigation" :key="item.path" :to="item.path" variant="ghost" color="neutral">
          {{ item.label }}
        </UButton>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
// Phase 5.5: Enhanced header with Nuxt UI components

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
</script>
