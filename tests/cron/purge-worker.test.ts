/* eslint-disable import/first */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Ensure the appwrite-admin module is mocked before the purge-worker module imports it.
vi.mock('../../../server/utils/appwrite-admin', () => ({
  listUsers: vi.fn(),
  hardDeleteUser: vi.fn(),
}))

// TS cannot always resolve relative test-time modules in the editor/linter; ignore here
// @ts-expect-error mocked test import (module is provided by project runtime / mocked)
import { purgeExpiredDeletedUsers } from '../../../server/utils/purge-worker'
// @ts-expect-error mocked test import (module is provided by project runtime / mocked)
import { listUsers, hardDeleteUser } from '../../../server/utils/appwrite-admin'

beforeEach(() => {
  ;(listUsers as unknown as ReturnType<typeof vi.fn>)?.mockReset?.()
  ;(hardDeleteUser as unknown as ReturnType<typeof vi.fn>)?.mockReset?.()
})

describe('purgeExpiredDeletedUsers', () => {
  it('deletes users whose retention has expired and skips others', async () => {
    const now = new Date('2025-10-24T12:00:00.000Z')
    const users = [
      { $id: 'u1', prefs: { retentionExpiresAt: '2025-10-23T00:00:00.000Z' } }, // expired
      { $id: 'u2', prefs: { retentionExpiresAt: '2025-10-25T00:00:00.000Z' } }, // not yet
      { $id: 'u3', prefs: { } }, // no retention
    ]

  ;(listUsers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: users })
  ;(hardDeleteUser as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(undefined)

  const res = await purgeExpiredDeletedUsers({ appwriteAdmin: { listUsers: listUsers as unknown as typeof listUsers, hardDeleteUser: hardDeleteUser as unknown as typeof hardDeleteUser }, now })

  expect(res.attempted).toBe(3)
  expect(res.deleted).toEqual(['u1'])
  expect(res.errors).toHaveLength(0)
  expect((hardDeleteUser as unknown as ReturnType<typeof vi.fn>).mock.calls.length).toBe(1)
  expect((hardDeleteUser as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]).toBe('u1')
  })

  it('continues when a deletion fails and records error', async () => {
    const now = new Date('2025-10-24T12:00:00.000Z')
    const users = [
      { $id: 'u1', prefs: { retentionExpiresAt: '2025-10-23T00:00:00.000Z' } }, // expired
      { $id: 'u2', prefs: { retentionExpiresAt: '2025-10-23T00:00:00.000Z' } }, // expired
    ]

    ;(listUsers as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({ data: users })
    ;(hardDeleteUser as unknown as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('boom'))

  const res = await purgeExpiredDeletedUsers({ appwriteAdmin: { listUsers: listUsers as unknown as typeof listUsers, hardDeleteUser: hardDeleteUser as unknown as typeof hardDeleteUser }, now })

    expect(res.attempted).toBe(2)
    expect(res.deleted).toEqual(['u1'])
    expect(res.errors).toHaveLength(1)
    expect(res.errors[0].userId).toBe('u2')
    expect(res.errors[0].error).toMatch(/boom/)
  })
})
