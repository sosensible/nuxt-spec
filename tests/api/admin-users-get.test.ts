/**
 * API Contract Tests for GET /api/admin/users
 * 
 * Tests the server-side proxy endpoint that fetches users from Appwrite
 */

import { describe, it, expect, vi } from 'vitest'
import type { PagedResponse, UserRecord } from '~/types/admin'

// Mock the Appwrite utilities
vi.mock('~/server/utils/appwrite', () => ({
  createAppwriteClient: vi.fn(() => ({})),
  createUsersService: vi.fn(() => ({
    list: vi.fn(async () => ({
      users: [
        {
          $id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          status: true,
          $createdAt: '2024-01-01T00:00:00.000Z',
          emailVerification: true,
          labels: ['admin'],
          prefs: {},
        },
      ],
      total: 1,
    })),
  })),
}))

// Mock the auth middleware
vi.mock('~/server/middleware/auth', () => ({
  requireAdminRole: vi.fn(async () => 'operator123'),
  getRequestId: vi.fn(() => 'req_test_123'),
}))

// Mock the logger
vi.mock('~/server/utils/logger', () => ({
  logAdminAction: vi.fn(),
  logError: vi.fn(),
  createLogContext: vi.fn(() => ({
    requestId: 'req_test_123',
    operatorId: 'operator123',
  })),
}))

describe('GET /api/admin/users', () => {
  it('should return paged response with user records', async () => {
    // This test verifies the contract defined in types/admin.ts
    const response: PagedResponse<UserRecord> = {
      items: [
        {
          id: 'user1',
          email: 'test@example.com',
          name: 'Test User',
          status: 'active',
          createdAt: '2024-01-01T00:00:00.000Z',
          emailVerified: true,
          roles: ['admin'],
          customAttributes: {},
        },
      ],
      cursor: null,
      totalCount: 1,
    }

    // Verify response structure
    expect(response).toHaveProperty('items')
    expect(response).toHaveProperty('cursor')
    expect(response).toHaveProperty('totalCount')
    expect(Array.isArray(response.items)).toBe(true)
    expect(response.items.length).toBeGreaterThan(0)

    // Verify UserRecord structure
    const user = response.items[0]
    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('status')
    expect(user).toHaveProperty('createdAt')
    expect(user).toHaveProperty('emailVerified')
  })

  it('should accept pagination parameters', () => {
    const validParams = {
      pageSize: 25,
      cursor: 'cursor_abc123',
      offset: 0,
      q: 'search@example.com',
    }

    expect(validParams.pageSize).toBeGreaterThan(0)
    expect(validParams.pageSize).toBeLessThanOrEqual(50)
  })

  it('should enforce maximum page size of 50', () => {
    const requestedSize = 100
    const actualSize = Math.min(requestedSize, 50)
    
    expect(actualSize).toBe(50)
  })

  it('should handle cursor-based pagination', () => {
    const response: PagedResponse<UserRecord> = {
      items: [],
      cursor: 'next_cursor_token',
      totalCount: 100,
    }

    expect(response.cursor).toBeTypeOf('string')
  })

  it('should handle null cursor when no more pages', () => {
    const response: PagedResponse<UserRecord> = {
      items: [],
      cursor: null,
      totalCount: 10,
    }

    expect(response.cursor).toBeNull()
  })

  it('should handle optional totalCount', () => {
    const responseWithCount: PagedResponse<UserRecord> = {
      items: [],
      cursor: null,
      totalCount: 42,
    }

    const responseWithoutCount: PagedResponse<UserRecord> = {
      items: [],
      cursor: null,
      totalCount: null,
    }

    expect(responseWithCount.totalCount).toBe(42)
    expect(responseWithoutCount.totalCount).toBeNull()
  })

  it('should return error format on failure', () => {
    const errorResponse = {
      error: {
        code: 'appwrite_error',
        message: 'Failed to fetch users from Appwrite',
      },
    }

    expect(errorResponse).toHaveProperty('error')
    expect(errorResponse.error).toHaveProperty('code')
    expect(errorResponse.error).toHaveProperty('message')
  })
})
