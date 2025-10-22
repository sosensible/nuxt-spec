/**
 * POST /api/auth/register
 * 
 * Register a new user with email and password.
 * Automatically creates a session and sets an HTTP-only cookie.
 * 
 * @route POST /api/auth/register
 * @body { email: string, password: string, name: string }
 * @returns { user: User } - User object with session cookie set
 * @throws 400 - Validation error (invalid email, weak password, etc.)
 * @throws 409 - User with this email already exists
 * @throws 429 - Rate limit exceeded
 * @throws 500 - Internal server error
 */

import { ID } from 'node-appwrite'
import { registerSchema } from '../../../schemas/auth'
import { mapAppwriteUser } from '../../../types/auth'
import { createAppwriteClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteError, handleZodError, setSessionCookie } from '../../utils/auth'

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
