import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock the appwrite-admin helper
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn().mockResolvedValue(null),
}))

import { revokeAllSessionsForUser } from '../../../server/utils/appwrite-admin'
import * as handlerModule from '../../../server/api/admin/users/[id]/revoke-sessions.post'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/revoke-sessions (contract)', () => {
  it('returns 200 and success when called by admin with route param', async () => {
    const event = { context: { params: { id: 'u-123' } } } as any
    const res = await handler(event)

    expect(res).toMatchObject({ status: 200, success: true })
    expect((revokeAllSessionsForUser as any).mock.calls[0][0]).toBe('u-123')
  })
})
