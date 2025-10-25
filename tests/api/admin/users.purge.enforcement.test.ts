import { describe, it, expect, vi } from 'vitest'

// Mock isAdmin to deny
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {
    const { createError } = require('h3')
    throw createError({ statusCode: 403, statusMessage: 'Admin required' })
  }),
}))

import * as handlerModule from '../../../server/api/admin/users/[id]/purge.post'
const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/purge - enforcement', () => {
  it('returns 403 when isAdmin denies access', async () => {
    const event = { context: { params: { id: 'u-purge' } }, __body: { confirm: true } } as any
    await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
  })
})
