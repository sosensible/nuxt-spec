/**
 * useAuth Composable
 * 
 * Provides authentication state and methods for the application.
 * Uses SSR-compatible useState for shared state across client and server.
 * 
 * @example
 * const { user, loading, login, logout } = useAuth()
 * 
 * // Login
 * const result = await login('user@example.com', 'password123')
 * if (result.success) {
 *   console.log('Logged in as:', user.value.name)
 * }
 */

import type { User, AuthResponse } from '~/types/auth'

export interface AuthResult {
  success: boolean
  error?: string
}

/**
 * Extract error message from API error response
 * @param error - Unknown error object from catch block
 * @param fallback - Default message if no specific error message found
 * @returns Error message string
 */
function extractErrorMessage(error: unknown, fallback: string): string {
  const err = error as { data?: { message?: string } }
  return err.data?.message || fallback
}

export const useAuth = () => {
  // SSR-compatible state
  const user = useState<User | null>('user', () => null)
  const loading = useState<boolean>('auth-loading', () => false)

  /**
   * Log in with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Result object with success status and optional error message
   */
  const login = async (email: string, password: string): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      user.value = response.user
      return { success: true }
    }
    catch (error: unknown) {
      return { success: false, error: extractErrorMessage(error, 'Login failed') }
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Register a new user account
   * 
   * @param name - User's display name
   * @param email - User's email address
   * @param password - User's password (min 8 chars with complexity requirements)
   * @returns Result object with success status and optional error message
   */
  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    loading.value = true
    try {
      const response = await $fetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: { name, email, password },
      })
      user.value = response.user
      return { success: true }
    }
    catch (error: unknown) {
      return { success: false, error: extractErrorMessage(error, 'Registration failed') }
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Log out current user
   * 
   * Clears user state and redirects to login page
   * 
   * @returns Result object with success status and optional error message
   */
  const logout = async (): Promise<AuthResult> => {
    loading.value = true
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
      user.value = null
      navigateTo('/login')
      return { success: true }
    }
    catch (error: unknown) {
      return { success: false, error: extractErrorMessage(error, 'Logout failed') }
    }
    finally {
      loading.value = false
    }
  }

  /**
   * Check current authentication status
   * 
   * Fetches current session from server and updates user state.
   * Used by auth middleware and on app initialization.
   * 
   * @returns void (updates user state)
   */
  const checkAuth = async (): Promise<void> => {
    loading.value = true
    try {
      const response = await $fetch<{ user: User | null }>('/api/auth/session')
      user.value = response.user
    }
    catch {
      user.value = null
    }
    finally {
      loading.value = false
    }
  }

  return {
    user: readonly(user),
    loading: readonly(loading),
    login,
    register,
    logout,
    checkAuth,
  }
}
