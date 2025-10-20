<template>
  <div class="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50">
    <!-- Header Component - Phase 5 -->
    <AppHeader />

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <slot />
    </main>

    <!-- Footer Component - Phase 5 -->
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
// Phase 5: Layout with components
const layout = useLayoutState()

// Initialize layout type when component mounts
onMounted(() => {
  layout.setLayoutType('frontend')
})
</script>
