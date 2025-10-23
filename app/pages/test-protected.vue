<template>
  <div>
    <h1>Protected Test Page</h1>
    <p>If you can see this, you are authenticated.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
