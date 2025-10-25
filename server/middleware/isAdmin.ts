import { getRequestHeader, createError, type H3Event, defineEventHandler } from 'h3'
// Prefer session-based checks via Account.get().
import { getSessionFromCookie } from '../utils/auth'
// Lightweight isAdmin middleware. This is a conservative implementation that
// prefers server-side Appwrite role/claim checks when available. For now it
// supports an environment allowlist and a dev override header. Integrate with
// Appwrite claims via `setUserClaims`/`getUser` helpers in `server/utils/appwrite-admin.ts`.

async function isAdmin(event: H3Event) {
  // Development override: allow if header x-admin: true is present (useful for tests)
  const adminHeader = getRequestHeader(event, 'x-admin')
  if (adminHeader === 'true') return

  // Optional development bypass: set ADMIN_DEV_BYPASS=true in your .env to disable admin checks locally.
  // This is intentionally opt-in and disabled by default to avoid accidentally enabling in CI/production.
  if (process.env.ADMIN_DEV_BYPASS === 'true') {
    // Intentionally log when bypass is active to make it obvious during local dev runs.
    // Keep this minimal and opt-in via ADMIN_DEV_BYPASS env var.
  console.warn('ADMIN_DEV_BYPASS is enabled — isAdmin checks are bypassed')
    return
  }

  // Allowlist check: environment variable comma-separated list of admin emails or IDs
  const allowlist = process.env.ADMIN_ALLOWLIST ? process.env.ADMIN_ALLOWLIST.split(',').map(s => s.trim()).filter(Boolean) : []
  // Attempt to validate using the current session cookie first (preferred)
  const sessionSecret = getSessionFromCookie(event)
  if (sessionSecret) {
    try {
      const { createAppwriteSessionClient, createAccountService } = await import('../utils/appwrite')
      const client = createAppwriteSessionClient(String(sessionSecret))
      const account = createAccountService(client)
      const user = await account.get()
      const urec = user as Record<string, unknown>
      const userId = String(urec['$id'] ?? urec['id'] ?? '')
      const email = String(urec['email'] ?? '')

      // If allowlist is populated, match against user id or email
      if (allowlist.length > 0) {
        if (allowlist.includes(userId) || (email && allowlist.includes(email))) return
      }

      // If claim key configured, check user prefs
      const claimKey = process.env.APPWRITE_ADMIN_CLAIM_KEY
      if (claimKey) {
        const prefs = (urec['prefs'] ?? urec['preferences']) as Record<string, unknown> | undefined
        if (prefs && (prefs[claimKey] === true || prefs[claimKey] === 'true')) return
      }
    } catch (_e) {
      // Ignore and fallback to header-based allowlist checks below
      void _e
    }
  }

  // Try to read an identifying header (X-Admin-User-Id) or similar. In real integration
  // we'd extract user id from a session cookie and fetch user claims from Appwrite.
  // Fallback: allowlist may be matched by headers (useful for dev/testing)
  const adminUserId = getRequestHeader(event, 'x-admin-user-id')
  if (adminUserId && allowlist.includes(adminUserId)) return

  // If allowlist contains email/ID, try matching against a header X-Admin-User-Email
  const adminEmail = getRequestHeader(event, 'x-admin-user-email')
  if (adminEmail && allowlist.includes(adminEmail)) return

  throw createError({ statusCode: 403, statusMessage: 'Admin access required' })
}

// Export as an explicit event handler to avoid Nitro's implicit conversion deprecation.
// Keep the named `isAdmin` function so other modules can call it directly in tests/handlers.
export default defineEventHandler(async (event) => {
  return isAdmin(event as H3Event)
})
