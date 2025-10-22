/**
 * Resend Email Verification API Route
 * 
 * Allows authenticated users to request a new verification email.
 * Requires active user session (must be logged in).
 * 
 * This endpoint:
 * 1. Verifies user is authenticated (has valid session)
 * 2. Checks if email is already verified
 * 3. Generates new verification token via Appwrite
 * 4. Sends verification email with token
 * 
 * @security Authentication Required
 * - Must have valid session cookie
 * - Returns 401 if not authenticated
 * 
 * @security Rate Limiting
 * - Limited to 1 request per 60 seconds per user
 * - Returns 429 if rate limit exceeded
 * - Prevents email spam and abuse
 * 
 * @route POST /api/auth/verify-email/resend
 * @returns { success: true, message: string } - Success confirmation
 * @throws 401 - Not authenticated
 * @throws 429 - Rate limit exceeded (too many requests)
 * @throws 500 - Unexpected server error
 * 
 * @example Success Response
 * ```json
 * {
 *   "success": true,
 *   "message": "Verification email sent! Please check your inbox."
 * }
 * ```
 * 
 * @see https://appwrite.io/docs/products/auth/email-password#email-verification
 */

import { createAppwriteSessionClient, createAccountService } from '../../../utils/appwrite'

// In-memory rate limiting (per user)
// Maps userId to timestamp of last resend request
const rateLimitMap = new Map<string, number>()
const RATE_LIMIT_MS = 60 * 1000 // 60 seconds

export default defineEventHandler(async (event) => {
  try {
    // Get session cookie
    const sessionCookie = getCookie(event, 'session')
    
    if (!sessionCookie) {
      throw createError({
        statusCode: 401,
        message: 'You must be logged in to resend verification email.',
      })
    }

    // Create Appwrite client with user's session
    const client = createAppwriteSessionClient(sessionCookie)
    const account = createAccountService(client)

    try {
      // Get current user to check verification status
      const user = await account.get()
      
      // Check rate limiting
      const now = Date.now()
      const lastRequest = rateLimitMap.get(user.$id)
      
      if (lastRequest && (now - lastRequest) < RATE_LIMIT_MS) {
        const remainingSeconds = Math.ceil((RATE_LIMIT_MS - (now - lastRequest)) / 1000)
        throw createError({
          statusCode: 429,
          message: `Please wait ${remainingSeconds} seconds before requesting another verification email.`,
        })
      }
      
      // Check if already verified
      if (user.emailVerification) {
        return {
          success: true,
          message: 'Email is already verified.',
        }
      }

      // Build verification URL
      const config = useRuntimeConfig()
      const baseUrl = config.public.appUrl || 'http://localhost:3000'
      const verificationUrl = `${baseUrl}/verify-email`

      // Send new verification email
      await account.createVerification(verificationUrl)

      // Update rate limit timestamp
      rateLimitMap.set(user.$id, now)

      return {
        success: true,
        message: 'Verification email sent! Please check your inbox.',
      }
    } catch (error: unknown) {
      // Handle Appwrite errors
      console.error('Resend verification error:', error)
      
      throw createError({
        statusCode: 500,
        message: 'Failed to send verification email. Please try again later.',
      })
    }
  } catch (error: unknown) {
    // If it's already a createError, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // For any other unexpected errors
    console.error('Unexpected error in resend verification:', error)
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred. Please try again.',
    })
  }
})
