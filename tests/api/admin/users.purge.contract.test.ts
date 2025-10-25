import { describe, it, expect, vi } from 'vitest'

// Allow admin
vi.mock('../../../server/middleware/isAdmin', () => ({ default: vi.fn(async () => {}) }))

// Mock hardDeleteUser helper
vi.mock('../../../server/utils/appwrite-admin', () => ({ hardDeleteUser: vi.fn().mockResolvedValue(null) }))

import * as handlerModule from '../../../server/api/admin/users/[id]/purge.post'
import { hardDeleteUser } from '../../../server/utils/appwrite-admin'

const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/purge (contract)', () => {
  it('performs hard delete when env enabled and confirm provided (body)', async () => {
    process.env.ADMIN_ALLOW_HARD_DELETE = 'true'
    const event = { context: { params: { id: 'u-purge' } }, __body: { confirm: true } } as any

    // mock readBody used by handler: handler will read event.__body via test harness
    const res = await handler(event)

    expect(res).toMatchObject({ status: 200, success: true })
    expect((hardDeleteUser as any).mock.calls[0][0]).toBe('u-purge')
  })
})
