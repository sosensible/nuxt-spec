import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Use the global `User` interface declared in `types/shared.d.ts`.
// This avoids duplicate local type exports named `User` which can
// cause bundling/test-time duplicate-import warnings.

export const useAdminUsers = defineStore('adminUsers', () => {
  const items = ref<User[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const query = ref('')
  const limit = ref<number>(25)
  const cursor = ref<string | undefined>(undefined)
  const hasMore = ref(false)

  const totalLoaded = computed(() => items.value.length)
  const isEmpty = computed(() => items.value.length === 0)

  async function fetchFirstPage(params?: { query?: string; limit?: number }) {
    loading.value = true
    error.value = null
    try {
      if (params?.query !== undefined) query.value = params.query
      if (params?.limit) limit.value = params.limit
      // Use global $fetch if available (Nuxt); fallback to fetch
  type Fetcher = (input: string) => Promise<unknown>
  const maybeFetch = (globalThis as unknown as { $fetch?: Fetcher }).$fetch
  const fetcher = (maybeFetch ?? (globalThis.fetch as Fetcher))
      const q = query.value ? `&q=${encodeURIComponent(query.value)}` : ''
  const resUnknown = await fetcher(`/api/admin/users?limit=${limit.value}${q}`)
  const res = resUnknown as { data?: User[]; nextCursor?: string }
  items.value = res.data ?? []
  cursor.value = res.nextCursor
  hasMore.value = !!res.nextCursor
    } catch (err) {
      const e = err as Error
      error.value = e?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  async function fetchNextPage() {
    if (!cursor.value) return
    loading.value = true
    try {
  type Fetcher = (input: string) => Promise<unknown>
  const maybeFetch = (globalThis as unknown as { $fetch?: Fetcher }).$fetch
  const fetcher = (maybeFetch ?? (globalThis.fetch as Fetcher))
  const resUnknown = await fetcher(`/api/admin/users?limit=${limit.value}&cursor=${encodeURIComponent(cursor.value)}`)
  const res = resUnknown as { data?: User[]; nextCursor?: string }
  items.value = items.value.concat(res.data ?? [])
  cursor.value = res.nextCursor
  hasMore.value = !!res.nextCursor
    } catch (err) {
      const e = err as Error
      error.value = e?.message ?? String(err)
    } finally {
      loading.value = false
    }
  }

  async function refresh() {
    await fetchFirstPage({ query: query.value, limit: limit.value })
  }

  function setQuery(q: string) {
    query.value = q
  }

  return {
    items,
    loading,
    error,
    query,
    limit,
    cursor,
    hasMore,
    totalLoaded,
    isEmpty,
    fetchFirstPage,
    fetchNextPage,
    refresh,
    setQuery,
  }
})
