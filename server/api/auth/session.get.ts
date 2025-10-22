/**
 * GET /api/auth/session
 * 
 * Get the current authenticated user.
 * Returns null if no valid session exists.
 * 
 * Used by middleware and client-side auth checks.
 */

import { mapAppwriteUser } from '../../../types/auth'
import { createAppwriteSessionClient, createAccountService } from '../../utils/appwrite'
import { SESSION_COOKIE_NAME } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get session from cookie
    const sessionSecret = getCookie(event, SESSION_COOKIE_NAME)

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
