/**
 * Password Reset Confirmation API Route
 * 
 * Completes the password reset flow by validating the reset token and updating
 * the user's password. This endpoint:
 * 1. Validates the request body (userId, secret, password)
 * 2. Verifies the token hasn't expired (1-hour window)
 * 3. Checks the token hasn't been used before (single-use)
 * 4. Updates the user's password in Appwrite
 * 5. Invalidates the token after successful use
 * 
 * @security Token Validation
 * - Token must not be expired (1-hour TTL from creation)
 * - Token must not have been used before (single-use enforcement)
 * - Invalid tokens return 400 error without exposing reason
 * 
 * @security Password Requirements
 * - Minimum 8 characters
 * - Must contain uppercase, lowercase, number, special character
 * - Validated by Zod schema before sending to Appwrite
 * 
 * @route POST /api/auth/password-reset/confirm
 * @body { userId: string, secret: string, password: string }
 * @returns { success: true, message: string } - Success confirmation
 * @throws 400 - Invalid/expired token or validation error
 * @throws 500 - Unexpected server error
 * 
 * @example Request
 * ```json
 * POST /api/auth/password-reset/confirm
 * {
 *   "userId": "64a1b2c3d4e5f6g7h8i9j0",
 *   "secret": "abc123def456ghi789...",
 *   "password": "NewSecurePassword123!"
 * }
 * ```
 * 
 * @example Success Response
 * ```json
 * {
 *   "success": true,
 *   "message": "Password has been reset successfully. You can now log in with your new password."
 * }
 * ```
 * 
 * @example Error Response (Invalid Token)
 * ```json
 * {
 *   "statusCode": 400,
 *   "message": "Invalid or expired reset token. Please request a new password reset."
 * }
 * ```
 * 
 * @see https://appwrite.io/docs/products/auth/email-password#password-recovery
 */

import { passwordResetConfirmSchema } from '~/schemas/password-reset'
import { createAppwriteClient, createAccountService } from '../../../utils/appwrite'

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const body = await readBody(event)
    const { userId, secret, password } = passwordResetConfirmSchema.parse(body)

    // Get Appwrite account service (admin client)
    const client = createAppwriteClient()
    const account = createAccountService(client)

    try {
      // Update password with reset token
      await account.updateRecovery(userId, secret, password)

      return {
        success: true,
        message: 'Password has been reset successfully. You can now log in with your new password.',
      }
    } catch (error: unknown) {
      // Handle Appwrite errors (invalid/expired token)
      console.error('Password reset confirmation error:', error)
      
      throw createError({
        statusCode: 400,
        message: 'Invalid or expired reset token. Please request a new password reset.',
      })
    }
  } catch (error: unknown) {
    // Handle validation errors
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Invalid request. Please check your password meets the requirements.',
      })
    }

    // If it's already a createError, rethrow it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    // For any other unexpected errors
    console.error('Unexpected error in password reset confirmation:', error)
    throw createError({
      statusCode: 500,
      message: 'An unexpected error occurred. Please try again.',
    })
  }
})
