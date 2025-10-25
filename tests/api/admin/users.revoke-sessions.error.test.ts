import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock the appwrite helper to throw
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn().mockRejectedValue(new Error('boom')),
}))

import * as handlerModule from '../../../server/api/admin/users/[id]/revoke-sessions.post'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/revoke-sessions - error handling', () => {
  it('propagates helper errors as server errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = { context: { params: { id: 'u-123' } } } as any
    await expect(handler(event)).rejects.toThrow('boom')
  })
})
