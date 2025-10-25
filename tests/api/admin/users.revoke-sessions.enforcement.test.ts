import { describe, it, expect, vi } from 'vitest'

import { createError } from 'h3'

// Mock isAdmin to deny access
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }),
}))

// Import handler after mocking
import * as handlerModule from '../../../server/api/admin/users/[id]/revoke-sessions.post'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (handlerModule as any).default

describe('POST /api/admin/users/:id/revoke-sessions - enforcement', () => {
  it('returns 403 when isAdmin denies access', async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const event = { context: { params: { id: 'u-123' } } } as any
  await expect(handler(event)).rejects.toMatchObject({ statusCode: 403 })
  })
})
