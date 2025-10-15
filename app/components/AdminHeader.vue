<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <!-- Page Title -->
      <h1 class="text-xl font-bold">
        {{ pageTitle || 'Admin Panel' }}
      </h1>

      <!-- Actions -->
      <div class="flex items-center gap-4">
        <!-- Toggle Button - Using UButton -->
        <UButton variant="soft" color="neutral" size="sm"
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

const layout = useLayoutState()
const { pageTitle } = layout
</script>
