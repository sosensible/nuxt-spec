<script setup lang="ts">
const query = useRoute().query
const returnTo = (query.returnTo as string) || '/'
const auth = useAuth()

onMounted(async () => {
  try {
    await auth.checkAuth()
  }
  catch {
    // ignore
  }
  // Small delay to allow client state propagation
  await new Promise((r) => setTimeout(r, 150))
  navigateTo(returnTo)
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <p class="mb-4">Signing you in…</p>
      <progress class="progress is-small is-primary" />
    </div>
  </div>
</template>
