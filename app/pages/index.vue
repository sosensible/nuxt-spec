<template>
  <div class="p-8">
    <h1 class="text-4xl font-bold">
      Hello World
    </h1>
    <p class="mt-4">
      This is a test page.
    </p>

    <!-- Phase 2.4: Testing Pinia stores -->
    <div class="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
      <h2 class="text-2xl font-semibold mb-4">Store Test</h2>

      <div class="space-y-2">
        <p><strong>Layout Type:</strong> {{ layoutStore.layoutType }}</p>
        <p><strong>Is Frontend:</strong> {{ layoutStore.isFrontend }}</p>
        <p><strong>Page Title:</strong> {{ layoutStore.pageTitle || '(not set)' }}</p>
        <p><strong>Current Path:</strong> {{ navStore.currentPath }}</p>
        <p><strong>Is Admin Route:</strong> {{ navStore.isAdminRoute }}</p>
      </div>

      <div class="mt-4 space-x-2">
        <button @click="layoutStore.setPageTitle('Test Title', 'Test Description')"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Set Page Title
        </button>
        <button @click="layoutStore.toggleSidebar()" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Toggle Sidebar ({{ layoutStore.sidebarCollapsed ? 'Collapsed' : 'Expanded' }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 2.4: Test accessing stores from page
const layoutStore = useLayoutStore()
const navStore = useNavigationStore()

// Set initial layout type
layoutStore.setLayoutType('frontend')
</script>
