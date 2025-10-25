import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as adminApi from '../../../server/api/admin/users/index.get'

// Mock the appwrite-admin module used by the handler
vi.mock('../../../server/utils/appwrite-admin', () => ({
  listUsers: vi.fn(),
}))

import { listUsers as mockedListUsers } from '../../../server/utils/appwrite-admin'

describe('GET /api/admin/users - invalid cursor handling', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('rejects malformed cursor with 400', async () => {
    ;(mockedListUsers as unknown as { mockResolvedValue: (v: { users?: unknown[]; nextCursor?: string }) => void }).mockResolvedValue({ users: [{ id: 'u1', email: 'a@b' }], nextCursor: undefined })

    await expect(adminApi.listUsersHandler({ limit: 10, cursor: 'not-base64!', q: undefined })).rejects.toMatchObject({ statusCode: 400 })
  })
})
