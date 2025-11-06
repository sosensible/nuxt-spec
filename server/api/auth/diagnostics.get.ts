import { getSessionFromCookie } from '../../utils/auth'
import { createAppwriteSessionClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteUser } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  try {
    const sessionSecret = getSessionFromCookie(event)
    const headers = getRequestHeaders(event) as Record<string, string | undefined>

    // Only expose sensitive cookie contents or raw headers in development.
    // In production we return a minimal response to avoid leaking session secrets.
    const basic = {
      ok: true,
      cookiePresent: !!sessionSecret,
    } as Record<string, unknown>

    if (process.env.NODE_ENV !== 'development') {
      // Minimal, non-sensitive diagnostics in production
      return basic
    }

    // Development-only detailed diagnostics (masked)
    const devResult: Record<string, unknown> = {
      ...basic,
      // Mask cookie value to avoid full secret leak even in dev logs
      cookieValue: sessionSecret ? `${String(sessionSecret).slice(0, 8)}...` : null,
      requestCookieHeader: headers.cookie ?? null,
    }

    if (!sessionSecret) {
      return devResult
    }

    // Attempt to fetch Appwrite user with session secret
    const client = createAppwriteSessionClient(sessionSecret)
    const account = createAccountService(client)
    try {
      const appwriteUser = await account.get()
      const user = mapAppwriteUser(appwriteUser)
      devResult.user = user
    }
    catch (err: unknown) {
      const e = err as Record<string, unknown>
      devResult.userError = (e && (e.message as string | undefined)) || String(err)
    }

    return devResult
  }
  catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth diagnostics error:', err)
    }
    const e = err as Record<string, unknown>
    return { ok: false, error: (e && (e.message as string | undefined)) || String(err) }
  }
})
