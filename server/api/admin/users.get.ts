/**
 * GET /api/admin/users
 * 
 * List users with pagination, filtering, and search
 * Requires admin authentication
 * 
 * Query parameters:
 * - pageSize: number (default 25, allowed: 10, 25, 50)
 * - cursor: string (optional, for cursor-based pagination)
 * - offset: number (optional, fallback for offset-based pagination)
 * - q: string (optional, search query for email/name)
 */

import { createAppwriteClient, createUsersService } from '../../utils/appwrite'
import { requireAdminRole } from '../../utils/adminAuth'
import { logAdminAction, logError, createLogContext } from '../../utils/logger'
import type { PagedResponse, UserRecord, ApiError } from '~/types/admin'
import { Query } from 'node-appwrite'

export default defineEventHandler(async (event): Promise<PagedResponse<UserRecord> | ApiError> => {
  try {
    // Authenticate and authorize
    const operatorId = await requireAdminRole(event)
    const logContext = createLogContext(event, operatorId)

    // Parse query parameters
    const query = getQuery(event)
    const pageSize = Math.min(Number(query.pageSize) || 25, 50)
    const cursor = query.cursor as string | undefined
    const offset = query.offset ? Number(query.offset) : undefined
    const searchQuery = query.q as string | undefined

    // Log admin action
    logAdminAction('list_users', operatorId, logContext.requestId!, {
      pageSize,
      cursor,
      offset,
      searchQuery,
    })

    // Create Appwrite client with admin privileges
    const client = createAppwriteClient()
    const users = createUsersService(client)

    // Build Appwrite queries
    const queries: string[] = [Query.limit(pageSize)]
    
    // Add cursor or offset for pagination
    if (cursor) {
      queries.push(Query.cursorAfter(cursor))
    } else if (offset) {
      queries.push(Query.offset(offset))
    }

    // Fetch users from Appwrite
    // Note: Appwrite Users API supports a 'search' parameter directly (not via Query.search)
    // The search parameter searches across name, email, and phone fields
    const result = searchQuery 
      ? await users.list(queries, searchQuery)
      : await users.list(queries)

    // Map Appwrite user format to our UserRecord format
    const items: UserRecord[] = result.users.map(user => ({
      id: user.$id,
      email: user.email,
      name: user.name,
      status: user.status ? 'active' : 'inactive', // Appwrite uses boolean status
      createdAt: user.$createdAt,
      emailVerified: user.emailVerification,
      roles: user.labels || [], // Use labels as roles for MVP
      customAttributes: user.prefs || {}, // User preferences as custom attributes
    }))

    // Build response
    const response: PagedResponse<UserRecord> = {
      items,
      cursor: result.users.length === pageSize ? result.users[result.users.length - 1].$id : null,
      totalCount: result.total,
    }

    return response
  } catch (error: unknown) {
    // Log error
    logError('Failed to list users', error, createLogContext(event))

    // Handle errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      // Re-throw H3 errors (auth errors from requireAdminRole)
      throw error
    }

    // Return API error format
    const apiError: ApiError = {
      error: {
        code: 'appwrite_error',
        message: error instanceof Error ? error.message : 'Failed to fetch users from Appwrite',
      },
    }

    setResponseStatus(event, 502) // Bad Gateway - Appwrite unavailable
    return apiError
  }
})
