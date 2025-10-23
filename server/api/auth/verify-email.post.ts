/**
 * Email Verification API Route
 * 
 * Completes the email verification flow by validating the verification token
 * and marking the user's email as verified in Appwrite.
 * 
 * This endpoint:
 * 1. Validates the request body (userId, secret)
 * 2. Verifies the token hasn't expired
 * 3. Marks the email as verified in Appwrite
 * 4. Returns success confirmation
 * 
 * @security Token Validation
 * - Token must not be expired
 * - Token must be valid (issued by Appwrite)
 * - Invalid tokens return 400 error
 * 
 * @route POST /api/auth/verify-email
 * @body { userId: string, secret: string }
 * @returns { success: true, message: string } - Success confirmation
 * @throws 400 - Invalid/expired token or validation error
 * @throws 500 - Unexpected server error
 * 
 * @example Request
 * ```json
 * POST /api/auth/verify-email
 * {
 *   "userId": "64a1b2c3d4e5f6g7h8i9j0",
 *   "secret": "abc123def456ghi789..."
 * }
 * ```
 * 
 * @example Success Response
 * ```json
 * {
 *   "success": true,
 *   "message": "Email verified successfully!"
 * }
 * ```
 * 
 * @see https://appwrite.io/docs/products/auth/email-password#email-verification
 */

import { z } from 'zod'
import { createAppwriteClient, createAccountService } from '../../utils/appwrite'

// Validation schema
const verifyEmailSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Verification token is required'),
})

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const body = await readBody(event)
    const { userId, secret } = verifyEmailSchema.parse(body)

    // Get Appwrite account service (admin client)
    const client = createAppwriteClient()
    const account = createAccountService(client)

    try {
      // Verify email with Appwrite
      await account.updateVerification(userId, secret)

      return {
        success: true,
        message: 'Email verified successfully!',
      }
    } catch (error: unknown) {
      // Handle Appwrite errors (invalid/expired token, already verified)
      console.error('Email verification error:', error)
      
      // Check if email is already verified
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = String(error.message)
        if (errorMessage.includes('already') || errorMessage.includes('verified')) {
          return {
            success: true,
            message: 'Email is already verified.',
          }
        }
      }
      
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired verification link. Please request a new one.',
      })
    }
  } catch (error: unknown) {
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request. User ID and verification token are required.',
      })
    }

    // If it's already a createError, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // For any other unexpected errors
    console.error('Unexpected error in email verification:', error)
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred. Please try again.',
    })
  }
})
