import { describe, it, expect } from 'vitest'
import { loadRules } from '../../route-config/index'

function globToRegExp(glob: string): RegExp {
  // Escape regex metacharacters safely (fixed character class)
  const escaped = glob.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const withSlashStarStarOptional = escaped.replace(/\/\\\*\\\*/g, '(?:/.*)?')
  const withStarStar = withSlashStarStarOptional.replace(/\\\*\\\*/g, '.*')
  const withStar = withStarStar.replace(/\\\*/g, '[^/]*')
  return new RegExp('^' + withStar + '$')
}

describe('rules.find matching (admin layout logic)', () => {
  it('loadRules returns objects with patterns and rules.find finds admin rule', async () => {
    const rules = await loadRules()
    expect(Array.isArray(rules)).toBe(true)
    expect(rules.length).toBeGreaterThan(0)

    // Ensure rules are objects with a pattern property
    for (const r of rules) {
      expect(typeof r).toBe('object')
      const rec = r as Record<string, unknown>
      expect(typeof rec.pattern).toBe('string')
    }

    const match = rules.find(r => globToRegExp(r.pattern).test('/admin'))
    expect(match).toBeDefined()

    const match2 = rules.find(r => globToRegExp(r.pattern).test('/admin/anything'))
    expect(match2).toBeDefined()
  })
})
