/**
 * POST /api/auth/login
 * 
 * Log in with email and password.
 * Creates a session and sets cookie.
 */

import { loginSchema } from '../../../schemas/auth'
import { mapAppwriteUser } from '../../../types/auth'
import { createAppwriteClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteError, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = loginSchema.parse(body)

    // Create Appwrite client with admin privileges
    const client = createAppwriteClient()
    const account = createAccountService(client)

    // Create email/password session
    const session = await account.createEmailPasswordSession(
      validatedData.email,
      validatedData.password,
    )

    // Fetch user data
    const appwriteUser = await account.get()

    // Map to application User type
    const user = mapAppwriteUser(appwriteUser)

    // Set session cookie
    setCookie(event, SESSION_COOKIE_NAME, session.secret, getSessionCookieOptions())

    // Return user data
    return {
      user,
    }
  }
  catch (error: unknown) {
    // Handle Zod validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      const zodError = error as unknown as { issues: Array<{ path: string[]; message: string }> }
      throw createError({
        statusCode: 400,
        message: 'Validation failed',
        data: {
          issues: zodError.issues,
        },
      })
    }

    // Handle Appwrite errors
    throw mapAppwriteError(error)
  }
})
