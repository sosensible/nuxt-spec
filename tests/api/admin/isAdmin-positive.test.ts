import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock getSessionFromCookie to return a session secret
vi.mock('../../../server/utils/auth', () => ({
  getSessionFromCookie: () => 'session-secret',
}))

// Mock Appwrite session client and account service used by isAdmin
vi.mock('../../../server/utils/appwrite', () => ({
  createAppwriteSessionClient: (_sessionSecret: string) => ({ /* mock client */ }),
  createAccountService: (_client: unknown) => ({
    get: async () => ({ $id: 'u-admin', email: 'admin@example.com', prefs: { isAdmin: true } }),
  }),
}))

// Mock the appwrite-admin listUsers helper so handler can return data

vi.mock('../../../server/utils/appwrite-admin', () => ({
  listUsers: vi.fn().mockResolvedValue({ users: [{ id: 'u-admin', email: 'admin@example.com' }], nextCursor: undefined }),
}))

import * as adminApi from '../../../server/api/admin/users/index.get'

describe('GET /api/admin/users - positive admin session', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ADMIN_ALLOWLIST = 'u-admin'
  })

  it('allows access when user session matches allowlist', async () => {
    const result = await adminApi.listUsersHandler({ limit: 10 })
    expect(result.data).toHaveLength(1)
    expect(result.nextCursor).toBeUndefined()
  })
})
