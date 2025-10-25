import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as adminApi from '../../../server/api/admin/users/index.get'

// Mock the appwrite-admin module used by the handler
vi.mock('../../../server/utils/appwrite-admin', () => ({
  listUsers: vi.fn(),
}))

import { listUsers as mockedListUsers } from '../../../server/utils/appwrite-admin'

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns paginated users and nextCursor', async () => {
  ;(mockedListUsers as unknown as { mockResolvedValue: (v: { users?: unknown[]; nextCursor?: string }) => void }).mockResolvedValue({ users: [{ id: 'u1', email: 'a@b' }], nextCursor: 'c1' })

    const result = await adminApi.listUsersHandler({ limit: 10 })

    expect(result.data).toHaveLength(1)
    expect(result.nextCursor).toBe('c1')
    // ensure underlying helper was called with expected params
  const calls = (mockedListUsers as unknown as { mock: { calls: Array<unknown> } }).mock.calls as Array<Record<string, unknown>>
  expect(calls[0][0]).toMatchObject({ limit: 10 })
  })
})
