/**
 * GET /api/auth/session
 * 
 * Get the current authenticated user from session cookie.
 * This endpoint never throws errors - it always returns a response
 * with either the user object or null.
 * 
 * @route GET /api/auth/session
 * @returns { user: User | null } - Current user or null if not authenticated
 * @note Safe for use in middleware - never throws errors
 * @note Returns null for invalid/expired sessions
 * @note Logs errors in development for debugging
 */

import { mapAppwriteUser } from '../../../types/auth'
import { createAppwriteSessionClient, createAccountService } from '../../utils/appwrite'
import { getSessionFromCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get session from cookie
    const sessionSecret = getSessionFromCookie(event)

    // If no session, return null user
    if (!sessionSecret) {
      return { user: null }
    }

    // Create Appwrite client with session
    const client = createAppwriteSessionClient(sessionSecret)
    const account = createAccountService(client)

    // Fetch user data
    const appwriteUser = await account.get()

    // Map to application User type
    const user = mapAppwriteUser(appwriteUser)

    return { user }
  }
  catch (error: unknown) {
    // If session is invalid or expired, return null user
    // Don't throw error - this endpoint is used by middleware
    if (error && typeof error === 'object' && 'code' in error && (error.code === 401 || error.code === 404)) {
      return { user: null }
    }

    // For unexpected errors, also return null user to avoid breaking the app
    // Log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Session check error:', error)
    }

    return { user: null }
  }
})
