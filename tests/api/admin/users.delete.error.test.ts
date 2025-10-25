import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to allow access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {}),
}))

// Mock appwrite helper to throw
vi.mock('../../../server/utils/appwrite-admin', () => ({
  deleteUser: vi.fn().mockRejectedValue(new Error('boom')),
}))

import * as handlerModule from '../../../server/api/admin/users/[id]/delete'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (handlerModule as any).default

describe('DELETE /api/admin/users/:id - error', () => {
  it('propagates helper errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = { context: { params: { id: 'u-del' } } } as any
    await expect(handler(event)).rejects.toThrow('boom')
  })
})
