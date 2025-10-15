<template>
  <div class="layout layout--frontend">
    <!-- Main Content -->
    <main class="layout__main">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
// Minimal layout without store dependencies for now
// We'll add back the full functionality once stores are properly initialized
</script>

<style scoped>
.layout {
  @apply min-h-screen flex flex-col;
}

.layout--frontend {
  @apply bg-white text-gray-900;
}

.layout__main {
  @apply flex-1 flex flex-col;
}
</style>
