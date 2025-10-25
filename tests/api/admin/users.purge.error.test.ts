import { describe, it, expect, vi } from 'vitest'

// Allow admin
vi.mock('../../../server/middleware/isAdmin', () => ({ default: vi.fn(async () => {}) }))

// Mock hardDeleteUser to throw
vi.mock('../../../server/utils/appwrite-admin', () => ({ hardDeleteUser: vi.fn().mockRejectedValue(new Error('boom')) }))

import * as handlerModule from '../../../server/api/admin/users/[id]/purge.post'
const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/purge - error', () => {
  it('maps helper errors to 502', async () => {
    process.env.ADMIN_ALLOW_HARD_DELETE = 'true'
    const event = { context: { params: { id: 'u-purge' } }, __body: { confirm: true } } as any
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 502 })
  })
})
