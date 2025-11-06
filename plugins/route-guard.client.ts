import type { RouteLocationNormalized } from 'vue-router'
import * as rc from '../route-config/index'

declare global {
  interface GlobalThis {
    __registerRouteGuard?: () => void
    useRouter?: () => { beforeEach(cb: (to: { path: string; fullPath?: string }) => unknown): void }
    useAuth?: () => { user: { value: null | { labels?: string[] } }; checkAuth: () => Promise<void> }
    defineNuxtPlugin?: (fn: () => unknown) => unknown
    navigateTo?: (url: string) => unknown
  }
}

export default (() => {
  // Use the runtime-provided defineNuxtPlugin when available on globalThis (tests set it there),
  // otherwise fall back to a no-op wrapper that simply invokes the passed function.
  const installer = (globalThis.defineNuxtPlugin ?? ((fn: () => unknown) => fn())) as (fn: () => unknown) => unknown
  const registerGuard = () => {
    const router = globalThis.useRouter ? globalThis.useRouter() : useRouter()
    const auth = globalThis.useAuth ? globalThis.useAuth() : useAuth()

    // We'll call the centralized check helper per-navigation. That helper
    // loads rules when needed and evaluates label/login requirements.

    // Router guard
    router.beforeEach(async (to: RouteLocationNormalized) => {
    // Ensure server/session state is loaded
    try {
  if (process.env.NODE_ENV === 'development') console.log('[route-guard] guard invoked for', to.path)
      await auth.checkAuth()
  if (process.env.NODE_ENV === 'development') console.log('[route-guard] after checkAuth for', to.path)
    }
    catch (err) {
      // ignore - checkAuth will set user to null on failure
  if (process.env.NODE_ENV === 'development') console.log('[route-guard] checkAuth error', err)
    }

    // Delegate to centralized helper
    try {
  const res = await rc.checkAccessForPath(to.path, auth.user.value || null)
      if (process.env.NODE_ENV === 'development') {
        console.log('[route-guard] checkAccessForPath result', JSON.parse(JSON.stringify(res)))
      }

      if (res.reason === 'not_authenticated') {
        const redirect = encodeURIComponent(to.fullPath || to.path)
        return globalThis.navigateTo?.(`/login?redirect=${redirect}`)
      }
      if (res.reason === 'missing_labels') {
        return globalThis.navigateTo?.('/unauthorized')
      }
      // allowed -> continue
    }
    catch (err) {
      // If check helper fails for some reason, don't block navigation.
      // In development log the error so unit tests can surface the cause.
      if (process.env.NODE_ENV === 'development') console.error('[route-guard] check helper failed', err)
    }
  })

  }

  // In test environments the testing harness often provides `useRouter`/`useAuth` on globalThis
  // instead of using the Nuxt runtime. If so, register the guard eagerly so tests that import
  // the plugin observe the router guard immediately.
  try {
    if (globalThis.useRouter && globalThis.useAuth) {
      registerGuard()
    }
  }
  catch (err) {
    if (process.env.NODE_ENV === 'development') console.log('[route-guard] eager register failed', err)
  }

  // Export a test hook so unit tests can opt-in to explicitly register the guard
  // when import-time side-effects are unreliable in certain test environments.
  try { globalThis.__registerRouteGuard = registerGuard } catch (e) { if (process.env.NODE_ENV === 'development') console.log('[route-guard] set hook failed', e) }

  return installer(() => registerGuard())
})()
