import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock appwrite helper
vi.mock('../../../server/utils/appwrite-admin', () => ({
  deleteUser: vi.fn().mockResolvedValue(null),
}))

import { deleteUser as deleteUserHelper } from '../../../server/utils/appwrite-admin'
import * as handlerModule from '../../../server/api/admin/users/[id]/delete'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (handlerModule as any).default

describe('DELETE /api/admin/users/:id (contract)', () => {
  it('deletes user and returns success for admin', async () => {
    const event = { context: { params: { id: 'u-del' } } } as any
    const res = await handler(event)

    expect(res).toMatchObject({ status: 200, success: true })
    expect((deleteUserHelper as any).mock.calls[0][0]).toBe('u-del')
  })
})
