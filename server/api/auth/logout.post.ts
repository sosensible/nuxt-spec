/**
 * POST /api/auth/logout
 * 
 * Log out the current user by deleting their session.
 * Clears the session cookie. This endpoint is idempotent - calling it
 * multiple times or when not logged in will still return success.
 * 
 * @route POST /api/auth/logout
 * @returns { success: true } - Always returns success
 * @note Gracefully handles invalid or expired sessions
 * @note Cookie is cleared even if session deletion fails
 */

import { createAppwriteSessionClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteError, getSessionFromCookie, clearSessionCookie } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get session from cookie
    const sessionSecret = getSessionFromCookie(event)

    // If no session, return success (idempotent)
    if (!sessionSecret) {
      return { success: true }
    }

    // Create Appwrite client with session
    const client = createAppwriteSessionClient(sessionSecret)
    const account = createAccountService(client)

    // Delete current session
    await account.deleteSession('current')

    // Clear session cookie
    clearSessionCookie(event)

    return { success: true }
  }
  catch (error: unknown) {
    // Even if session deletion fails, clear the cookie
    clearSessionCookie(event)

    // For logout, we can be lenient - if session is invalid, treat as success
    if (error && typeof error === 'object' && 'code' in error && (error.code === 401 || error.code === 404)) {
      return { success: true }
    }

    // Handle other errors
    throw mapAppwriteError(error)
  }
})
