/**
 * Password Reset Request API Route
 * 
 * Handles password reset requests by sending a reset email with a secure token.
 * 
 * Security:
 * - Always returns 200 (even for non-existent emails) to prevent email enumeration
 * - Token expires in 1 hour (Appwrite default)
 * - Token is single-use only
 * 
 * POST /api/auth/password-reset
 * Body: { email: string }
 * Response: { success: true, message: string }
 */

import { passwordResetRequestSchema } from '~/schemas/password-reset'
import { createAppwriteClient, createAccountService } from '../../utils/appwrite'

export default defineEventHandler(async (event) => {
  try {
    // Validate request body
    const body = await readBody(event)
    const { email } = passwordResetRequestSchema.parse(body)

    // Get Appwrite account service (admin client)
    const client = createAppwriteClient()
    const account = createAccountService(client)

    // Build reset URL (will be sent in email by Appwrite)
    const config = useRuntimeConfig()
    const baseUrl = config.public.appUrl || 'http://localhost:3000'
    const resetUrl = `${baseUrl}/password-reset/confirm`

    try {
      // Request password reset from Appwrite
      await account.createRecovery(email, resetUrl)
    } catch (error) {
      // Silently handle errors to prevent email enumeration
      // Log error for debugging but don't expose to user
      console.error('Password reset error:', error)
    }

    // Always return success to prevent email enumeration attacks
    // User receives email only if account exists
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    }
  } catch (error: unknown) {
    // Only return 400 for validation errors (invalid email format)
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      throw createError({
        statusCode: 400,
        message: 'Please provide a valid email address.',
      })
    }

    // For any other errors, still return generic success (security)
    console.error('Unexpected error in password reset:', error)
    return {
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    }
  }
})
