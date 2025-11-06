/* eslint-disable @typescript-eslint/no-explicit-any */
import { beforeEach, describe, expect, it, vi } from 'vitest'

type GuardCallback = (to: { path: string; fullPath?: string }) => unknown

declare global {
  function defineNuxtPlugin(fn: () => void): void
  function useRouter(): { beforeEach(cb: GuardCallback): void; __getGuard(): GuardCallback | null }
  function useAuth(): { user: { value: null | { labels?: string[] } }; checkAuth: () => Promise<void> }
  function navigateTo(url: string): unknown
}

describe('route-guard plugin', () => {
  let registeredGuard: GuardCallback | null = null

  beforeEach(async () => {
    // reset any previous globals
    // provide a minimal mock router that captures the beforeEach callback
    const guardHolder = { cb: null as GuardCallback | null }
    const router = {
      beforeEach(cb: GuardCallback) {
        guardHolder.cb = cb
      },
      __getGuard() {
        return guardHolder.cb
      }
    }

    // attach mocks to globalThis in a typed manner
    ;(globalThis as unknown as { defineNuxtPlugin?: (fn: () => void) => void }).defineNuxtPlugin = (fn: () => void) => fn()
  ;(globalThis as unknown as { useRouter: () => { beforeEach(cb: GuardCallback): void; __getGuard(): GuardCallback | null } }).useRouter = () => router

    // create a mutable mock auth object the plugin will read
    const auth = {
      user: { value: null as null | { labels?: string[] } },
      checkAuth: vi.fn(async () => {})
    }
  ;(globalThis as unknown as { useAuth: () => { user: { value: null | { labels?: string[] } }; checkAuth: () => Promise<void> } }).useAuth = () => auth

    // capture navigateTo calls
  ;(globalThis as unknown as { navigateTo: (url: string) => { redirected: string } }).navigateTo = (url: string) => ({ redirected: url })

  // Import the plugin fresh so it runs with the above globals
  await import('../../plugins/route-guard.client.ts')

  // Some test environments rely on an explicit registration hook. If the plugin
  // exported a test hook, call it to ensure the guard is registered.
  if ((globalThis as any).__registerRouteGuard) (globalThis as any).__registerRouteGuard()

    // retrieve the registered guard
    registeredGuard = router.__getGuard()
    if (!registeredGuard) throw new Error('Guard was not registered')
  })

  it('redirects to login when requireLogin and user not authenticated', async () => {
    // call guard with an admin path (configured in route-config/protected.ts)
    const res = await registeredGuard!({ path: '/admin/dashboard', fullPath: '/admin/dashboard' })
    expect(res).toEqual({ redirected: expect.stringContaining('/login') })
  })

  it('redirects to unauthorized when user lacks required labels', async () => {
    // set user but without labels
  ;(globalThis as unknown as { useAuth: () => { user: { value: null | { labels?: string[] } } } }).useAuth().user.value = { labels: [] }
    const res = await registeredGuard!({ path: '/admin/dashboard', fullPath: '/admin/dashboard' })
    expect(res).toEqual({ redirected: '/unauthorized' })
  })

  it('allows navigation when user has required label', async () => {
  ;(globalThis as unknown as { useAuth: () => { user: { value: null | { labels?: string[] } } } }).useAuth().user.value = { labels: ['admin'] }
    const res = await registeredGuard!({ path: '/admin/settings', fullPath: '/admin/settings' })
    expect(res).toBeUndefined()
  })

  it('requires all labels when labelsMode is all', async () => {
    // user with only one of the required labels should be rejected
    ;(globalThis as unknown as { useAuth: () => { user: { value: null | { labels?: string[] } } } }).useAuth().user.value = { labels: ['admin'] }
    const res1 = await registeredGuard!({ path: '/admin/secure/area', fullPath: '/admin/secure/area' })
    expect(res1).toEqual({ redirected: '/unauthorized' })

    // user with both labels should be allowed
    ;(globalThis as unknown as { useAuth: () => { user: { value: null | { labels?: string[] } } } }).useAuth().user.value = { labels: ['admin', 'staff'] }
    const res2 = await registeredGuard!({ path: '/admin/secure/area', fullPath: '/admin/secure/area' })
    expect(res2).toBeUndefined()
  })
})
