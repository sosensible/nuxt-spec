/**
 * GET /api/admin/users/:id
 *
 * Returns a detailed view of a user including Appwrite metadata and a
 * best-effort list of teams the user belongs to (if Teams service is available).
 * Requires admin authentication.
 */

import { createAppwriteClient, createUsersService, createTeamsService } from '../../../utils/appwrite'
import { requireAdminRole } from '../../../utils/adminAuth'
import { logError, createLogContext } from '../../../utils/logger'
import type { UserRecord, ApiError, UserDetailResponse, TeamRecord } from '~/types/admin'

export default defineEventHandler(async (event): Promise<UserDetailResponse | ApiError> => {
  try {
    const operatorId = await requireAdminRole(event)
  const _logContext = createLogContext(event, operatorId)

    const userId = getRouterParam(event, 'id')
    if (!userId) {
      throw createError({ statusCode: 400, message: 'User ID is required' })
    }

    const client = createAppwriteClient()
    const users = createUsersService(client)

    // Fetch the user from Appwrite
    const appwriteUser = await users.get(userId)

    const userRecord: UserRecord = {
      id: appwriteUser.$id,
      email: appwriteUser.email,
      name: appwriteUser.name,
      status: appwriteUser.status ? 'active' : 'inactive',
      createdAt: appwriteUser.$createdAt,
      emailVerified: appwriteUser.emailVerification,
      roles: appwriteUser.labels || [],
      customAttributes: appwriteUser.prefs || {},
    }

    // Attempt to resolve teams (best-effort). Not all Appwrite projects use teams.
    const teams: TeamRecord[] = []
    try {
      const teamsService = createTeamsService(client)

      // List all teams in the project and check memberships for the user.
      // This is potentially expensive in projects with many teams, but
      // it's acceptable for an admin detail view and is wrapped in try/catch.
      // We handle a few possible response shapes returned by different SDK versions.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawList: any = await teamsService.list()

      const allTeams = rawList?.teams ?? rawList?.items ?? rawList ?? []

      for (const t of allTeams) {
        try {
          // List memberships for the team
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const rawMemberships: any = await teamsService.listMemberships(t.$id)
          const members = rawMemberships?.memberships ?? rawMemberships?.items ?? rawMemberships ?? []

          type Membership = Record<string, unknown>
          const membership = (members as Membership[]).find((m) => {
            const userIdField = (m as Membership)['userId'] as string | undefined
            const userIdUnderscore = (m as Membership)['user_id'] as string | undefined
            const userField = (m as Membership)['user'] as string | undefined
            const idField = (m as Membership)['$id'] as string | undefined
            return userIdField === userId || userIdUnderscore === userId || userField === userId || idField === userId
          })

          if (membership) {
            teams.push({
              id: t.$id,
              name: t.name,
              description: t.description,
              roles: membership.roles ?? membership.role ?? undefined,
            })
          }
        } catch {
          // ignore per-team errors and continue
          continue
        }
      }
    } catch {
      // If the Teams service isn't enabled or the SDK call fails, just return no teams.
      // We don't want the entire request to fail because teams couldn't be resolved.
    }

    return {
      item: userRecord,
      teams,
      raw: appwriteUser as Record<string, unknown>,
    }
  } catch (error: unknown) {
    logError('Failed to load user detail', error, createLogContext(event))

    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    const apiError: ApiError = {
      error: {
        code: 'appwrite_error',
        message: error instanceof Error ? error.message : 'Failed to load user details',
      },
    }

    setResponseStatus(event, 400)
    return apiError
  }
})
