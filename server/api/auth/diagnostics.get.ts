import { getSessionFromCookie } from '../../utils/auth'
import { createAppwriteSessionClient, createAccountService } from '../../utils/appwrite'
import { mapAppwriteUser } from '../../../types/auth'

export default defineEventHandler(async (event) => {
  try {
    const sessionSecret = getSessionFromCookie(event)
    const headers = getRequestHeaders(event) as Record<string, string | undefined>

    const result: Record<string, unknown> = {
      ok: true,
      cookiePresent: !!sessionSecret,
      cookieValue: sessionSecret ?? null,
      requestCookieHeader: headers.cookie ?? null,
    }

    if (!sessionSecret) {
      return result
    }

    // Attempt to fetch Appwrite user with session secret
    const client = createAppwriteSessionClient(sessionSecret)
    const account = createAccountService(client)
    try {
      const appwriteUser = await account.get()
      const user = mapAppwriteUser(appwriteUser)
      result.user = user
    }
    catch (err: unknown) {
      const e = err as Record<string, unknown>
      result.userError = (e && (e.message as string | undefined)) || String(err)
    }

    return result
  }
  catch (err: unknown) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Auth diagnostics error:', err)
    }
    const e = err as Record<string, unknown>
    return { ok: false, error: (e && (e.message as string | undefined)) || String(err) }
  }
})
