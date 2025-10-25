/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import * as adminApi from '../../../server/api/admin/users/index.get'

// Mock the appwrite-admin module used by the handler
vi.mock('../../../server/utils/appwrite-admin', () => ({
  listUsers: vi.fn(),
}))

import { listUsers as mockedListUsers } from '../../../server/utils/appwrite-admin'

describe('GET /api/admin/users - cursor edge cases', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('returns nextCursor at exact page boundary and none at final page', async () => {
    // First page: limit 2, returns two users and a nextCursor
  // Use a valid base64-encoded numeric offset for the cursor token
  const nextOffset = '2'
  const nextCursor = Buffer.from(nextOffset, 'utf8').toString('base64')
  ;(mockedListUsers as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({ users: [{ id: 'u1' }, { id: 'u2' }], nextCursor })

  const first = await adminApi.listUsersHandler({ limit: 2 })
  expect(first.data).toHaveLength(2)
  expect(first.nextCursor).toBe(nextCursor)

  // Second (final) page: provide cursor, returns two users and no nextCursor
  ;(mockedListUsers as unknown as { mockResolvedValueOnce: (v: unknown) => void }).mockResolvedValueOnce({ users: [{ id: 'u3' }, { id: 'u4' }], nextCursor: undefined })

  const second = await adminApi.listUsersHandler({ limit: 2, cursor: nextCursor })
  expect(second.data).toHaveLength(2)
  expect(second.nextCursor).toBeUndefined()
  })

  it('returns no nextCursor when fewer than requested items are returned', async () => {
    ;(mockedListUsers as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({ users: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }], nextCursor: undefined })

    const res = await adminApi.listUsersHandler({ limit: 5 })
    expect(res.data).toHaveLength(3)
    expect(res.nextCursor).toBeUndefined()
  })

  it('accepts a large numeric cursor (base64-encoded) and delegates to helper', async () => {
    // Create a large offset cursor and ensure the handler validates it
    const largeOffset = '1000000'
    const cursor = Buffer.from(largeOffset, 'utf8').toString('base64')
    ;(mockedListUsers as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue({ users: [], nextCursor: undefined })

    const res = await adminApi.listUsersHandler({ limit: 10, cursor })
    expect(res.data).toHaveLength(0)
    expect(res.nextCursor).toBeUndefined()

    // ensure the underlying helper was called with the same cursor string
    const calls = (mockedListUsers as unknown as { mock: { calls: Array<unknown> } }).mock.calls as Array<any>
    expect(calls[0][0]).toMatchObject({ cursor })
  })
})
