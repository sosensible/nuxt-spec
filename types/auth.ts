/**
 * Authentication Type Definitions
 * 
 * Shared TypeScript interfaces for authentication system.
 * These types are used across composables, API routes, and pages.
 */

// `User` and `Session` are provided via `types/shared.d.ts` (global declarations).

/**
 * Authentication response from API
 */
export interface AuthResponse {
  /** Authenticated user information */
  user: User
  /** Session information (omitted for some endpoints) */
  session?: Session
}

/**
 * Login request payload
 */
export interface LoginRequest {
  /** User's email address */
  email: string
  /** User's password */
  password: string
}

/**
 * Registration request payload
 */
export interface RegisterRequest {
  /** User's display name */
  name: string
  /** User's email address */
  email: string
  /** User's password (min 8 chars with complexity requirements) */
  password: string
}

/**
 * Password reset request payload
 */
export interface PasswordResetRequest {
  /** Email address to send reset link to */
  email: string
}

/**
 * Password reset confirmation payload
 */
export interface PasswordResetConfirmRequest {
  /** User ID from reset link */
  userId: string
  /** Secret token from reset link */
  secret: string
  /** New password */
  password: string
  /** Password confirmation (must match password) */
  passwordConfirm: string
}

/**
 * Email verification request payload
 */
export interface EmailVerificationRequest {
  /** User ID from verification link */
  userId: string
  /** Secret token from verification link */
  secret: string
}

/**
 * Error response from API
 */
export interface ErrorResponse {
  /** Error code/type */
  error: string
  /** User-friendly error message */
  message: string
}

// `AppwriteUser` and `AppwriteSession` are declared in `types/shared.d.ts` for global usage.

/**
 * Map Appwrite User to Application User
 * 
 * @param appwriteUser - User object from Appwrite SDK
 * @returns Mapped user object for application use
 * 
 * @example
 * const user = mapAppwriteUser(await account.get())
 */
export function mapAppwriteUser(appwriteUser: unknown): User {
  interface RawAppwriteUser {
    $id: string
    $createdAt: string
    email?: string
    name?: string
    emailVerification?: boolean
    prefs?: Record<string, unknown>
    labels?: string[]
  }
  const au = appwriteUser as RawAppwriteUser
  const avatar = typeof au.prefs?.avatar === 'string' ? au.prefs.avatar : undefined

  return {
    id: au.$id,
    email: au.email,
    name: au.name,
    emailVerified: !!au.emailVerification,
    avatar,
    provider: au.labels?.includes('oauth:github') ? 'github' : 'email',
    // store ISO string to match application store expectations
    createdAt: new Date(au.$createdAt).toISOString(),
  } as User
}

/**
 * Map Appwrite Session to Application Session
 * 
 * @param appwriteSession - Session object from Appwrite SDK
 * @returns Mapped session object for application use
 * 
 * @example
 * const session = mapAppwriteSession(await account.getSession('current'))
 */
export function mapAppwriteSession(appwriteSession: unknown): Session {
  interface RawAppwriteSession {
    $id: string
    $createdAt: string
    userId: string
    expire: string
    provider: string
    current: boolean
  }
  const asess = appwriteSession as RawAppwriteSession
  return {
    id: asess.$id,
    userId: asess.userId,
    provider: asess.provider as 'email' | 'github',
    expiresAt: new Date(asess.expire).toISOString(),
    current: asess.current,
    createdAt: new Date(asess.$createdAt).toISOString(),
  } as Session
}
