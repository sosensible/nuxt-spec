/**
 * Password Reset Confirmation API Route
 * 
 * Completes the password reset by validating the token and updating the password.
 * 
 * Security:
 * - Token expires in 1 hour (Appwrite default)
 * - Token is single-use only (cannot be reused)
 * - Password must meet complexity requirements
 * 
 * POST /api/auth/password-reset/confirm
 * Body: { userId: string, secret: string, password: string }
 * Response: { success: true, message: string }
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
