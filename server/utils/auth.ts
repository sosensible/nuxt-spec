/**
 * Authentication Server Utilities
 * 
 * Helper functions for auth API routes including error mapping
 * and Appwrite error handling.
 */

import { createError, getCookie, setCookie } from 'h3'
import type { H3Error, H3Event } from 'h3'
import crypto from 'crypto'

// Appwrite server SDK (node-appwrite). Adjust if your project uses a different package name/version.
import { Client, Users, Account, Teams, AppwriteException } from 'node-appwrite'

// In-memory cache for user labels (small TTL)
const userCache = new Map<string, { labels: string[]; expiresAt: number }>()
const CACHE_TTL_MS = Number(process.env.AUTH_LABELS_CACHE_TTL_MS) || 60_000

const appwriteClient = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'http://localhost/v1')
  // cookie import intentionally omitted; we rely on event headers directly
  .setKey(process.env.APPWRITE_API_KEY || '')

/**
 * Safely set a header on the Appwrite client if the SDK exposes setHeader.
 * Wraps the call in a try/catch and logs debug info in development.
 */
function maybeSetClientHeader(name: string, value: string) {
  try {
    const setter = (appwriteClient as unknown as Record<string, unknown>).setHeader
    if (typeof setter === 'function') {
      try {
        ;(setter as Function).call(appwriteClient, name, value)
      }
      catch (err) {
        if (process.env.NODE_ENV === 'development') console.debug('[server/utils/auth] appwriteClient.setHeader threw', { name, err })
      }
    }
  }
  catch (err) {
    if (process.env.NODE_ENV === 'development') console.debug('[server/utils/auth] checking appwriteClient.setHeader failed', err)
  }
}

const appwriteUsers = new Users(appwriteClient)
const appwriteTeams = new Teams(appwriteClient)
const appwriteAccount = new Account(appwriteClient)

/**
 * Map Appwrite errors to user-friendly HTTP errors
 * 
 * @param error - Error from Appwrite SDK
 * @returns H3Error with appropriate status code and message
 */
export function mapAppwriteError(error: unknown): H3Error {
  // If it's already an H3Error, return it
  if (error && typeof error === 'object' && 'statusCode' in error) {
    return error as H3Error
  }

  // Handle Appwrite exceptions
  if (error instanceof AppwriteException) {
    const { code, message, type } = error

    // Map common Appwrite error codes to HTTP status codes
    switch (code) {
      // Authentication errors
      case 401:
        return createError({
          statusCode: 401,
          message: 'Invalid email or password',
        })

      // User already exists
      case 409:
        return createError({
          statusCode: 409,
          message: 'An account with this email already exists',
        })

      // Invalid credentials format
      case 400:
        return createError({
          statusCode: 400,
          message: message || 'Invalid request data',
        })

      // Rate limit
      case 429:
        return createError({
          statusCode: 429,
          message: 'Too many requests. Please try again later.',
        })

      // Not found
      case 404:
        return createError({
          statusCode: 404,
          message: message || 'Resource not found',
        })

      // Server errors
      case 500:
      case 503:
        return createError({
          statusCode: 500,
          message: 'Authentication service temporarily unavailable',
        })

      default:
        // Log unexpected errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Unexpected Appwrite error:', { code, type, message })
        }
        
        return createError({
          statusCode: code || 500,
          message: message || 'An error occurred during authentication',
        })
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Log unexpected errors
    if (process.env.NODE_ENV === 'development') {
      console.error('Unexpected error:', error)
    }

    return createError({
      statusCode: 500,
      message: error.message || 'Internal server error',
    })
  }

  // Fallback for unknown error types
  return createError({
    statusCode: 500,
    message: 'An unexpected error occurred',
  })
}

/**
 * Cookie configuration for session management
 */
export const SESSION_COOKIE_NAME = 'session'
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14 // 14 days in seconds

/**
 * Get cookie options for session cookie
 * 
 * @param maxAge - Maximum age in seconds (default: 14 days)
 */
export function getSessionCookieOptions(maxAge: number = SESSION_MAX_AGE) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge,
    path: '/',
  }
}

/**
 * Check if error is a Zod validation error and throw formatted H3 error
 * @param error - Unknown error to check
 * @throws H3Error with 400 status if Zod error
 * @returns false if not a Zod error
 */
export function handleZodError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    const zodError = error as unknown as { issues: Array<{ path: string[]; message: string }> }
    throw createError({
      statusCode: 400,
      message: 'Validation failed',
      data: {
        issues: zodError.issues,
      },
    })
  }
  return false
}

/**
 * Get session secret from cookie
 * @param event - H3 event object
 * @returns Session secret or undefined if not present
 */
export function getSessionFromCookie(event: H3Event): string | undefined {
  return getCookie(event, SESSION_COOKIE_NAME)
}

/**
 * Set session cookie with secure defaults
 * @param event - H3 event object
 * @param sessionSecret - Appwrite session secret to store
 */
export function setSessionCookie(event: H3Event, sessionSecret: string): void {
  setCookie(event, SESSION_COOKIE_NAME, sessionSecret, getSessionCookieOptions())
}

/**
 * Clear session cookie (for logout)
 * @param event - H3 event object
 */
export function clearSessionCookie(event: H3Event): void {
  setCookie(event, SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
}

// -------------------------
// Server-side user helper
// -------------------------

async function normalizeUserRecord(userRecord: any) {
  if (!userRecord) return null
  const id = userRecord.$id || userRecord.id
  const email = userRecord.email || userRecord.$email || null
  const prefs = userRecord.prefs || userRecord.preferences || userRecord.metadata || {}
  let labels: string[] = []
  if (Array.isArray(prefs.labels)) labels = prefs.labels.map(String)
  else if (Array.isArray(userRecord.labels)) labels = userRecord.labels.map(String)
  return { id, email, labels }
}

export async function fetchTeamDerivedLabels(userId: string): Promise<string[]> {
  try {
    if (typeof (appwriteTeams as any).listMemberships === 'function') {
      const memberships = await (appwriteTeams as any).listMemberships(userId)
      const out: string[] = []
      for (const m of (memberships?.memberships || memberships?.documents || memberships || [])) {
        const teamName = (m.teamName || m.teamId || m.team || m.$id || '').toString().toLowerCase()
        const roles = m.roles || m.role || []
        const roleList = Array.isArray(roles) ? roles : [roles]
        for (const r of roleList) {
          if (teamName) out.push(`${teamName}:${String(r)}`)
        }
      }
      return out
    }
  }
  catch (err) {
    if (process.env.NODE_ENV === 'development') console.debug('[fetchTeamDerivedLabels] error', err)
  }
  return []
}

export async function fetchUserById(userId: string) {
  try {
    const userRecord = await appwriteUsers.get(userId)
    return await normalizeUserRecord(userRecord)
  }
  catch (err) {
    if (process.env.NODE_ENV === 'development') console.debug('[fetchUserById] error fetching user', { userId, err })
    return null
  }
}

/**
 * Try to return { id, email, labels?: string[] } for the request, or null.
 * Strategy: Authorization: Bearer user:<id> (dev) or cookie-based session forwarded to Appwrite.
 */
export async function getServerUser(event: H3Event) {
  try {
    const authHeader = String(event.node.req.headers.authorization || '')
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (bearer) {
          if (bearer.startsWith('user:')) {
        const userId = bearer.split(':', 2)[1]
        if (userId) {
          const cached = userCache.get(userId)
          if (cached && cached.expiresAt > Date.now()) return { id: userId, labels: cached.labels }
              const authMod = await import('./auth')
              const base = await (authMod as any).fetchUserById(userId)
              if (!base) return null
              const teamLabels = await (authMod as any).fetchTeamDerivedLabels(userId)
          const labels = Array.from(new Set([...(base.labels || []), ...teamLabels]))
          userCache.set(userId, { labels, expiresAt: Date.now() + CACHE_TTL_MS })
          return { id: userId, email: base.email, labels }
        }
      }
      // Production JWT verification: support HS256 (shared secret) and RS256 (public key)
      try {
        const parts = bearer.split('.')
        if (parts.length === 3) {
          // Helper to decode base64url into Buffer
          const base64UrlToBuffer = (s: string) => {
            let v = s.replace(/-/g, '+').replace(/_/g, '/')
            while (v.length % 4 !== 0) v += '='
            return Buffer.from(v, 'base64')
          }

          const header = JSON.parse(base64UrlToBuffer(parts[0]!).toString('utf8'))
          const payloadBuf = base64UrlToBuffer(parts[1]!)
          const payload = JSON.parse(payloadBuf.toString('utf8'))
          const alg = header.alg

          let verified = false
          if (alg === 'HS256' && process.env.SERVER_JWT_SECRET) {
            const secret = process.env.SERVER_JWT_SECRET
            const hmac = crypto.createHmac('sha256', secret).update(parts[0] + '.' + parts[1]).digest()
            const sig = base64UrlToBuffer(parts[2]!)
            if (hmac.length === sig.length) verified = crypto.timingSafeEqual(hmac, sig)
          }
          else if (alg === 'RS256' && process.env.SERVER_JWT_PUBLIC_KEY) {
            const pub = process.env.SERVER_JWT_PUBLIC_KEY!.replace(/\\n/g, '\n')
            const verifier = crypto.createVerify('RSA-SHA256')
            verifier.update(parts[0] + '.' + parts[1])
            verifier.end()
            const sig = base64UrlToBuffer(parts[2]!)
            verified = verifier.verify(pub, sig)
          }

          if (verified) {
            // Check token timing claims
            const nowSec = Math.floor(Date.now() / 1000)
            if (payload.exp && typeof payload.exp === 'number' && nowSec >= payload.exp) {
              if (process.env.NODE_ENV === 'development') console.debug('[getServerUser] token expired', { exp: payload.exp, now: nowSec })
              throw new Error('token_expired')
            }
            if (payload.nbf && typeof payload.nbf === 'number' && nowSec < payload.nbf) {
              if (process.env.NODE_ENV === 'development') console.debug('[getServerUser] token not yet valid', { nbf: payload.nbf, now: nowSec })
              throw new Error('token_not_yet_valid')
            }

            const userId = payload.sub || payload.userId || payload.uid || payload.id
            if (userId) {
              const cached = userCache.get(String(userId))
              if (cached && cached.expiresAt > Date.now()) return { id: String(userId), labels: cached.labels }
              const authMod = await import('./auth')
              const base = await (authMod as any).fetchUserById(String(userId))
              if (!base) return null
              const teamLabels = await (authMod as any).fetchTeamDerivedLabels(String(userId))
              const labels = Array.from(new Set([...(base.labels || []), ...teamLabels]))
              userCache.set(String(userId), { labels, expiresAt: Date.now() + CACHE_TTL_MS })
              return { id: String(userId), email: base.email, labels }
            }
          }
        }
      }
      catch (err) {
        if (process.env.NODE_ENV === 'development') console.debug('[getServerUser] JWT verification failed', err)
      }
    }

    const cookieHeader = String(event.node.req.headers.cookie || '')
    if (cookieHeader) {
      try {
        maybeSetClientHeader('cookie', cookieHeader)
        const me = await appwriteAccount.get()
        const userId = me.$id
        if (userId) {
          const cached = userCache.get(userId)
          if (cached && cached.expiresAt > Date.now()) {
            maybeSetClientHeader('cookie', '')
            return { id: userId, labels: cached.labels }
          }
          const authMod = await import('./auth')
          const base = await (authMod as any).fetchUserById(userId)
          if (!base) return null
          const teamLabels = await (authMod as any).fetchTeamDerivedLabels(userId)
          const labels = Array.from(new Set([...(base.labels || []), ...teamLabels]))
          userCache.set(userId, { labels, expiresAt: Date.now() + CACHE_TTL_MS })
          maybeSetClientHeader('cookie', '')
          return { id: userId, email: base.email, labels }
        }
      }
      catch (err) {
        if (process.env.NODE_ENV === 'development') console.debug('[getServerUser] cookie-based lookup failed', err)
      }
    }
  }
  catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('[getServerUser] error', err)
  }
  return null
}
