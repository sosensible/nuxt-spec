/**
 * Password Reset Schemas
 * 
 * Validation schemas for password reset functionality:
 * - Request password reset (email)
 * - Confirm password reset (token + new password)
 * 
 * Security:
 * - Email format validation
 * - Password complexity requirements
 * - Token format validation
 */

import { z } from 'zod'
import { passwordSchema, emailSchema } from './auth'

/**
 * Schema for requesting a password reset
 * 
 * Security: Always return success message even for non-existent emails
 * to prevent email enumeration attacks
 */
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
})

/**
 * Schema for confirming a password reset
 * 
 * Requires:
 * - userId: Appwrite user ID from reset link
 * - secret: One-time reset token (1-hour expiration)
 * - password: New password meeting complexity requirements
 */
export const passwordResetConfirmSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
})

export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>
export type PasswordResetConfirm = z.infer<typeof passwordResetConfirmSchema>
