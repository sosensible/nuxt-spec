/**
 * Authentication Server Utilities
 * 
 * Helper functions for auth API routes including error mapping
 * and Appwrite error handling.
 */

import { createError } from 'h3'
import type { H3Error } from 'h3'
import { AppwriteException } from 'node-appwrite'

/**
 * Map Appwrite errors to user-friendly HTTP errors
 * 
 * @param error - Error from Appwrite SDK
 * @returns H3Error with appropriate status code and message
 */
export function mapAppwriteError(error: unknown): H3Error {
  // If it's already an H3Error, return it
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return error as H3Error
  }

  // Handle Appwrite exceptions
  if (error instanceof AppwriteException) {
    const { code, message, type } = error

    // Map common Appwrite error codes to HTTP status codes
    switch (code) {
      // Authentication errors
      case 401:
        return createError({
          statusCode: 401,
          message: 'Invalid email or password',
        })

      // User already exists
      case 409:
        return createError({
          statusCode: 409,
          message: 'An account with this email already exists',
        })

      // Invalid credentials format
      case 400:
        return createError({
          statusCode: 400,
          message: message || 'Invalid request data',
        })

      // Rate limit
      case 429:
        return createError({
          statusCode: 429,
          message: 'Too many requests. Please try again later.',
        })

      // Not found
      case 404:
        return createError({
          statusCode: 404,
          message: message || 'Resource not found',
        })

      // Server errors
      case 500:
      case 503:
        return createError({
          statusCode: 500,
          message: 'Authentication service temporarily unavailable',
        })

      default:
        // Log unexpected errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Unexpected Appwrite error:', { code, type, message })
        }
        
        return createError({
          statusCode: code || 500,
          message: message || 'An error occurred during authentication',
        })
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Log unexpected errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error)
    }

    return createError({
      statusCode: 500,
      message: error.message || 'Internal server error',
    })
  }

  // Fallback for unknown error types
  return createError({
    statusCode: 500,
    message: 'An unexpected error occurred',
  })
}

/**
 * Cookie configuration for session management
 */
export const SESSION_COOKIE_NAME = 'session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14 days in seconds

/**
 * Get cookie options for session cookie
 * 
 * @param maxAge - Maximum age in seconds (default: 14 days)
 */
export function getSessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}
