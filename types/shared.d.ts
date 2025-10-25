// Shared global types used across the app and module declaration files.
// Keep these minimal and stable so tests and ambient declarations can reference them.

export {}

declare global {
  /** Appwrite SDK user shape (partial) */
  interface AppwriteUser {
    $id: string
    $createdAt: string
    $updatedAt: string
    email: string
    name?: string
    emailVerification?: boolean
    phone?: string
    phoneVerification?: boolean
    prefs?: Record<string, unknown>
    labels?: string[]
    status?: boolean
    registration?: string
  }

  /** Application-level mapped user */
  interface User {
    id: string
    email: string
    name?: string
    emailVerified?: boolean
    avatar?: string
    provider?: 'email' | 'github'
    createdAt?: string
  }

  interface Session {
    id: string
    userId: string
    provider: 'email' | 'github'
    expiresAt: string
    current: boolean
    createdAt: string
  }
}
