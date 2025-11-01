import { describe, it, expect } from 'vitest'
import { matchRule, evaluateLabels } from '../../route-config/index'
import type { RouteRule } from '../../route-config/index'

describe('route-config utilities', () => {
  const rules: RouteRule[] = [
    { pattern: '/admin/**', requireLogin: true, labels: ['adminx'] },
    { pattern: '/admin/secure/**', requireLogin: true, labels: ['admin', 'staff'], labelsMode: 'all' },
  ]

  it('matches rules by glob pattern', () => {
    const r1 = matchRule('/admin/users', rules)
    expect(r1).toBeDefined()
    expect(r1?.pattern).toBe('/admin/**')

    const r2 = matchRule('/admin/secure/area', rules)
    expect(r2).toBeDefined()
    expect(r2?.pattern).toBe('/admin/secure/**')
  })

  it('evaluates labelsMode any correctly', () => {
    const rule = rules[0]
    expect(evaluateLabels(rule, ['adminx'])).toBe(true)
    expect(evaluateLabels(rule, ['admin'])).toBe(false)
  })

  it('evaluates labelsMode all correctly', () => {
    const rule = rules[1]
    expect(evaluateLabels(rule, ['admin', 'staff'])).toBe(true)
    expect(evaluateLabels(rule, ['admin'])).toBe(false)
  })
})
