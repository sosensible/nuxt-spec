/**
 * DELETE /api/admin/users/:id
 * 
 * Hard-delete user from Appwrite (MVP implementation)
 * Requires admin authentication and explicit confirmation
 * 
 * ⚠️ WARNING: This is a permanent, irreversible operation
 * Future: Consider soft-delete or retention policy
 */

import { createAppwriteClient, createUsersService } from '../../../utils/appwrite'
import { requireAdminRole } from '../../../utils/adminAuth'
import { logAdminAction, logError, createLogContext } from '../../../utils/logger'
import type { ApiError } from '~/types/admin'

export default defineEventHandler(async (event): Promise<void | ApiError> => {
  try {
    // Authenticate and authorize
    const operatorId = await requireAdminRole(event)
    const logContext = createLogContext(event, operatorId)

    // Get user ID from route params
    const userId = getRouterParam(event, 'id')
    
    if (!userId) {
      throw createError({
        statusCode: 400,
        message: 'User ID is required',
      })
    }

    // Log admin action (CRITICAL: audit trail for delete operations)
    logAdminAction('delete_user', operatorId, logContext.requestId!, {
      targetUserId: userId,
      operation: 'hard_delete',
      irreversible: true,
    })

    // Create Appwrite client with admin privileges
    const client = createAppwriteClient()
    const users = createUsersService(client)

    // Delete user in Appwrite (hard-delete)
    await users.delete(userId)

    // Return 204 No Content on success
    setResponseStatus(event, 204)
    return
  } catch (error: unknown) {
    // Log error (IMPORTANT for audit trail)
    logError('Failed to delete user', error, createLogContext(event))

    // Handle errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // Re-throw H3 errors (auth errors from requireAdminRole)
      throw error
    }

    // Return API error format
    const apiError: ApiError = {
      error: {
        code: 'appwrite_error',
        message: error instanceof Error ? error.message : 'Failed to delete user from Appwrite',
      },
    }

    setResponseStatus(event, 400) // Bad Request - delete failed
    return apiError
  }
})
