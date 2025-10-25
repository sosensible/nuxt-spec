import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock appwrite helper
vi.mock('../../../server/utils/appwrite-admin', () => ({
  changeUserRoles: vi.fn().mockResolvedValue(null),
}))

/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
import * as handlerModule from '../../../server/api/admin/users/[id]/roles.post'
import { changeUserRoles as changeUserRolesHelper } from '../../../server/utils/appwrite-admin'

const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/roles (contract)', () => {
  it('changes roles and returns success for admin', async () => {
    const event = { context: { params: { id: 'u-roles' } }, node: { req: { json: async () => ({ roles: ['admin'] }) } } } as any
    const res = await handler(event)

    expect(res).toMatchObject({ status: 200, success: true })
    expect((changeUserRolesHelper as any).mock.calls[0][0]).toBe('u-roles')
    expect((changeUserRolesHelper as any).mock.calls[0][1]).toMatchObject(['admin'])
  })
})
