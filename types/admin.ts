/**
 * Admin API Types
 * 
 * TypeScript types for admin user management API
 * Based on specs/005-appwrite-auth-we/contracts/types.d.ts
 */

export interface UserRecord {
  id: string
  email?: string
  name?: string
  status?: string // e.g., 'active' | 'banned' | 'suspended'
  createdAt?: string // ISO timestamp
  emailVerified?: boolean
  customAttributes?: Record<string, unknown>
  roles?: string[]
}

export interface PagedResponse<T> {
  items: T[]
  cursor?: string | null // cursor token for next/prev
  totalCount?: number | null // optional, may be unavailable from Appwrite
}

export interface ApiError {
  error: {
    code: string | number
    message: string
  }
}

export interface UpdateUserPayload {
  // Keep minimal and whitelisted
  name?: string
  email?: string
  customAttributes?: Record<string, unknown>
}
