import { describe, it, expect, vi, afterEach } from 'vitest'
import * as rc from '../../route-config/index'

describe('checkAccessForPath', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('denies access when requireLogin and user is not authenticated', async () => {
    vi.spyOn(rc, 'loadRules').mockResolvedValue([
      { pattern: '/admin/**', requireLogin: true, labels: ['admin'] },
    ])

    const res = await rc.checkAccessForPath('/admin', null)
    expect(res.allowed).toBe(false)
    expect(res.reason).toBe('not_authenticated')
  })

  it('denies access when user is missing required labels', async () => {
    vi.spyOn(rc, 'loadRules').mockResolvedValue([
      { pattern: '/admin/**', requireLogin: true, labels: ['admin'] },
    ])

    const res = await rc.checkAccessForPath('/admin', { labels: ['user'] })
    expect(res.allowed).toBe(false)
    expect(res.reason).toBe('missing_labels')
  })

  it('allows access when user has required labels', async () => {
    vi.spyOn(rc, 'loadRules').mockResolvedValue([
      { pattern: '/admin/**', requireLogin: true, labels: ['admin'] },
    ])

    const res = await rc.checkAccessForPath('/admin', { labels: ['admin'] })
    expect(res.allowed).toBe(true)
    expect(res.reason).toBe('ok')
  })

  it('allows access for public routes even when unauthenticated', async () => {
    vi.spyOn(rc, 'loadRules').mockResolvedValue([
      { pattern: '/public/**' },
    ])

    const res = await rc.checkAccessForPath('/public', null)
    expect(res.allowed).toBe(true)
    expect(res.reason).toBe('ok')
  })
})
