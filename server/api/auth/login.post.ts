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
import { createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Parse and validate request body
    const body = await readBody(event)
    const validatedData = loginSchema.parse(body)

    // Create Appwrite client with admin privileges
    const client = createAppwriteClient()
    const account = createAccountService(client)

    // Create email/password session (defensive: catch upstream/stream errors separately)
    let session
    try {
      session = await account.createEmailPasswordSession(
        validatedData.email,
        validatedData.password,
      )
    }
    catch (err: unknown) {
      // Detect premature close / abort-like errors and surface a 502 so caller knows it's upstream/network related
      const e = err as unknown as { code?: string; name?: string; message?: string }
      const isStreamAbort =
        e?.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        e?.code === 'ECONNRESET' ||
        e?.name === 'AbortError' ||
        (typeof e?.message === 'string' && e.message.includes('Premature close')) ||
        (typeof e?.message === 'string' && e.message.includes('aborted'))

      if (isStreamAbort) {
        // Log with context for diagnostics
        console.error('Upstream connection aborted while creating session', {
          url: event.node.req.url,
          body: { email: validatedData.email },
          error: e?.message || e,
        })

        throw createError({
          statusCode: 502,
          message: 'Upstream authentication service aborted the connection',
        })
      }

      // Not a stream-abort - rethrow to be handled by existing mapper
      throw err
  }

    // Fetch user data (also defensive)
    let appwriteUser
    try {
      appwriteUser = await account.get()
    }
    catch (err: unknown) {
      const e = err as unknown as { code?: string; name?: string; message?: string }
      const isStreamAbort =
        e?.code === 'ERR_STREAM_PREMATURE_CLOSE' ||
        e?.code === 'ECONNRESET' ||
        e?.name === 'AbortError' ||
        (typeof e?.message === 'string' && e.message.includes('Premature close')) ||
        (typeof e?.message === 'string' && e.message.includes('aborted'))

      if (isStreamAbort) {
        console.error('Upstream connection aborted while fetching user', {
          url: event.node.req.url,
          error: e?.message || e,
        })

        throw createError({
          statusCode: 502,
          message: 'Upstream authentication service aborted the connection',
        })
      }

      throw err
    }

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
