<template>
  <footer class="bg-gray-50 border-t border-gray-200 px-6 py-8">
    <div class="max-w-7xl mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- Brand Column -->
        <div>
          <div class="flex items-center gap-2 mb-4">
            <AppLogo />
            <span class="font-bold text-lg">{{ siteName }}</span>
          </div>
          <p class="text-gray-600 text-sm">
            Building something amazing together.
          </p>
        </div>

        <!-- Links Column -->
        <div>
          <h3 class="font-semibold mb-3">Quick Links</h3>
          <ul class="space-y-2 text-sm list-none m-0 p-0">
            <li v-for="item in navigation" :key="item.path">
              <NuxtLink :to="item.path" class="text-gray-600 hover:text-gray-900 no-underline">
                {{ item.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Info Column -->
        <div>
          <h3 class="font-semibold mb-3">Contact</h3>
          <p class="text-gray-600 text-sm">
            Email: hello@example.com<br>
            Phase 5.2 - Footer Component
          </p>
        </div>
      </div>

      <div class="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
        © {{ currentYear }} {{ siteName }}. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Phase 5.2: Minimal footer component

interface Props {
  siteName?: string
}

const _props = withDefaults(defineProps<Props>(), {
  siteName: 'Our Site'
})

const currentYear = new Date().getFullYear()

const navigation = [
  { path: '/', label: 'Home' },
  { path: '/info', label: 'About' }
]
</script>
