<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar placeholder for Phase 5 components -->
    <aside class="bg-gray-800 text-white transition-all duration-300"
      :class="layout.sidebarCollapsed.value ? 'w-16' : 'w-64'">
      <div class="p-4">
        <div class="font-bold text-lg mb-6">
          {{ layout.sidebarCollapsed.value ? 'A' : 'Admin' }}
        </div>
        <nav class="space-y-2">
          <NuxtLink to="/admin" class="block px-3 py-2 rounded hover:bg-gray-700"
            :title="layout.sidebarCollapsed.value ? 'Dashboard' : ''">
            {{ layout.sidebarCollapsed.value ? '📊' : '📊 Dashboard' }}
          </NuxtLink>
          <NuxtLink to="/admin/users" class="block px-3 py-2 rounded hover:bg-gray-700"
            :title="layout.sidebarCollapsed.value ? 'Users' : ''">
            {{ layout.sidebarCollapsed.value ? '👥' : '👥 Users' }}
          </NuxtLink>
        </nav>
      </div>
    </aside>

    <div class="flex-1 flex flex-col">
      <!-- Header placeholder for Phase 5 components -->
      <header class="bg-white border-b border-gray-200 px-6 py-4">
        <div class="flex items-center justify-between">
          <h1 class="text-xl font-bold">{{ layout.pageTitle.value || 'Admin Panel' }}</h1>
          <button @click="layout.toggleSidebar()" class="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm">
            {{ layout.sidebarCollapsed.value ? '→' : '←' }} Toggle
          </button>
        </div>
      </header>

      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 4: Enhanced admin layout with composables
const layout = useLayoutState()

// Initialize layout type when component mounts
onMounted(() => {
  layout.setLayoutType('admin')
})
</script>
