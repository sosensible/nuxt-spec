/**
 * POST /api/auth/login
 * 
 * Authenticate user with email and password.
 * Creates a new session and sets an HTTP-only cookie.
 * 
 * @route POST /api/auth/login
 * @body { email: string, password: string }
 * @returns { user: User } - User object with session cookie set
 * @throws 400 - Validation error (invalid email format)
 * @throws 401 - Invalid credentials
 * @throws 429 - Rate limit exceeded
 * @throws 500 - Internal server error
 */

import { loginSchema } from '../../../app/schemas/auth'
import { mapAppwriteUser } from '../../../types/auth'
import { createAppwriteClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteError, handleZodError, setSessionCookie } from '../../utils/auth'

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
    setSessionCookie(event, session.secret)

    // Return user data
    return {
      user,
    }
  }
  catch (error: unknown) {
    // Handle Zod validation errors
    handleZodError(error)

    // Handle Appwrite errors
    throw mapAppwriteError(error)
  }
})
