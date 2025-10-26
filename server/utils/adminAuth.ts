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
import { createAppwriteSessionClient, createAccountService } from '../utils/appwrite'
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

    // MVP: All authenticated users are considered admins
    // In production, check user.labels, teams, or custom attributes here
    // Example future implementation:
    // if (!user.labels?.includes('admin')) {
    //   throw createError({
    //     statusCode: 403,
    //     message: 'Insufficient permissions. Admin role required.',
    //   })
    // }

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
