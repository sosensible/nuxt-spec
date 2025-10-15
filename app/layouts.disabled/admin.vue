<template>
  <div class="layout layout--admin">
    <div class="layout__main">
      <main class="layout__content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Minimal admin layout without store dependencies for now
</script>

<style scoped>
.layout {
  @apply min-h-screen flex;
}

.layout--admin {
  @apply bg-gray-100;
}

.layout__main {
  @apply flex-1 flex flex-col;
}

.layout__content {
  @apply flex-1 p-6;
}
</style>
