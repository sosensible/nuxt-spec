import { hardDeleteUser, listUsers } from '../../server/utils/appwrite-admin'

export type PurgeResult = {
  attempted: number
  deleted: string[]
  errors: Array<{ userId: string; error: string }>
}

/**
 * Purge soft-deleted users whose retention has expired.
 *
 * The worker will call `listUsers` to obtain users with deletion metadata
 * in prefs and then hard-delete those whose `prefs.retentionExpiresAt` <= now.
 *
 * Options allow injecting a test double for appwrite-admin functions.
 */
export async function purgeExpiredDeletedUsers(options?: {
  appwriteAdmin?: {
    listUsers?: typeof listUsers
    hardDeleteUser?: typeof hardDeleteUser
  }
  now?: Date
  batchLimit?: number
}): Promise<PurgeResult> {
  const admin = options?.appwriteAdmin ?? { listUsers, hardDeleteUser }
  const now = options?.now ?? new Date()
  const batchLimit = options?.batchLimit ?? 100

  const deleted: string[] = []
  const errors: Array<{ userId: string; error: string }> = []
  let attempted = 0

  // Find candidate users: we ask listUsers for soft-deleted users.
  // The query format is implementation-dependent; in tests we mock listUsers directly.
  const res = await admin.listUsers?.({ limit: batchLimit })
  const candidates: Array<Record<string, unknown>> = (res as unknown as { data?: Array<Record<string, unknown>> })?.data ?? []

  for (const u of candidates) {
    attempted += 1
    try {
  const prefs = (u.prefs ?? {}) as Record<string, unknown>
      const retention = prefs.retentionExpiresAt
      if (!retention) continue
      const retentionDate = new Date(String(retention))
      if (isNaN(retentionDate.getTime())) continue
      if (retentionDate <= now) {
        const id = String((u as { $id?: unknown }).$id ?? '')
        if (!id) throw new Error('missing id')
        await admin.hardDeleteUser?.(id)
        deleted.push(id)
      }
    } catch (err) {
      const msg = err && typeof err === 'object' && 'message' in err ? String((err as { message?: unknown }).message) : String(err)
      const id = String((u as { $id?: unknown }).$id ?? '')
      errors.push({ userId: id || '<unknown>', error: msg ?? 'unknown' })
    }
  }

  return { attempted, deleted, errors }
}

export default purgeExpiredDeletedUsers
