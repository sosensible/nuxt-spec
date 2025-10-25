import { defineEventHandler, readBody, createError } from 'h3'
import { revokeAllSessionsForUser } from '../../../../utils/appwrite-admin'
import isAdmin from '../../../../middleware/isAdmin'

// Simple exponential-backoff sleep used for retries (keeps tests fast)
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isTransientError(err: unknown) {
  const msg = String(err && (err as any).message ? (err as any).message : err)
  return /ECONNRESET|ETIMEDOUT|timeout|429|503|502|Transient/i.test(msg)
}

// Revoke all sessions for a user - handler usable directly by tests
export async function revokeSessionsHandler(
  userId: string,
  options?: { retries?: number; baseBackoffMs?: number }
) {
  if (!userId || typeof userId !== 'string' || !userId.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  const maxAttempts = options?.retries ?? 3
  const baseBackoff = options?.baseBackoffMs ?? 5
  let attempt = 0

  while (true) {
    attempt += 1
    try {
      await revokeAllSessionsForUser(userId)
      return { success: true, attempts: attempt }
    } catch (err) {
      // If the error looks transient and we have attempts left, retry with backoff
      const transient = isTransientError(err)
      if (!transient || attempt >= maxAttempts) {
        // Map to a 502 for server-side revocation failures
        throw createError({ statusCode: 502, statusMessage: String((err as any)?.message ?? 'Failed to revoke sessions') })
      }

      // small exponential backoff
      const delay = baseBackoff * Math.pow(2, attempt - 1)
      // keep tests fast by not using long delays
      await sleep(delay)
      // continue loop to retry
    }
  }
}

export default defineEventHandler(async (event) => {
  // Ensure caller is admin
  await isAdmin(event)

  // Try to get user id from route params or body
  // Nitro places route params on event.context.params
  // Fallback to body { userId }
  const params = (event as any).context?.params as Record<string, string> | undefined
  let userId = params?.id
  if (!userId) {
    const body = await readBody(event)
    userId = body?.userId
  }

  if (!userId) throw createError({ statusCode: 400, statusMessage: 'User ID is required' })

  const result = await revokeSessionsHandler(userId)
  // audit removed per project scope — no-op
  return { status: 200, ...result }
})
