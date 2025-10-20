<template>
  <header class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Page Title -->
      <h1 class="text-xl font-bold text-gray-900 dark:text-gray-50">
        {{ pageTitle || 'Admin Panel' }}
      </h1>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Cross-section navigation to frontend -->
        <UButton v-if="crossSection.showNav" :to="crossSection.targetPath" variant="ghost" color="neutral" size="sm">
          {{ crossSection.targetLabel }}
        </UButton>

        <!-- Theme Toggle -->
        <ThemeToggle />

        <!-- Toggle Button - Using UButton -->
        <UButton
variant="soft" color="neutral" size="sm"
          :icon="layout.sidebarCollapsed.value ? 'i-heroicons-chevron-double-right' : 'i-heroicons-chevron-double-left'"
          :aria-label="layout.sidebarCollapsed.value ? 'Expand sidebar' : 'Collapse sidebar'"
          @click="layout.toggleSidebar()">
          {{ layout.sidebarCollapsed.value ? 'Expand' : 'Collapse' }}
        </UButton>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Phase 5.5: Enhanced admin header with Nuxt UI components
// Phase 4: Cross-section navigation (feature 002-basic-usability-i)

const layout = useLayoutState()
const { pageTitle } = layout

// Cross-section navigation
const { crossSection } = useNavigation()
</script>
