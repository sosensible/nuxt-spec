/**
 * PATCH /api/admin/users/:id
 * 
 * Update user attributes in Appwrite
 * Requires admin authentication
 * 
 * Body: UpdateUserPayload
 * - name?: string
 * - email?: string
 * - customAttributes?: Record<string, unknown>
 */

import { createAppwriteClient, createUsersService } from '../../../utils/appwrite'
import { requireAdminRole } from '../../../utils/adminAuth'
import { logAdminAction, logError, createLogContext } from '../../../utils/logger'
import type { UserRecord, ApiError, UpdateUserPayload } from '~/types/admin'

export default defineEventHandler(async (event): Promise<{ item: UserRecord } | ApiError> => {
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

    // Parse and validate request body
    const body = await readBody<UpdateUserPayload>(event)
    
    // Validate payload - only allow whitelisted fields
    const allowedFields = ['name', 'email', 'customAttributes']
    const providedFields = Object.keys(body)
    const invalidFields = providedFields.filter(field => !allowedFields.includes(field))
    
    if (invalidFields.length > 0) {
      throw createError({
        statusCode: 400,
        message: `Invalid fields: ${invalidFields.join(', ')}. Allowed fields: ${allowedFields.join(', ')}`,
      })
    }

    // Validate email format if provided
    if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid email format',
      })
    }

    // Validate name length if provided
    if (body.name && (body.name.length < 1 || body.name.length > 128)) {
      throw createError({
        statusCode: 400,
        message: 'Name must be between 1 and 128 characters',
      })
    }

    // Log admin action
    logAdminAction('update_user', operatorId, logContext.requestId!, {
      targetUserId: userId,
      updates: Object.keys(body),
    })

    // Create Appwrite client with admin privileges
    const client = createAppwriteClient()
    const users = createUsersService(client)

    // Update user in Appwrite
    // Note: Appwrite has separate methods for different updates
    let updatedUser

    // Update name if provided
    if (body.name) {
      updatedUser = await users.updateName(userId, body.name)
    }

    // Update email if provided
    if (body.email) {
      updatedUser = await users.updateEmail(userId, body.email)
    }

    // Update preferences (custom attributes) if provided
    if (body.customAttributes) {
      updatedUser = await users.updatePrefs(userId, body.customAttributes)
    }

    // If no updates were made, fetch the current user
    if (!updatedUser) {
      updatedUser = await users.get(userId)
    }

    // Map Appwrite user format to our UserRecord format
    const userRecord: UserRecord = {
      id: updatedUser.$id,
      email: updatedUser.email,
      name: updatedUser.name,
      status: updatedUser.status ? 'active' : 'inactive',
      createdAt: updatedUser.$createdAt,
      emailVerified: updatedUser.emailVerification,
      roles: updatedUser.labels || [],
      customAttributes: updatedUser.prefs || {},
    }

    return { item: userRecord }
  } catch (error: unknown) {
    // Log error
    logError('Failed to update user', error, createLogContext(event))

    // Handle errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // Re-throw H3 errors (auth and validation errors)
      throw error
    }

    // Return API error format
    const apiError: ApiError = {
      error: {
        code: 'appwrite_error',
        message: error instanceof Error ? error.message : 'Failed to update user in Appwrite',
      },
    }

    setResponseStatus(event, 400) // Bad Request - update failed
    return apiError
  }
})
