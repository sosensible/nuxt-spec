<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar Component - Phase 5 -->
    <AdminSidebar />

    <div class="flex-1 flex flex-col">
      <!-- Header Component - Phase 5 -->
      <AdminHeader />

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 5: Admin layout with components
const layout = useLayoutState()

// Initialize layout type when component mounts
onMounted(() => {
  layout.setLayoutType('admin')
})
</script>
