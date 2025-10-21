/**
 * Authentication Validation Schemas
 * 
 * Zod schemas for validating authentication-related forms and API requests.
 * Used with Nuxt UI's UForm component for client-side validation
 * and in API routes for server-side validation.
 */

import { z } from 'zod'

/**
 * Password validation schema
 * 
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')

/**
 * Email validation schema
 * 
 * - Valid email format
 * - Automatically converts to lowercase
 */
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Invalid email address')
  .toLowerCase()

/**
 * Registration form schema
 * 
 * @example
 * const form = reactive({ name: '', email: '', password: '' })
 * registerSchema.parse(form)
 */
export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: emailSchema,
  password: passwordSchema,
})

/**
 * Login form schema
 * 
 * @example
 * const form = reactive({ email: '', password: '' })
 * loginSchema.parse(form)
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

/**
 * Password reset request schema
 * 
 * @example
 * const form = reactive({ email: '' })
 * passwordResetSchema.parse(form)
 */
export const passwordResetSchema = z.object({
  email: emailSchema,
})

/**
 * Password reset confirmation schema
 * 
 * Includes password match validation
 * 
 * @example
 * const form = reactive({ 
 *   userId: 'user-id', 
 *   secret: 'secret-token',
 *   password: '', 
 *   passwordConfirm: '' 
 * })
 * passwordResetConfirmSchema.parse(form)
 */
export const passwordResetConfirmSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Secret token is required'),
  password: passwordSchema,
  passwordConfirm: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords do not match',
  path: ['passwordConfirm'],
})

/**
 * Email verification schema
 * 
 * @example
 * const params = { userId: 'user-id', secret: 'secret-token' }
 * emailVerificationSchema.parse(params)
 */
export const emailVerificationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  secret: z.string().min(1, 'Secret token is required'),
})

/**
 * Type exports for use in components
 * 
 * @example
 * import type { RegisterForm } from '~/schemas/auth'
 * const state = reactive<RegisterForm>({ name: '', email: '', password: '' })
 */
export type RegisterForm = z.infer<typeof registerSchema>
export type LoginForm = z.infer<typeof loginSchema>
export type PasswordResetForm = z.infer<typeof passwordResetSchema>
export type PasswordResetConfirmForm = z.infer<typeof passwordResetConfirmSchema>
export type EmailVerificationForm = z.infer<typeof emailVerificationSchema>
