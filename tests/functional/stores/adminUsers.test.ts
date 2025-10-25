import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminUsers } from '../../../app/stores/adminUsers'

describe('adminUsers store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('fetchFirstPage loads items and sets cursor', async () => {
    const fakeResp = { data: [{ id: 'u1', email: 'a@b' }], nextCursor: 'c1' }
    ;(globalThis as unknown as { $fetch?: (i: string) => Promise<unknown> }).$fetch = vi.fn().mockResolvedValue(fakeResp) as unknown as (i: string) => Promise<unknown>

    const store = useAdminUsers()
    await store.fetchFirstPage()

    expect(store.items.length).toBe(1)
    expect(store.cursor).toBe('c1')
    expect(store.hasMore).toBe(true)
  })

  it('fetchNextPage appends items and clears cursor', async () => {
    const first = { data: [{ id: 'u1', email: 'a@b' }], nextCursor: 'c1' }
    const second = { data: [{ id: 'u2', email: 'c@d' }], nextCursor: undefined }
    const fetchStub = vi.fn()
    fetchStub.mockResolvedValueOnce(first).mockResolvedValueOnce(second)
    ;(globalThis as unknown as { $fetch?: (i: string) => Promise<unknown> }).$fetch = fetchStub as unknown as (i: string) => Promise<unknown>

    const store = useAdminUsers()
    await store.fetchFirstPage()
    expect(store.items.length).toBe(1)
    await store.fetchNextPage()
    expect(store.items.length).toBe(2)
    expect(store.cursor).toBeUndefined()
    expect(store.hasMore).toBe(false)
  })
})
