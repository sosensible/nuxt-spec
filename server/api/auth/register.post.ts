/**
 * POST /api/auth/register
 * 
 * Register a new user with email and password.
 * Automatically creates a session and sets cookie.
 */

import { ID } from 'node-appwrite'
import { registerSchema } from '../../../schemas/auth'
import { mapAppwriteUser } from '../../../types/auth'
import { createAppwriteClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteError, SESSION_COOKIE_NAME, getSessionCookieOptions } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = registerSchema.parse(body)

    // Create Appwrite client with admin privileges
    const client = createAppwriteClient()
    const account = createAccountService(client)

    // Create user account
    const userId = ID.unique()
    await account.create(
      userId,
      validatedData.email,
      validatedData.password,
      validatedData.name,
    )

    // Create email/password session (auto-login after registration)
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
