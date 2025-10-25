import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock appwrite helper
vi.mock('../../../server/utils/appwrite-admin', () => ({
  revokeAllSessionsForUser: vi.fn().mockResolvedValue(null),
}))

// Mock h3 readBody and defineEventHandler used by the handler module
vi.mock('h3', () => ({
  defineEventHandler: (fn: any) => fn,
  readBody: async (event: any) => event.__body,
  createError: (opts: any) => {
    const e = new Error(opts.statusMessage || '')
    ;(e as any).statusCode = opts.statusCode
    return e
  },
}))

import * as handlerModule from '../../../server/api/admin/users/[id]/revoke-sessions.post'
const handler = (handlerModule as any).default
import { revokeAllSessionsForUser } from '../../../server/utils/appwrite-admin'

describe('POST /api/admin/users/:id/revoke-sessions (body param)', () => {
  it('accepts userId in body and returns 200', async () => {
    const event = { __body: { userId: 'u-999' }, context: {} } as any
    const res = await handler(event)

    expect(res).toMatchObject({ status: 200, success: true })
    expect((revokeAllSessionsForUser as any).mock.calls[0][0]).toBe('u-999')
  })
})
