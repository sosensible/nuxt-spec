import { describe, it, expect, vi, beforeEach } from 'vitest'

/* eslint-disable import/first, @typescript-eslint/no-explicit-any */
// Mock the appwrite-admin helper used by the handler
vi.mock('../../../server/utils/appwrite-admin', () => ({
  changeUserRoles: vi.fn(),
}))

import { changeUserRoles as mockedChangeUserRoles } from '../../../server/utils/appwrite-admin'
import { changeRolesHandler } from '../../../server/api/admin/users/[id]/roles.post'

describe('changeRolesHandler (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('calls helper and returns success', async () => {
    ;(mockedChangeUserRoles as unknown as { mockResolvedValue: (v: unknown) => void }).mockResolvedValue(null)

    const res = await changeRolesHandler('u-1', ['admin', 'editor'])
    expect(res).toMatchObject({ success: true })
    const calls = (mockedChangeUserRoles as unknown as { mock: { calls: Array<unknown> } }).mock.calls as Array<any>
    expect(calls[0][0]).toBe('u-1')
    expect(calls[0][1]).toMatchObject(['admin', 'editor'])
  })

  it('throws 400 when userId is missing or invalid', async () => {
    await expect(changeRolesHandler('', ['admin'] as any)).rejects.toMatchObject({ statusCode: 400 })
    await expect(changeRolesHandler('   ' as any, ['admin'] as any)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('throws 400 when roles is not an array', async () => {
    await expect(changeRolesHandler('u-1', null as any)).rejects.toMatchObject({ statusCode: 400 })
    await expect(changeRolesHandler('u-1', 'admin' as any)).rejects.toMatchObject({ statusCode: 400 })
  })
})
