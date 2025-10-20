<template>
  <div class="p-8">
    <h1 class="text-4xl font-bold text-gray-900 dark:text-gray-50">
      Hello World
    </h1>
    <p class="mt-4 text-gray-600 dark:text-gray-400">
      This is a test page.
    </p>

    <!-- Phase 3: Testing Composables -->
    <div class="mt-8 p-6 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
      <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-50">
        Composable Test
      </h2>

      <div class="space-y-2 text-gray-900 dark:text-gray-50">
        <p><strong>Layout Type:</strong> {{ layout.layoutType }}</p>
        <p><strong>Is Frontend:</strong> {{ layout.isFrontend }}</p>
        <p><strong>Page Title:</strong> {{ layout.pageTitle || '(not set)' }}</p>
        <p><strong>Current Path:</strong> {{ nav.currentPath }}</p>
        <p><strong>Is Admin Route:</strong> {{ nav.isAdminRoute }}</p>
      </div>

      <div class="mt-4 space-x-2">
        <button
class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          @click="layout.setPageTitle('Test Title', 'Test Description')">
          Set Page Title
        </button>
        <button class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700" @click="layout.toggleSidebar()">
          Toggle Sidebar ({{ layout.sidebarCollapsed ? 'Collapsed' : 'Expanded' }})
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 3: Test composables instead of direct store access
const layout = useLayoutState()
const nav = useNavigation()

// Set initial layout type
layout.setLayoutType('frontend')
</script>
