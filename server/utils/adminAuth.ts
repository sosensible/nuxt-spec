/**
 * Admin Authentication Middleware
 * 
 * Validates that the requesting operator has elevated admin privileges
 * before allowing access to admin routes.
 * 
 * This middleware checks for:
 * 1. Valid session cookie
 * 2. Elevated in-app admin role (MVP implementation)
 * 
 * Future: Tighten mapping to Appwrite Teams or stricter org-level roles
 */

import type { H3Event } from 'h3'
import { createError } from 'h3'
import { createAppwriteSessionClient, createAccountService, createAppwriteClient, createTeamsService } from '../utils/appwrite'
import { getSessionFromCookie } from '../utils/auth'

/**
 * Check if user has elevated admin role
 * 
 * MVP Implementation: Any authenticated user is considered admin
 * This is intentionally simplified for MVP delivery
 * 
 * TODO: In production, implement proper role checking:
 * - Query Appwrite Teams for admin team membership
 * - Check custom user attributes for admin flag
 * - Verify against specific role IDs
 * 
 * @param event - H3 event object
 * @returns User ID if authenticated and authorized
 * @throws H3Error if not authenticated or not authorized
 */
export async function requireAdminRole(event: H3Event): Promise<string> {
  // Get session from cookie
  const sessionSecret = getSessionFromCookie(event)
  
  if (!sessionSecret) {
    throw createError({
      statusCode: 401,
      message: 'Authentication required',
    })
  }

  try {
    // Create session client
    const client = createAppwriteSessionClient(sessionSecret)
    const account = createAccountService(client)
    
    // Get current user account
    const user = await account.get()
    
    if (!user || !user.$id) {
      throw createError({
        statusCode: 401,
        message: 'Invalid session',
      })
    }

    // Prefer Teams-based admin check when APPWRITE_ADMIN_TEAM_ID is configured.
    // This uses the server API key to check team memberships (authoritative).
    const adminTeamId = process.env.APPWRITE_ADMIN_TEAM_ID

    if (adminTeamId) {
      try {
        // Use server client (API key) to inspect team memberships
        const adminClient = createAppwriteClient()
        const teamsService = createTeamsService(adminClient)

        // List memberships for the configured admin team and check for the user
        // Note: listMemberships returns memberships; we check for matching userId
        // If this call fails (permissions) we fall back to label-checking below.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawMemberships: any = await teamsService.listMemberships(adminTeamId)
        const memberships = rawMemberships?.memberships ?? rawMemberships?.items ?? rawMemberships ?? []

        const isMember = (memberships as Array<Record<string, unknown>>).some(m => {
          const userIdField = (m as Record<string, unknown>)["userId"] as string | undefined
          const userIdUnderscore = (m as Record<string, unknown>)["user_id"] as string | undefined
          const userField = (m as Record<string, unknown>)["user"] as string | undefined
          const idField = (m as Record<string, unknown>)["$id"] as string | undefined
          return userIdField === user.$id || userIdUnderscore === user.$id || userField === user.$id || idField === user.$id
        })

        if (!isMember) {
          throw createError({ statusCode: 403, message: 'Insufficient permissions. Admin team membership required.' })
        }

        // User is a member of the admin team
        return user.$id
      } catch (err: unknown) {
        // If the teams check fails due to permission or API errors, fall through
        // to the label-based check as a safe fallback. Log in development.
        if (process.env.NODE_ENV === 'development') {
          console.warn('Admin team membership check failed, falling back to label check:', err)
        }
      }
    }

    // Fallback: require explicit admin label in user.labels
    const labels = (user as { labels?: string[] }).labels
    if (!Array.isArray(labels) || !labels.includes('admin')) {
      throw createError({
        statusCode: 403,
        message: 'Insufficient permissions. Admin role required.',
      })
    }

    // Return user ID for logging and audit purposes
    return user.$id
  } catch (error: unknown) {
    // If it's already an H3 error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // Handle Appwrite errors
    throw createError({
      statusCode: 401,
      message: 'Authentication failed',
    })
  }
}

/**
 * Extract request ID from headers or generate one
 * 
 * @param event - H3 event object
 * @returns Request ID string
 */
export function getRequestId(event: H3Event): string {
  // Try to get request ID from header (if set by reverse proxy)
  const headerRequestId = getHeader(event, 'x-request-id')
  if (headerRequestId) {
    return headerRequestId
  }

  // Generate a simple request ID
  return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
}
