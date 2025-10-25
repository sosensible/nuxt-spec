import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Use the global `User` and `Session` interfaces declared in `types/shared.d.ts`.
// Removing local type exports named `User`/`Session` prevents duplicate
// import/name collisions during tests and bundling.

export const useAdminUserDetail = defineStore('adminUserDetail', () => {
  const user = ref<User | null>(null)
  const draft = ref<Partial<User> | null>(null)
  const sessions = ref<Session[]>([])
  const loading = ref(false)
  const saving = ref(false)
  const error = ref<string | null>(null)

  const isDirty = computed(() => {
    if (!user.value || !draft.value) return false
    return Object.keys(draft.value).some((k) => (draft.value as any)[k] !== (user.value as any)[k])
  })

  async function load(userId: string) {
    loading.value = true
    error.value = null
    try {
      const fetcher = ((globalThis as unknown as { $fetch?: (i: string) => Promise<unknown> }).$fetch ?? (globalThis.fetch as any))
      const u = await fetcher(`/api/admin/users/${encodeURIComponent(userId)}`)
      const s = await fetcher(`/api/admin/users/${encodeURIComponent(userId)}/sessions`)
      user.value = (u as any) ?? null
      sessions.value = (s as any) ?? []
      draft.value = user.value ? { ...user.value } : null
    } catch (err) {
      const e = err as Error
      error.value = e?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  function startEdit() {
    draft.value = user.value ? { ...user.value } : null
  }

  function cancelEdit() {
    draft.value = user.value ? { ...user.value } : null
  }

  async function saveUpdate(payload: Partial<User>) {
    if (!user.value) throw new Error('no user loaded')
    saving.value = true
    try {
      const fetcher = ((globalThis as unknown as { $fetch?: (i: string, opts?: any) => Promise<unknown> }).$fetch ?? (globalThis.fetch as any))
      const res = await fetcher(`/api/admin/users/${encodeURIComponent(user.value.id)}`, {
        method: 'PATCH',
        body: payload,
      })
      user.value = (res as any) ?? user.value
      draft.value = { ...user.value }
    } finally {
      saving.value = false
    }
  }

  async function disableUser() {
    if (!user.value) throw new Error('no user loaded')
    saving.value = true
    try {
      const fetcher = ((globalThis as unknown as { $fetch?: (i: string, opts?: any) => Promise<unknown> }).$fetch ?? (globalThis.fetch as any))
      await fetcher(`/api/admin/users/${encodeURIComponent(user.value.id)}/disable`, { method: 'POST' })
    } finally {
      saving.value = false
    }
  }

  async function deleteUser() {
    if (!user.value) throw new Error('no user loaded')
    saving.value = true
    try {
      const fetcher = ((globalThis as unknown as { $fetch?: (i: string, opts?: any) => Promise<unknown> }).$fetch ?? (globalThis.fetch as any))
      await fetcher(`/api/admin/users/${encodeURIComponent(user.value.id)}`, { method: 'DELETE' })
    } finally {
      saving.value = false
    }
  }

  async function loadSessions() {
    if (!user.value) return
    const fetcher = ((globalThis as unknown as { $fetch?: (i: string) => Promise<unknown> }).$fetch ?? (globalThis.fetch as any))
    const s = await fetcher(`/api/admin/users/${encodeURIComponent(user.value.id)}/sessions`)
    sessions.value = (s as any) ?? []
  }

  async function revokeSession(sessionId: string) {
    if (!user.value) throw new Error('no user loaded')
    const fetcher = ((globalThis as unknown as { $fetch?: (i: string, opts?: any) => Promise<unknown> }).$fetch ?? (globalThis.fetch as any))
    await fetcher(`/api/admin/users/${encodeURIComponent(user.value.id)}/revoke-session`, {
      method: 'POST',
      body: { sessionId },
    })
    // Update sessions list after revoke
    await loadSessions()
  }

  return {
    user,
    draft,
    sessions,
    loading,
    saving,
    error,
    isDirty,
    load,
    startEdit,
    cancelEdit,
    saveUpdate,
    disableUser,
    deleteUser,
    loadSessions,
    revokeSession,
  }
})
