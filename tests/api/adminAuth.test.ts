/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { H3Event } from 'h3'

// Mock getSessionFromCookie to control session presence
vi.mock('../../server/utils/auth', () => ({
  getSessionFromCookie: vi.fn(),
}))

// Mock Appwrite utilities used by requireAdminRole
vi.mock('../../server/utils/appwrite', () => ({
  createAppwriteSessionClient: vi.fn(),
  createAccountService: vi.fn(),
  createAppwriteClient: vi.fn(),
  createTeamsService: vi.fn(),
}))

describe('requireAdminRole', () => {
  let mockedAuth: Record<string, unknown>
  let mockedAppwrite: Record<string, unknown>

  beforeEach(() => {
    vi.resetAllMocks()
    // Ensure no APPWRITE_ADMIN_TEAM_ID leakage between tests
    delete process.env.APPWRITE_ADMIN_TEAM_ID
    // Import the mocked modules so we can access their mock functions
    // (imports are hoisted by vitest mocks)
    return Promise.all([
      import('../../server/utils/auth').then(m => { mockedAuth = m as unknown as Record<string, unknown> }),
      import('../../server/utils/appwrite').then(m => { mockedAppwrite = m as unknown as Record<string, unknown> }),
    ])
  })

  afterEach(() => {
    delete process.env.APPWRITE_ADMIN_TEAM_ID
  })

  it('returns user id when user is member of configured admin team', async () => {
    process.env.APPWRITE_ADMIN_TEAM_ID = 'team_admin'

  // Mock session cookie present
  ;(mockedAuth as any).getSessionFromCookie.mockReturnValue('sess_secret')

    // Mock account.get to return user id
  const mockAccount = { get: vi.fn(async () => ({ $id: 'user123' })) }
  ;(mockedAppwrite as any).createAppwriteSessionClient.mockReturnValue({} as unknown as Record<string, unknown>)
  ;(mockedAppwrite as any).createAccountService.mockReturnValue(mockAccount as unknown as Record<string, unknown>)

    // Mock teams service to return membership including the user
  const mockTeams = { listMemberships: vi.fn(async () => ({ memberships: [{ userId: 'user123' }] })) }
  ;(mockedAppwrite as any).createAppwriteClient.mockReturnValue({} as unknown as Record<string, unknown>)
  ;(mockedAppwrite as any).createTeamsService.mockReturnValue(mockTeams as unknown as Record<string, unknown>)

  const event = {} as H3Event

  const { requireAdminRole } = await import('../../server/utils/adminAuth')
    const userId = await requireAdminRole(event)

    expect(userId).toBe('user123')
    expect(mockAccount.get).toHaveBeenCalled()
    expect(mockTeams.listMemberships).toHaveBeenCalledWith('team_admin')
  })

  it('throws 403 when user is not a member and has no admin label', async () => {
    process.env.APPWRITE_ADMIN_TEAM_ID = 'team_admin'

  ;(mockedAuth as any).getSessionFromCookie.mockReturnValue('sess_secret')

  const mockAccount = { get: vi.fn(async () => ({ $id: 'user456', labels: [] })) }
  ;(mockedAppwrite as any).createAppwriteSessionClient.mockReturnValue({} as unknown as Record<string, unknown>)
  ;(mockedAppwrite as any).createAccountService.mockReturnValue(mockAccount as unknown as Record<string, unknown>)

  const mockTeams = { listMemberships: vi.fn(async () => ({ memberships: [] })) }
  ;(mockedAppwrite as any).createAppwriteClient.mockReturnValue({} as unknown as Record<string, unknown>)
  ;(mockedAppwrite as any).createTeamsService.mockReturnValue(mockTeams as unknown as Record<string, unknown>)

  const event = {} as H3Event

  const { requireAdminRole } = await import('../../server/utils/adminAuth')
    await expect(requireAdminRole(event)).rejects.toMatchObject({ statusCode: 403 })
    expect(mockAccount.get).toHaveBeenCalled()
    expect(mockTeams.listMemberships).toHaveBeenCalledWith('team_admin')
  })

  it('falls back to label check when APPWRITE_ADMIN_TEAM_ID is not set', async () => {
    // No APPWRITE_ADMIN_TEAM_ID
  ;(mockedAuth as any).getSessionFromCookie.mockReturnValue('sess_secret')

  const mockAccount = { get: vi.fn(async () => ({ $id: 'user789', labels: ['admin'] })) }
  ;(mockedAppwrite as any).createAppwriteSessionClient.mockReturnValue({} as unknown as Record<string, unknown>)
  ;(mockedAppwrite as any).createAccountService.mockReturnValue(mockAccount as unknown as Record<string, unknown>)

  const event = {} as H3Event

  const { requireAdminRole } = await import('../../server/utils/adminAuth')
    const userId = await requireAdminRole(event)

    expect(userId).toBe('user789')
  })

  it('throws 401 when session cookie missing', async () => {
  ;(mockedAuth as any).getSessionFromCookie.mockReturnValue(undefined)

  const event = {} as H3Event

  const { requireAdminRole } = await import('../../server/utils/adminAuth')
    await expect(requireAdminRole(event)).rejects.toMatchObject({ statusCode: 401 })
  })
})
