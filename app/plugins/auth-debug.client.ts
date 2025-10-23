import { onMounted, onBeforeUnmount, watch } from 'vue'

export default defineNuxtPlugin(() => {
  // Only enable in non-production to avoid leaking user info
  if (process.env.NODE_ENV === 'production') return

  const auth = useAuth()

  onMounted(() => {
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

    onBeforeUnmount(() => {
      stopUser()
      stopLoading()
      el.remove()
    })
  })
})
