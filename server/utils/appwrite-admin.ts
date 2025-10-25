import { Client, Users, Query } from 'node-appwrite'

// Minimal interface describing Users methods we rely on that may not be present in the SDK type
interface UsersAdminLike {
  list?: (queries?: unknown[]) => Promise<{ users?: unknown[]; total?: number }>
  get?: (id: string) => Promise<unknown>
  update?: (id: string, email?: string, password?: string, name?: string) => Promise<unknown>
  updatePrefs?: (id: string, prefs: Record<string, unknown>) => Promise<unknown>
  deleteSessions?: (id: string) => Promise<unknown>
  delete?: (id: string) => Promise<unknown>
}

const getClient = () => {
  const client = new Client()
  if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_API_KEY || !process.env.APPWRITE_PROJECT_ID) {
    throw new Error('Appwrite configuration missing: APPWRITE_ENDPOINT, APPWRITE_API_KEY, APPWRITE_PROJECT_ID')
  }
  client
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY)
  return client
}

export const getUsersService = () => {
  const client = getClient()
  return new Users(client)
}

// List users with optional cursor-based pagination. Returns {users, nextCursor}
export async function listUsers(
  { limit = 25, cursor, q }: { limit?: number; cursor?: string; q?: string },
  usersServiceOverride?: UsersAdminLike
) {
  const usersService = usersServiceOverride ?? getUsersService()
  // Support an opaque cursor token implemented as base64-encoded offset integer.
  const maxLimit = 100
  const normalizedLimit = Math.min(Math.max(1, Math.floor(limit ?? 25)), maxLimit)

  let offset = 0
  if (cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf8')
      offset = Number(decoded) || 0
    } catch (_e) {
      void _e
      offset = 0
    }
  }

  // Build Appwrite Query array using the modern SDK Query helpers
  const queries: string[] = []
  // If `q` provided, search common fields (email and name)
  if (q && q.trim()) {
    // `Query.search` is the modern pattern; it may search within a field
    // We include both email and name searches to increase recall.
    queries.push(Query.search('email', q))
    queries.push(Query.search('name', q))
  }

  // Pagination
  queries.push(Query.limit(normalizedLimit))
  if (offset > 0) queries.push(Query.offset(offset))

  // Call the SDK list method using queries array (current Appwrite SDK standard)
  const res = await (usersService as unknown as UsersAdminLike).list?.(queries)

  let users = (res?.users ?? []) as Array<Record<string, unknown>>

  // If a search query `q` is provided but SDK doesn't support server-side search here,
  // perform a best-effort client-side filter on common fields (name, email, $id).
  if (q && q.trim()) {
    const ql = q.toLowerCase()
    users = users.filter((u) => {
      try {
        const rec = u as Record<string, unknown>
        const id = String(rec['$id'] ?? '')
        const name = String(rec['name'] ?? '')
        const email = String(rec['email'] ?? '')
        return id.toLowerCase().includes(ql) || name.toLowerCase().includes(ql) || email.toLowerCase().includes(ql)
      } catch (_e) {
        void _e
        return false
      }
    })
  }

  // Compute nextCursor when we can infer there are more items.
  let nextCursor: string | undefined = undefined
  const total = res && typeof res.total === 'number' ? res.total : undefined
  const returned = users.length
  const consumed = (offset ?? 0) + returned
  if (typeof total === 'number' && consumed < total) {
    nextCursor = Buffer.from(String(consumed)).toString('base64')
  } else if (returned === normalizedLimit) {
    // If we don't have total but the page was full, assume there may be more
    nextCursor = Buffer.from(String((offset ?? 0) + returned)).toString('base64')
  }

  return {
    users,
    nextCursor,
  }
}

export async function getUser(id: string, usersServiceOverride?: UsersAdminLike) {
  const usersService = usersServiceOverride ?? getUsersService()
  return usersService.get?.(id)
}

type UpdateUserPayload = { name?: string; email?: string; password?: string }

export async function updateUser(id: string, payload: UpdateUserPayload, usersServiceOverride?: UsersAdminLike) {
  const usersService = usersServiceOverride ?? getUsersService()
  // Appwrite Users.update requires specific params; map simple fields here.
  // Note: mapping is conservative; callers should construct proper params per Appwrite SDK.
  const name = payload.name
  const email = payload.email
  const password = payload.password
  // Appwrite Users.update signature expects (userId, email?, password?, name?) in the modern SDK
  // Pass values or undefined to preserve existing fields when not provided.
  return (usersService as unknown as UsersAdminLike).update?.(id, email ?? undefined, password ?? undefined, name ?? undefined)
}

export async function revokeAllSessionsForUser(userId: string, usersServiceOverride?: UsersAdminLike) {
  const usersService = usersServiceOverride ?? getUsersService()
  // Appwrite SDK may have `deleteSessions` or similar; using deleteSessions for all sessions if available.
  if (typeof usersService.deleteSessions === 'function') {
    return usersService.deleteSessions(userId)
  }
  // Fallback: no-op (tests should stub this)
  return null
}

export async function deleteUser(userId: string, usersServiceOverride?: UsersAdminLike) {
  // Default delete behavior: perform a soft-delete by setting deletion metadata in user prefs
  // This is safer and reversible. Callers can still perform a hard delete by calling the SDK directly if needed.
  return markUserDeleted(userId, undefined, usersServiceOverride)
}

export async function markUserDeleted(
  userId: string,
  retentionDays?: number,
  usersServiceOverride?: UsersAdminLike
) {
  const usersService = usersServiceOverride ?? getUsersService()

  // Attempt to read existing user to preserve prefs
  const existing = typeof usersService.get === 'function' ? await usersService.get?.(userId) : undefined
  const existingPrefs = (existing && (existing as any).prefs) || {}

  const now = new Date()
  const deletedAt = now.toISOString()
  const retention = Number(retentionDays ?? Number(process.env.USER_DELETION_RETENTION_DAYS ?? 30))
  const retentionExpiresAt = new Date(now.getTime() + retention * 24 * 60 * 60 * 1000).toISOString()

  const newPrefs = {
    ...existingPrefs,
    deletedAt,
    retentionExpiresAt,
    deletedByAdmin: true,
  }

  const userSvc = usersService as unknown as Users & { updatePrefs?: (userId: string, prefs: Record<string, unknown>) => Promise<unknown> }
  if (typeof userSvc.updatePrefs === 'function') {
    return userSvc.updatePrefs(userId, newPrefs)
  }

  // Fallback: if updatePrefs isn't available but a generic update exists, try to store prefs under a `prefs` field.
  if (typeof usersService.update === 'function') {
    // Some SDKs accept (id, email?, password?, name?, prefs?) - be conservative and try passing prefs last
    // If this doesn't match the SDK, this will likely throw and surface the error to the caller.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return (usersService as any).update?.(userId, undefined, undefined, undefined, newPrefs)
  }

  // If we cannot persist deletion metadata, throw to let callers handle the failure.
  throw new Error('Users service does not support setting prefs for soft-delete')
}

// Hard delete: call the underlying SDK delete method when available
export async function hardDeleteUser(userId: string, usersServiceOverride?: UsersAdminLike) {
  const usersService = usersServiceOverride ?? getUsersService()
  if (typeof usersService.delete === 'function') {
    return usersService.delete(userId)
  }
  throw new Error('Users service does not support hard delete')
}

// Helper to set custom claims/roles - Appwrite supports user prefs or attributes; adapt per deployment
export async function setUserClaims(userId: string, claims: Record<string, unknown>, usersServiceOverride?: UsersAdminLike) {
  const usersService = usersServiceOverride ?? getUsersService()
  // Update user preferences/prefs with the provided claims. node-appwrite exposes `updatePrefs`.
  const userSvc = usersService as unknown as Users & { updatePrefs?: (userId: string, prefs: Record<string, unknown>) => Promise<unknown> }
  if (typeof userSvc.updatePrefs === 'function') {
    return userSvc.updatePrefs(userId, claims)
  }

  // Fallback: if a generic `update` exists, we can't reliably set prefs; return null to indicate unsupported
  return null
}

export async function changeUserRoles(userId: string, roles: string[]) {
  // Convenience wrapper to set roles inside prefs under `roles` key
  return setUserClaims(userId, { roles })
}

export default {
  getClient,
  getUsersService,
  listUsers,
  getUser,
  updateUser,
  revokeAllSessionsForUser,
  deleteUser,
  hardDeleteUser,
  setUserClaims,
}
