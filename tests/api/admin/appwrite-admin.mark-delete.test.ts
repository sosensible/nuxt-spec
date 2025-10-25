import { describe, it, expect, vi } from 'vitest'

import { markUserDeleted } from '../../../server/utils/appwrite-admin'

describe('markUserDeleted', () => {
  it('merges prefs and calls updatePrefs with deletion metadata', async () => {
    const fakeExisting = { prefs: { theme: 'dark' } }
    const updatePrefs = vi.fn().mockResolvedValue(null)
    const usersService = {
      get: vi.fn().mockResolvedValue(fakeExisting),
      updatePrefs,
    }

    await markUserDeleted('u-1', 7, usersService as any)

    expect((usersService.get as any).mock.calls[0][0]).toBe('u-1')
    expect(updatePrefs.mock.calls[0][0]).toBe('u-1')
    const prefsArg = updatePrefs.mock.calls[0][1]
    expect(prefsArg.theme).toBe('dark')
    expect(prefsArg.deletedByAdmin).toBe(true)
    expect(typeof prefsArg.deletedAt).toBe('string')
    expect(typeof prefsArg.retentionExpiresAt).toBe('string')
  })

  it('throws when service cannot persist prefs', async () => {
    const usersService = {
      get: vi.fn().mockResolvedValue({}),
    }

    await expect(markUserDeleted('u-2', 10, usersService as any)).rejects.toThrow()
  })
})
