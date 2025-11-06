/**
 * Authentication Type Definitions
 * 
 * Shared TypeScript interfaces for authentication system.
 * These types are used across composables, API routes, and pages.
 */

/**
 * User account information
 */
export interface User {
  /** Unique user identifier (Appwrite $id) */
  id: string
  /** User's email address (unique, lowercase) */
  email: string
  /** User's display name */
  name: string
  /** Whether email has been verified */
  emailVerified: boolean
  /** Avatar URL (from GitHub OAuth or custom) */
  avatar?: string
  /** Optional application labels (mapped from Appwrite labels) */
  labels?: string[]
  /** Registration provider */
  provider: 'email' | 'github'
  /** Account creation timestamp */
  createdAt: Date
}

/**
 * Authentication session
 */
export interface Session {
  /** Unique session identifier (Appwrite $id) */
  id: string
  /** User ID this session belongs to */
  userId: string
  /** Authentication provider used for this session */
  provider: 'email' | 'github'
  /** Session expiration timestamp */
  expiresAt: Date
  /** Whether this is the current active session */
  current: boolean
  /** Session creation timestamp */
  createdAt: Date
}

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

/**
 * Appwrite User Model (from SDK)
 * Read-only interface for data received from Appwrite
 */
export interface AppwriteUser {
  $id: string
  $createdAt: string
  $updatedAt: string
  email: string
  name: string
  emailVerification: boolean
  phone: string
  phoneVerification: boolean
  prefs: Record<string, unknown>
  labels: string[]
  status: boolean
  registration: string
}

/**
 * Appwrite Session Model (from SDK)
 * Read-only interface for data received from Appwrite
 */
export interface AppwriteSession {
  $id: string
  $createdAt: string
  userId: string
  expire: string
  provider: string
  providerUid: string
  providerAccessToken: string
  providerAccessTokenExpiry: string
  providerRefreshToken: string
  ip: string
  osCode: string
  osName: string
  osVersion: string
  clientType: string
  clientCode: string
  clientName: string
  clientVersion: string
  clientEngine: string
  clientEngineVersion: string
  deviceName: string
  deviceBrand: string
  deviceModel: string
  countryCode: string
  countryName: string
  current: boolean
}

/**
 * Map Appwrite User to Application User
 * 
 * @param appwriteUser - User object from Appwrite SDK
 * @returns Mapped user object for application use
 * 
 * @example
 * const user = mapAppwriteUser(await account.get())
 */
export function mapAppwriteUser(appwriteUser: AppwriteUser): User {
  const avatar = typeof appwriteUser.prefs?.avatar === 'string' ? appwriteUser.prefs.avatar : undefined
  
  return {
    id: appwriteUser.$id,
    email: appwriteUser.email,
    name: appwriteUser.name,
    emailVerified: appwriteUser.emailVerification,
    avatar,
    labels: appwriteUser.labels || [],
    provider: appwriteUser.labels?.includes('oauth:github') ? 'github' : 'email',
    createdAt: new Date(appwriteUser.$createdAt),
  }
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
export function mapAppwriteSession(appwriteSession: AppwriteSession): Session {
  return {
    id: appwriteSession.$id,
    userId: appwriteSession.userId,
    provider: appwriteSession.provider as 'email' | 'github',
    expiresAt: new Date(appwriteSession.expire),
    current: appwriteSession.current,
    createdAt: new Date(appwriteSession.$createdAt),
  }
}
