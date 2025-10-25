import { describe, it, expect, vi } from 'vitest'

import { createError } from 'h3'

// Mock isAdmin to deny access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }),
}))

/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
import * as handlerModule from '../../../server/api/admin/users/[id]/roles.post'

const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/roles - enforcement', () => {
  it('returns 403 when isAdmin denies access', async () => {
    const event = { context: { params: { id: 'u-roles' } } } as any
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
  })
})
