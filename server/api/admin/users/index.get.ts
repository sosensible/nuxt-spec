import { defineEventHandler, getQuery, createError } from 'h3'
import { listUsers as appwriteListUsers } from '../../../utils/appwrite-admin'
import isAdmin from '../../../middleware/isAdmin'

export interface ListUsersResult {
  data: Array<Record<string, unknown>>
  nextCursor?: string
}

export async function listUsersHandler(params: { limit?: number; cursor?: string; q?: string }): Promise<ListUsersResult> {
  const { limit = 25, cursor, q } = params
  // Validate limit bounds
  const maxLimit = 100
  const normalizedLimit = Math.min(Math.max(1, Math.floor(limit ?? 25)), maxLimit)

  // Strict cursor validation: if cursor is provided it must be a base64-encoded non-negative integer offset
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8')
      if (!/^[0-9]+$/.test(decoded)) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid cursor parameter' })
      }
      const val = Number(decoded)
      if (!Number.isFinite(val) || val < 0) {
        throw createError({ statusCode: 400, statusMessage: 'Invalid cursor parameter' })
      }
    } catch (err) {
      // If Buffer decoding throws or validation fails, surface a 400 error
      const e = err as { statusCode?: number }
      if (e?.statusCode === 400) throw err
      throw createError({ statusCode: 400, statusMessage: 'Invalid cursor parameter' })
    }
  }

  // Delegate to appwrite admin helper (it will handle cursor decoding and q filtering)
  const res = await appwriteListUsers({ limit: normalizedLimit, cursor, q })
  // Normalize response to expected contract
  return {
    data: (res.users ?? []) as Array<Record<string, unknown>>,
    nextCursor: res.nextCursor,
  }
}

export default defineEventHandler(async (event) => {
  // Ensure the caller is an admin. `isAdmin` throws when not authorized.
  await isAdmin(event)

  const query = getQuery(event)
  const limit = query.limit ? Number(query.limit) : undefined
  const cursor = (query.cursor as string) || undefined
  const q = (query.q as string) || undefined

  const result = await listUsersHandler({ limit, cursor, q })
  return { status: 200, ...result }
})
