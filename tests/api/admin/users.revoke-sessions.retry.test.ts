import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the appwrite-admin helper; set behavior in test
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn(),
}))

import { revokeSessionsHandler } from '../../../server/api/admin/users/[id]/revoke-sessions.post'
import { revokeAllSessionsForUser } from '../../../server/utils/appwrite-admin'

describe('revokeSessionsHandler retry behavior', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('retries on transient errors then succeeds', async () => {
    ;(revokeAllSessionsForUser as any)
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue(null)

    const res = await revokeSessionsHandler('u-123')

    expect((revokeAllSessionsForUser as any).mock.calls.length).toBe(3)
    expect(res).toMatchObject({ success: true })
  })
})
