<template>
  <div>
    <h1 class="text-2xl font-bold mb-4 text-gray-900">Admin Test Page</h1>
    <p class="text-gray-600">This page uses the admin layout.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})
</script>
