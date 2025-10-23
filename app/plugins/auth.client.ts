export default defineNuxtPlugin(async () => {
  try {
    const auth = useAuth()
    // Trigger a session check early during client initialization so UI reflects logged-in state on refresh
    await auth.checkAuth()
  } catch (err) {
    const e = err as Record<string, unknown>
    // Non-blocking: log for debugging but don't throw
    console.debug('auth plugin: checkAuth error', e.message ?? e)
  }
})
