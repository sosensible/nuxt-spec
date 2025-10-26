declare module '~/types/admin' {
  // Mirror of types/admin.ts provided as an ambient module under `app/`
  // so Nuxt's TypeScript pipeline will include it during typecheck.

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
