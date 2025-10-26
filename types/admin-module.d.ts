declare module '~/types/admin' {
  // Mirror of types/admin.ts to allow `~/types/admin` imports to resolve
  // This is an ambient declaration (no runtime output).

  export interface UserRecord {
    id: string
    email?: string
    name?: string
    status?: string
    createdAt?: string
    emailVerified?: boolean
    customAttributes?: Record<string, unknown>
    roles?: string[]
  }

  export interface TeamRecord {
    id: string
    name?: string
    description?: string
    roles?: string[]
  }

  export interface UserDetailResponse {
    item: UserRecord
    teams: TeamRecord[]
    raw?: Record<string, unknown>
  }

  export interface PagedResponse<T> {
    items: T[]
    cursor?: string | null
    totalCount?: number | null
  }

  export interface ApiError {
    error: {
      code: string | number
      message: string
    }
  }

  export interface UpdateUserPayload {
    name?: string
    email?: string
    customAttributes?: Record<string, unknown>
  }
}

