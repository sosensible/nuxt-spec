/**
 * Unit Tests: useAuth Composable
 * 
 * Following TDD RED-GREEN-REFACTOR:
 * - RED: These tests will FAIL initially (composable doesn't exist yet)
 * - GREEN: Implement useAuth to make tests pass
 * - REFACTOR: Clean up implementation while keeping tests green
 * 
 * Testing Philosophy:
 * - Test the PUBLIC INTERFACE/CONTRACT only
 * - Mock external dependencies ($fetch)
 * - Do NOT test implementation details (navigateTo calls, loading state timing)
 * - Focus on inputs, outputs, and state changes
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '~/composables/useAuth'
import type { User } from '~/types/auth'

// Mock $fetch - this is an external dependency
const mockFetch = vi.fn()
vi.stubGlobal('$fetch', mockFetch)

// Mock navigateTo - needed for composable to work, but we won't test calls to it
vi.stubGlobal('navigateTo', vi.fn())

describe('useAuth composable', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  describe('Initial State', () => {
    it('should initialize with null user and loading false', () => {
      const { user, loading } = useAuth()
      
      expect(user.value).toBeNull()
      expect(loading.value).toBe(false)
    })

    it('should expose user and loading as refs', () => {
      const { user, loading } = useAuth()
      
      // Verify the interface returns refs with proper values
      expect(user).toBeDefined()
      expect(loading).toBeDefined()
      expect(typeof user.value).toBe('object') // null is typeof object
      expect(typeof loading.value).toBe('boolean')
    })
  })

  describe('login()', () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      emailVerified: true,
      provider: 'email',
      createdAt: new Date('2025-01-01'),
    }

    it('should call POST /api/auth/login with credentials', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { login } = useAuth()
      await login('test@example.com', 'Password123!')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/login', {
        method: 'POST',
        body: { email: 'test@example.com', password: 'Password123!' },
      })
    })

    it('should set user state on successful login', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { login, user } = useAuth()
      const result = await login('test@example.com', 'password123')
      
      expect(result.success).toBe(true)
      expect(user.value).toEqual(mockUser)
    })

    it('should return success: true on successful login', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { login } = useAuth()
      const result = await login('test@example.com', 'password123')
      
      expect(result).toEqual({ success: true })
    })

    it('should handle login failure with error message', async () => {
      const errorMessage = 'Invalid email or password'
      mockFetch.mockRejectedValue({
        data: { message: errorMessage },
      })
      
      const { login, user } = useAuth()
      const userValueBefore = user.value  // Capture state before
      const result = await login('test@example.com', 'wrongpassword')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
      // User should not change on error
      expect(user.value).toBe(userValueBefore)
    })

    it('should return generic error when API error has no message', async () => {
      mockFetch.mockRejectedValue({})
      
      const { login } = useAuth()
      const result = await login('test@example.com', 'password123')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Login failed')
    })

    it('should set loading to false after login completes', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { login, loading } = useAuth()
      await login('test@example.com', 'password123')
      
      expect(loading.value).toBe(false)
    })

    it('should set loading to false after login fails', async () => {
      mockFetch.mockRejectedValue({ data: { message: 'Error' } })
      
      const { login, loading } = useAuth()
      await login('test@example.com', 'password123')
      
      expect(loading.value).toBe(false)
    })
  })

  describe('register()', () => {
    const mockUser: User = {
      id: 'user-456',
      email: 'newuser@example.com',
      name: 'New User',
      emailVerified: false,
      provider: 'email',
      createdAt: new Date('2025-01-01'),
    }

    it('should call POST /api/auth/register with user details', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { register } = useAuth()
      await register('New User', 'newuser@example.com', 'Password123!')
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        body: {
          name: 'New User',
          email: 'newuser@example.com',
          password: 'Password123!',
        },
      })
    })

    it('should set user state on successful registration', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { register, user } = useAuth()
      const result = await register('New User', 'newuser@example.com', 'Password123!')
      
      expect(result.success).toBe(true)
      expect(user.value).toEqual(mockUser)
    })

    it('should return success: true on successful registration', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { register } = useAuth()
      const result = await register('New User', 'newuser@example.com', 'Password123!')
      
      expect(result).toEqual({ success: true })
    })

    it('should handle registration failure with error message', async () => {
      const errorMessage = 'An account with this email already exists'
      mockFetch.mockRejectedValue({
        data: { message: errorMessage },
      })
      
      const { register, user } = useAuth()
      const userValueBefore = user.value  // Capture state before
      const result = await register('New User', 'existing@example.com', 'Password123!')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
      // User should not change on error
      expect(user.value).toBe(userValueBefore)
    })

    it('should return generic error when API error has no message', async () => {
      mockFetch.mockRejectedValue({})
      
      const { register } = useAuth()
      const result = await register('New User', 'newuser@example.com', 'Password123!')
      
      expect(result.success).toBe(false)
      expect(result.error).toBe('Registration failed')
    })

    it('should set loading to false after registration completes', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { register, loading } = useAuth()
      await register('New User', 'newuser@example.com', 'Password123!')
      
      expect(loading.value).toBe(false)
    })
  })

  describe('logout()', () => {
    it('should call POST /api/auth/logout', async () => {
      mockFetch.mockResolvedValue({ success: true })
      
      const { logout } = useAuth()
      await logout()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
        method: 'POST',
      })
    })

    it('should clear user state on successful logout', async () => {
      mockFetch.mockResolvedValue({ success: true })
      
      // First login to set a user
      mockFetch.mockResolvedValueOnce({ user: { 
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: true,
        provider: 'email',
        createdAt: new Date(),
      }})
      
      const { login, logout, user } = useAuth()
      await login('test@example.com', 'password123')
      
      // User should be set after login
      expect(user.value).not.toBeNull()
      
      // Then logout
      mockFetch.mockResolvedValueOnce({ success: true })
      await logout()
      
      // User should be cleared
      expect(user.value).toBeNull()
    })

    it('should return success: true on successful logout', async () => {
      mockFetch.mockResolvedValue({ success: true })
      
      const { logout } = useAuth()
      const result = await logout()
      
      expect(result).toEqual({ success: true })
    })

    it('should handle logout failure with error message', async () => {
      const errorMessage = 'Logout failed'
      mockFetch.mockRejectedValue({
        data: { message: errorMessage },
      })
      
      const { logout } = useAuth()
      const result = await logout()
      
      expect(result.success).toBe(false)
      expect(result.error).toBe(errorMessage)
    })

    it('should set loading to false after logout completes', async () => {
      mockFetch.mockResolvedValue({ success: true })
      
      const { logout, loading } = useAuth()
      await logout()
      
      expect(loading.value).toBe(false)
    })
  })

  describe('checkAuth()', () => {
    const mockUser: User = {
      id: 'user-789',
      email: 'existing@example.com',
      name: 'Existing User',
      emailVerified: true,
      provider: 'email',
      createdAt: new Date('2025-01-01'),
    }

    it('should call GET /api/auth/session', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { checkAuth } = useAuth()
      await checkAuth()
      
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
    })

    it('should set user state when session exists', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { checkAuth, user } = useAuth()
      await checkAuth()
      
      expect(user.value).toEqual(mockUser)
    })

    it('should set user to null when no session exists', async () => {
      // First, login to set a user
      mockFetch.mockResolvedValueOnce({ user: mockUser })
      const { login, checkAuth, user } = useAuth()
      await login('test@example.com', 'password123')
      
      // Verify user is set
      expect(user.value).not.toBeNull()
      
      // Then checkAuth returns no user
      mockFetch.mockResolvedValueOnce({ user: null })
      await checkAuth()
      
      // User should be cleared
      expect(user.value).toBeNull()
    })

    it('should set user to null on API error', async () => {
      // First, login to set a user
      mockFetch.mockResolvedValueOnce({ user: mockUser })
      const { login, checkAuth, user } = useAuth()
      await login('test@example.com', 'password123')
      
      // Verify user is set
      expect(user.value).not.toBeNull()
      
      // Then checkAuth fails
      mockFetch.mockRejectedValueOnce(new Error('Unauthorized'))
      await checkAuth()
      
      // User should be cleared
      expect(user.value).toBeNull()
    })

    it('should set loading to false after check completes', async () => {
      mockFetch.mockResolvedValue({ user: mockUser })
      
      const { checkAuth, loading } = useAuth()
      await checkAuth()
      
      expect(loading.value).toBe(false)
    })

    it('should set loading to false after check fails', async () => {
      mockFetch.mockRejectedValue(new Error('Error'))
      
      const { checkAuth, loading } = useAuth()
      await checkAuth()
      
      expect(loading.value).toBe(false)
    })
  })
})
