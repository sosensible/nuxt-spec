import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the appwrite-admin helper
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn(),
}))

import { revokeAllSessionsForUser } from '../../../server/utils/appwrite-admin'
import { revokeSessionsHandler } from '../../../server/api/admin/users/[id]/revoke-sessions.post'

describe('revokeSessionsHandler validation', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('throws 400 when userId is empty', async () => {
    await expect(revokeSessionsHandler('')).rejects.toMatchObject({ statusCode: 400 })
    await expect(revokeSessionsHandler('   ')).rejects.toMatchObject({ statusCode: 400 })
  })

  it('propagates errors from revokeAllSessionsForUser', async () => {
    ;(revokeAllSessionsForUser as any).mockRejectedValue(new Error('boom'))
    await expect(revokeSessionsHandler('u-1')).rejects.toThrow('boom')
  })
})
