import { beforeEach, describe, expect, it, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdminUserDetail } from '../../../app/stores/adminUserDetail'

describe('adminUserDetail store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('load populates user and sessions', async () => {
    const userResp = { id: 'u1', email: 'a@b' }
    const sessionsResp = [{ id: 's1', userId: 'u1' }]
    const fetchStub = vi.fn()
    fetchStub.mockResolvedValueOnce(userResp).mockResolvedValueOnce(sessionsResp)
    ;(globalThis as unknown as { $fetch?: (i: string) => Promise<unknown> }).$fetch = fetchStub as unknown as (i: string) => Promise<unknown>

    const store = useAdminUserDetail()
    await store.load('u1')

    expect(store.user).not.toBeNull()
    expect(store.user?.id).toBe('u1')
    expect(store.sessions.length).toBe(1)
  })
})
