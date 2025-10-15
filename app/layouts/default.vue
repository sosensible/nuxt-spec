<template>
  <div class="min-h-screen flex flex-col bg-white text-gray-900">
    <!-- Header placeholder for Phase 5 components -->
    <header class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="text-xl font-bold">Frontend Layout</div>
        <nav class="flex gap-4">
          <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Home</NuxtLink>
          <NuxtLink to="/info" class="text-gray-600 hover:text-gray-900">Info</NuxtLink>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col">
      <slot />
    </main>

    <!-- Footer placeholder for Phase 5 components -->
    <footer class="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center text-sm text-gray-600">
      Frontend Footer - Phase 4
    </footer>
  </div>
</template>

<script setup lang="ts">
// Phase 4: Enhanced layout with composables
const layout = useLayoutState()

// Initialize layout type when component mounts
onMounted(() => {
  layout.setLayoutType('frontend')
})
</script>
