<template>
  <aside
class="bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300"
    :class="isCollapsed ? 'w-16' : 'w-64'">
    <!-- Sidebar Header -->
    <div class="p-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-3">
        <AppLogo />
        <transition name="fade">
          <span v-if="!isCollapsed" class="font-bold text-lg text-gray-900 dark:text-gray-50">
            Admin
          </span>
        </transition>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="p-4">
      <ul class="space-y-2 list-none m-0 p-0">
        <li v-for="item in navigation" :key="item.path">
          <UButton
:to="item.path" variant="ghost" color="neutral" block :title="isCollapsed ? item.label : ''"
            class="justify-start">
            <template #leading>
              <UIcon :name="item.icon" class="text-xl" />
            </template>
            <span v-if="!isCollapsed">{{ item.label }}</span>
          </UButton>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
// Phase 5.5: Enhanced admin sidebar with Nuxt UI components

const layout = useLayoutState()
const isCollapsed = layout.sidebarCollapsed

const navigation = [
  { path: '/admin', label: 'Dashboard', icon: 'i-heroicons-chart-bar' },
  { path: '/admin/users', label: 'Users', icon: 'i-heroicons-users' }
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
