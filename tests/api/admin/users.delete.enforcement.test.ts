import { describe, it, expect, vi } from 'vitest'

import { createError } from 'h3'

// Mock isAdmin to deny
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }),
}))

import * as handlerModule from '../../../server/api/admin/users/[id]/delete'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (handlerModule as any).default

describe('DELETE /api/admin/users/:id - enforcement', () => {
  it('returns 403 when isAdmin denies', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = { context: { params: { id: 'u-del' } } } as any
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
  })
})
