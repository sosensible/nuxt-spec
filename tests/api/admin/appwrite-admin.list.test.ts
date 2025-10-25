import { describe, it, expect, vi, beforeEach } from 'vitest'

import * as adminHelper from '../../../server/utils/appwrite-admin'

describe('appwrite-admin.listUsers - cursor handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('handles malformed cursor gracefully (falls back to offset 0)', async () => {
    // Provide a stubbed users service and inject it into listUsers
    const mockUsersService = {
      list: async (_queries?: unknown[]) => ({ users: [{ $id: 'u1', email: 'a@b', name: 'U' }], total: 1 }),
    } as unknown as { list: (q?: unknown[]) => Promise<{ users?: unknown[]; total?: number }> }

    const result = await adminHelper.listUsers({ limit: 10, cursor: 'not-a-base64-token', q: undefined }, mockUsersService)
    // ensure users were returned
    expect((result as any).users).toHaveLength(1)
    // since total==1 and returned < limit, nextCursor should be undefined
    expect((result as any).nextCursor).toBeUndefined()
  })
})
