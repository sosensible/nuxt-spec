import { watch } from 'vue'

export default defineNuxtPlugin(() => {
  // Only enable in non-production to avoid leaking user info
  if (process.env.NODE_ENV === 'production') return

  // This plugin used to rely on component lifecycle hooks (onMounted/onBeforeUnmount)
  // which can trigger warnings during tests because lifecycle APIs require an active
  // component instance. Instead, run the debug overlay setup immediately on the
  // client and attach a window unload handler for cleanup.
  if (import.meta.client) {
    try {
      const auth = useAuth()

      const el = document.createElement('div')
      el.id = 'auth-debug-overlay'
    Object.assign(el.style, {
      position: 'fixed',
      right: '12px',
      bottom: '12px',
      zIndex: '99999',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      padding: '8px 10px',
      fontSize: '12px',
      borderRadius: '6px',
      maxWidth: '360px',
      maxHeight: '240px',
      overflow: 'auto',
      whiteSpace: 'pre-wrap',
    })
    document.body.appendChild(el)

    const extractValue = (s: unknown) => {
      if (s && typeof s === 'object' && 'value' in (s as Record<string, unknown>)) {
        return (s as Record<string, unknown>)['value']
      }
      return undefined
    }

    const update = () => {
      const user = extractValue(auth.user) ?? null
      const loading = extractValue(auth.loading) ?? false
      el.textContent = `auth.user: ${JSON.stringify(user, null, 2)}\nloading: ${String(loading)}`
    }

      update()

      const stopUser = watch(() => extractValue(auth.user), update, { deep: true })

      const stopLoading = watch(() => extractValue(auth.loading), update)

      const cleanup = () => {
  try { stopUser() } catch { void 0 }
  try { stopLoading() } catch { void 0 }
        if (el.parentNode) el.remove()
        window.removeEventListener('unload', cleanup)
      }

      // Cleanup when the page unloads
      window.addEventListener('unload', cleanup)
    }
  catch (err) {
      // Don't crash the app or tests if the debug plugin can't initialize
      // (for example when `useAuth` isn't available in the test environment).
      // Log in development so we can diagnose if needed.
      if (process.env.NODE_ENV === 'development') {
        console.warn('auth-debug plugin failed to initialize', err)
      }
    }
  }
})
