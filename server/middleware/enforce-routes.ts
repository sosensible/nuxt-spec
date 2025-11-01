import type { H3Event } from 'h3'
import { checkAccessForPath } from '../../route-config/index'

// Whitelist paths that should always be publicly accessible
const WHITELIST = [
  '/login',
  '/register',
  '/auth',
  '/unauthorized',
  '/verify-email',
  '/password-reset',
  '/favicon.ico',
]

function isWhitelisted(path: string) {
  if (!path) return false
  for (const p of WHITELIST) {
    if (p.endsWith('/')) {
      if (path.startsWith(p)) return true
    }
    else {
      if (path === p || path.startsWith(p + '/')) return true
    }
  }
  // common asset prefixes
  if (path.startsWith('/_nuxt') || path.startsWith('/_assets') || path.startsWith('/api/auth')) return true
  return false
}

function isApiRequest(event: H3Event) {
  const accept = (event.node.req.headers['accept'] || '') as string
  if (accept.includes('application/json')) return true
  const url = event.node.req.url || ''
  return url.startsWith('/api/')
}

async function tryGetServerUser(event: H3Event) {
  // Try to import a project-defined server auth helper if present.
  // Use the relative path to avoid resolving into Nuxt internal aliases which
  // can cause the dev server bundler to attempt to load non-existent files.
  try {
    const mod = await import('../../server/utils/auth').catch(() => null)
    if (mod && typeof mod.getServerUser === 'function') {
      return await mod.getServerUser(event)
    }
  }
  catch (err) {
    if (process.env.NODE_ENV === 'development') console.debug('[enforce-routes] import ../../server/utils/auth failed', err)
  }

  // No server helper found; return null (unauthenticated)
  return null
}

export default defineEventHandler(async (event: H3Event) => {
  try {
    const host = (event.node.req.headers.host as string) || 'localhost'
    const rawUrl = event.node.req.url || '/'
    const url = new URL(rawUrl, `http://${host}`)
    const path = url.pathname

    // Skip static/assets and whitelisted routes
    if (isWhitelisted(path)) return

    // Attempt to get the authenticated user on the server
    const user = await tryGetServerUser(event)

    // Run the centralized check
    const res = await checkAccessForPath(path, user)

    if (!res.allowed) {
      // If API request: return JSON 401/403
      if (isApiRequest(event)) {
        if (res.reason === 'not_authenticated') {
          throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
        }
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
      }

      // Otherwise (page request): redirect to login or unauthorized
      if (res.reason === 'not_authenticated') {
        const redirectTo = '/login?redirect=' + encodeURIComponent(rawUrl)
        return sendRedirect(event, redirectTo)
      }

      return sendError(event, createError({ statusCode: 403, statusMessage: 'Forbidden' }))
    }

    // allowed -> continue
  }
  catch (err) {
    // In case of unexpected error, do not leak internal details. In development
    // it's helpful to log the error so issues can be diagnosed.
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('[enforce-routes] middleware error:', err)
    }
    // Allow request to continue on unexpected failures rather than block all traffic.
    // If you prefer fail-closed semantics, re-throw the error here.
    return
  }
})
