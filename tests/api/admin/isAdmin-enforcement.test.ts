import { describe, it, expect, vi } from 'vitest'

// Mock the isAdmin middleware to throw a 403 error before importing the route
vi.mock('../../../server/middleware/isAdmin', () => ({
  default: vi.fn(async () => {
    const { createError } = require('h3')
    throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
  }),
}))

// Import the admin users route AFTER mocking isAdmin so the mock is used
import * as adminApi from '../../../server/api/admin/users/index.get'

describe('GET /api/admin/users - admin enforcement', () => {
  it('should return 403 when isAdmin denies access', async () => {
    const handler = (adminApi as any).default
    await expect(handler({} as any)).rejects.toMatchObject({ statusCode: 403 })
  })
})
