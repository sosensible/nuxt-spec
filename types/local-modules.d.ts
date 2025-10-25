declare module '*/server/utils/appwrite-admin' {
  import type { Client } from 'node-appwrite'

  // Local copy of AppwriteUser shape used in the app (kept in types/auth.ts as source of truth)
  export interface AppwriteUser {
    $id: string
    $createdAt: string
    $updatedAt: string
    email: string
    name: string
    emailVerification: boolean
    phone?: string
    phoneVerification?: boolean
    prefs?: Record<string, unknown>
    labels?: string[]
    status?: boolean
    registration?: string
  }

  export interface ListUsersResult {
    data: AppwriteUser[]
    nextCursor?: string
  }

  export function hardDeleteUser(userId: string): Promise<void>
  export function markUserDeleted(userId: string, retentionDays?: number, client?: Client | unknown): Promise<AppwriteUser>
  export function deleteUser(userId: string): Promise<void>
  export function revokeAllSessionsForUser(userId: string): Promise<void>
  export function listUsers(query?: { limit?: number; cursor?: string; q?: string }): Promise<ListUsersResult>
  export function getUser(userId: string): Promise<AppwriteUser>

  const _default: {
    hardDeleteUser: typeof hardDeleteUser
    markUserDeleted: typeof markUserDeleted
    deleteUser: typeof deleteUser
    revokeAllSessionsForUser: typeof revokeAllSessionsForUser
    listUsers: typeof listUsers
    getUser: typeof getUser
  }

  export default _default
}

declare module '*/server/middleware/isAdmin' {
  import type { H3Event } from 'h3'
  export default function isAdmin(event: H3Event): Promise<void>
}

// Generic fallback for other server utils that may be imported via relative paths
// (no generic fallback declared to avoid wildcard pattern issues)
