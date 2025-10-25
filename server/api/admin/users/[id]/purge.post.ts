import { defineEventHandler, readBody, createError } from 'h3'
import type { H3Event } from 'h3'
import { hardDeleteUser } from '../../../../utils/appwrite-admin'
import isAdmin from '../../../../middleware/isAdmin'

export default defineEventHandler(async (event: H3Event) => {
  // Ensure caller is admin
  await isAdmin(event)

  const params = (event as unknown as { context?: { params?: Record<string, string> } }).context?.params
  const userId = params?.id
  if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID is required' })

  // Gate hard-delete behind an environment variable
  const enabled = (process.env.ADMIN_ALLOW_HARD_DELETE === 'true') || (process.env.ADMIN_FORCE_HARD_DELETE === 'true')
  if (!enabled) throw createError({ statusCode: 403, statusMessage: 'Hard delete is disabled' })

  // Require explicit confirmation in body { confirm: true } or query param ?force=true
  // readBody() expects event.node.req; in unit tests event may be a minimal object.
  // Try to read the body, but fall back to event.context.body or an empty object when unavailable.
  let body: unknown = (event as unknown as { __body?: unknown; context?: { body?: unknown } }).__body ?? (event as unknown as { context?: { body?: unknown } }).context?.body
  if (!body) {
    try {
      // Prefer readBody when running in Nitro/h3 runtime
      body = await readBody(event)
    } catch {
      // Fallback to empty object for tests that don't provide a full request
      body = {}
    }
  }
  const bodyObj = body as { confirm?: unknown }
  const confirmFromBody = bodyObj?.confirm === true
  const queryForce = (event as unknown as { context?: { query?: Record<string, unknown> } }).context?.query?.force
  const confirmFromQuery = String(queryForce) === 'true'
  if (!confirmFromBody && !confirmFromQuery) {
    throw createError({ statusCode: 400, statusMessage: 'Missing confirmation (confirm=true or ?force=true)' })
  }

  try {
    await hardDeleteUser(userId)
    return { status: 200, success: true }
  } catch (err) {
    const msg = err && typeof err === 'object' && 'message' in err ? (err as { message?: unknown }).message : undefined
    throw createError({ statusCode: 502, statusMessage: String(msg ?? 'Failed to hard-delete user') })
  }
})
