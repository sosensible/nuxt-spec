import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAdminUsers } from '~/composables/admin/useAdminUsers'

const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

describe('useAdminUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads users and updates state', async () => {
    const mockUser = { id: 'u1', email: 'a@example.com', name: 'A' }
    mockFetch.mockResolvedValue({ data: [mockUser], page: 1, perPage: 25, total: 1 })

    const { users, loading, page, perPage, total, load, error } = useAdminUsers()

    expect(users.value).toEqual([])
    const p = load(1, '')
    // wait for promise
    await p

    expect(mockFetch).toHaveBeenCalled()
    expect(users.value).toEqual([mockUser])
    expect(page.value).toBe(1)
    expect(perPage.value).toBe(25)
    expect(total.value).toBe(1)
    expect(error.value).toBeNull()
    expect(loading.value).toBe(false)
  })

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network'))
    const { users, loading, load, error } = useAdminUsers()

    await load(1, '')

    expect(users.value).toEqual([])
    expect(error.value).toBeDefined()
    expect(loading.value).toBe(false)
  })
})
