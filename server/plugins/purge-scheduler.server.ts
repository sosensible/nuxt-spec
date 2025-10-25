import { purgeExpiredDeletedUsers } from '../utils/purge-worker'
import { listUsers, hardDeleteUser } from '../utils/appwrite-admin'

const DEFAULT_INTERVAL_MS = 24 * 60 * 60 * 1000 // 24 hours

type NitroAppLike = {
  hooks?: { hook?: (name: string, fn: () => void) => void }
  [k: string]: unknown
}

/**
 * Simple Nitro plugin that schedules the purge worker on a fixed interval.
 * Activation:
 * - Set ENABLE_SCHEDULED_PURGES=true to enable scheduling.
 * - By default scheduling only runs in production (NODE_ENV=production).
 * - To allow scheduling in non-production for QA/testing, set SCHEDULED_PURGES_ALLOW_NON_PROD=true.
 * Interval can be overridden with SCHEDULED_PURGE_INTERVAL_MS (milliseconds).
 */
export default function purgeScheduler(nitroApp?: NitroAppLike) {
  const allowNonProd = process.env.SCHEDULED_PURGES_ALLOW_NON_PROD === 'true'
  const enabled = process.env.ENABLE_SCHEDULED_PURGES === 'true' && (process.env.NODE_ENV === 'production' || allowNonProd)
  if (!enabled) {
    return
  }

  const intervalMs = Number(process.env.SCHEDULED_PURGE_INTERVAL_MS) || DEFAULT_INTERVAL_MS

  const timer = setInterval(async () => {
    try {
      console.info('[purge-scheduler] starting purge job')
      await purgeExpiredDeletedUsers({ appwriteAdmin: { listUsers, hardDeleteUser }, now: new Date() })
      console.info('[purge-scheduler] purge job finished')
    } catch (err: unknown) {
      console.error('[purge-scheduler] purge job error', err)
    }
  }, intervalMs)

  // Attach timer to nitroApp for potential cleanup in tests or shutdown hooks
  try {
    if (nitroApp && typeof nitroApp.hooks === 'object' && typeof nitroApp.hooks?.hook === 'function') {
      nitroApp.hooks!.hook!('close', () => clearInterval(timer))
    } else if (nitroApp) {
      ;(nitroApp as Record<string, unknown>)['_purgeSchedulerTimer'] = timer
    }
  } catch (e) {
    // ignore hook attach failures
    console.warn('[purge-scheduler] unable to attach shutdown hook', e)
  }
}
