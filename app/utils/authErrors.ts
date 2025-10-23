/**
 * Auth Error Utilities
 * 
 * Helper functions for handling and formatting authentication errors
 * with user-friendly messages.
 */

/**
 * Map common authentication errors to user-friendly messages
 * 
 * @param error - Error from authentication operation
 * @returns User-friendly error message
 * 
 * @example
 * ```ts
 * try {
 *   await login(email, password)
 * } catch (err) {
 *   const message = getAuthErrorMessage(err)
 *   // "The email or password you entered is incorrect."
 * }
 * ```
 */
export function getAuthErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unexpected error occurred. Please try again.'
  }

  const message = error.message.toLowerCase()

  // Invalid credentials
  if (message.includes('invalid credentials') || message.includes('invalid email or password')) {
    return 'The email or password you entered is incorrect. Please try again.'
  }

  // User already exists
  if (message.includes('already exists') || message.includes('user with the same')) {
    return 'An account with this email already exists. Try logging in instead.'
  }

  // Rate limiting
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Too many attempts. Please wait a few minutes and try again.'
  }

  // Network errors
  if (message.includes('network') || message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.'
  }

  // Session expired
  if (message.includes('session') || message.includes('unauthorized')) {
    return 'Your session has expired. Please log in again.'
  }

  // Validation errors
  if (message.includes('validation') || message.includes('invalid email')) {
    return 'Please check your input and try again.'
  }

  // Default message - use original if it's user-friendly, otherwise generic
  if (error.message && error.message.length < 100 && !error.message.includes('Error:')) {
    return error.message
  }

  return 'Something went wrong. Please try again later.'
}

/**
 * Extract validation errors from API response
 * 
 * @param error - Error object that may contain validation issues
 * @returns Array of validation errors with field names and messages
 * 
 * @example
 * ```ts
 * try {
 *   await register(data)
 * } catch (err) {
 *   const validationErrors = extractValidationErrors(err)
 *   // [{ field: 'email', message: 'Invalid email format' }]
 * }
 * ```
 */
export interface ValidationError {
  field: string
  message: string
}

export function extractValidationErrors(error: unknown): ValidationError[] {
  if (!error || typeof error !== 'object') {
    return []
  }

  // Check if error has validation issues (from Zod)
  if ('data' in error && error.data && typeof error.data === 'object' && 'issues' in error.data) {
    const data = error.data as { issues: Array<{ path: string[]; message: string }> }
    return data.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message,
    }))
  }

  return []
}
