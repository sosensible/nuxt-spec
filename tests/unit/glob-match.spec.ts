import { describe, it, expect } from 'vitest'
import { matchRule, type RouteRule } from '../../route-config/index'

describe('glob pattern matching', () => {
  const rules: RouteRule[] = [
    { pattern: '/admin/**' }
  ]

  it('matches /admin', () => {
    const found = matchRule('/admin', rules)
    expect(found).toBeDefined()
  })

  it('matches /admin/', () => {
    const found = matchRule('/admin/', rules)
    expect(found).toBeDefined()
  })

  it('matches subpaths like /admin/anything', () => {
    const found = matchRule('/admin/anything', rules)
    expect(found).toBeDefined()
  })

  it('does not match /administrator', () => {
    const found = matchRule('/administrator', rules)
    expect(found).toBeUndefined()
  })
})
