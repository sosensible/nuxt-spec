<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
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
