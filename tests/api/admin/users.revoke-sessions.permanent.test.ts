import { describe, it, expect, vi } from 'vitest'

// Mock the appwrite helper to throw a permanent error
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn().mockRejectedValue(new Error('boom')),
}))

import { revokeSessionsHandler } from '../../../server/api/admin/users/[id]/revoke-sessions.post'
import { createError } from 'h3'

describe('revokeSessionsHandler permanent failure mapping', () => {
  it('maps permanent helper failures to 502', async () => {
    await expect(revokeSessionsHandler('u-999')).rejects.toMatchObject({ statusCode: 502 })
  })
})
