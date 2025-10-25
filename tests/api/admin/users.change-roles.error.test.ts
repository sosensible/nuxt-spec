import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock appwrite helper to throw
vi.mock('../../../server/utils/appwrite-admin', () => ({
  changeUserRoles: vi.fn().mockRejectedValue(new Error('boom-roles')),
}))

/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
import * as handlerModule from '../../../server/api/admin/users/[id]/roles.post'

const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/roles - error', () => {
  it('propagates helper errors', async () => {
    const event = { context: { params: { id: 'u-roles' } }, node: { req: { json: async () => ({ roles: ['admin'] }) } } } as any
    await expect(handler(event)).rejects.toThrow('boom-roles')
  })
})
