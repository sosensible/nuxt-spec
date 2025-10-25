import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const OLD_ENV = process.env

describe('purgeScheduler plugin', () => {
  let origSetInterval: typeof setInterval

  beforeEach(() => {
    origSetInterval = global.setInterval
    vi.restoreAllMocks()
    process.env = { ...OLD_ENV }
  })

  afterEach(() => {
    process.env = OLD_ENV
    // restore native setInterval
    ;(global as unknown as { setInterval: typeof setInterval }).setInterval = origSetInterval
  })

  it('does not schedule when disabled', async () => {
    process.env.ENABLE_SCHEDULED_PURGES = 'false'
    process.env.NODE_ENV = 'production'

    const setIntervalMock = vi.fn()
    ;(global as unknown as { setInterval: typeof setInterval }).setInterval = setIntervalMock as unknown as typeof setInterval

  // @ts-expect-error mocked import: module is provided by runtime / test mocks
  const plugin = (await import('../../../server/plugins/purge-scheduler.server')).default
    plugin({})

    expect(setIntervalMock).not.toHaveBeenCalled()
  })

  it('schedules when enabled and production with provided interval', async () => {
    process.env.ENABLE_SCHEDULED_PURGES = 'true'
    process.env.NODE_ENV = 'production'
    process.env.SCHEDULED_PURGE_INTERVAL_MS = '1234'

    const setIntervalMock = vi.fn((_fn: () => void, _ms: number) => {
      // return a fake timer id
      return 1 as unknown as number
    })

    // stub worker and admin helpers before importing plugin
    vi.mock('../../../server/utils/purge-worker', () => ({
      purgeExpiredDeletedUsers: vi.fn().mockResolvedValue({ attempted: 0, deleted: [], errors: [] }),
    }))

    vi.mock('../../../server/utils/appwrite-admin', () => ({
      listUsers: vi.fn(),
      hardDeleteUser: vi.fn(),
    }))

    ;(global as unknown as { setInterval: typeof setInterval }).setInterval = setIntervalMock as unknown as typeof setInterval

  // @ts-expect-error mocked import: module is provided by runtime / test mocks
  const plugin = (await import('../../../server/plugins/purge-scheduler.server')).default
    plugin({})

    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 1234)
  })
})
