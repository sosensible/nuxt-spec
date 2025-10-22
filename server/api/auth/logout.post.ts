/**
 * POST /api/auth/logout
 * 
 * Log out the current user.
 * Deletes the session and clears cookie.
 */

import { createAppwriteSessionClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteError, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Get session from cookie
    const sessionSecret = getCookie(event, SESSION_COOKIE_NAME)

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
    setCookie(event, SESSION_COOKIE_NAME, '', {
      ...getSessionCookieOptions(),
      maxAge: 0,
    })

    return { success: true }
  }
  catch (error: unknown) {
    // Even if session deletion fails, clear the cookie
    setCookie(event, SESSION_COOKIE_NAME, '', {
      ...getSessionCookieOptions(),
      maxAge: 0,
    })

    // For logout, we can be lenient - if session is invalid, treat as success
    if (error && typeof error === 'object' && 'code' in error && (error.code === 401 || error.code === 404)) {
      return { success: true }
    }

    // Handle other errors
    throw mapAppwriteError(error)
  }
})
