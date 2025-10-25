import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the appwrite-admin helper
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn(),
}))

import { revokeAllSessionsForUser } from '../../../server/utils/appwrite-admin'
import { revokeSessionsHandler } from '../../../server/api/admin/users/[id]/revoke-sessions.post'

describe('POST /api/admin/users/:id/revoke-sessions', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('calls revokeAllSessionsForUser and returns success', async () => {
    ;(revokeAllSessionsForUser as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(null)

    const res = await revokeSessionsHandler('u-123')

    expect((revokeAllSessionsForUser as unknown as { mock: { calls: Array<unknown> } }).mock.calls[0][0]).toBe('u-123')
    expect(res).toMatchObject({ success: true })
  })
})
