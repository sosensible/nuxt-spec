import { describe, it, expect } from 'vitest'
import { loadRules, matchRule } from '../../route-config/index'

describe('route-config loader', () => {
  it('loads rules from protected.ts and preserves labels', async () => {
    const rules = await loadRules()
    expect(Array.isArray(rules)).toBe(true)

    const adminRule = rules.find(r => r.pattern === '/admin/**')
    expect(adminRule).toBeDefined()
    expect(adminRule?.labels).toBeDefined()
    expect(adminRule?.labels).toContain('adminx')
  })

  it('matchRule finds the admin rule for /admin and /admin/anything', async () => {
    const rules = await loadRules()
    const m1 = matchRule('/admin', rules)
    expect(m1).toBeDefined()
    const m2 = matchRule('/admin/anything', rules)
    expect(m2).toBeDefined()
  })
})
