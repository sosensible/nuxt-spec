export type RouteRule = {
  pattern: string
  requireLogin?: boolean
  labels?: string[]
  labelsMode?: 'any' | 'all'
}

function globToRegExp(glob: string): RegExp {
  // Robust glob -> RegExp converter. We scan the glob and replace
  // '**' -> '.*' and '*' -> '[^/]*', escaping other regex metacharacters.
  let res = ''
  // If the glob ends with '/**', make the trailing '/**' optional so that
  // '/admin/**' matches both '/admin' and '/admin/...'
  if (glob.endsWith('/**')) {
    const prefix = glob.slice(0, -3) // remove '/**'
    // Build regex for the prefix, then allow optional trailing '/.*'
    let pre = ''
    for (let i = 0; i < prefix.length; i++) {
      const ch = prefix[i]
      if (ch === '*') {
        if (i + 1 < prefix.length && prefix[i + 1] === '*') {
          pre += '.*'
          i++
        }
        else {
          pre += '[^/]*'
        }
      }
      else {
        const meta = '\\.+?^${}()|[]'
        if (ch && meta.includes(ch)) pre += '\\' + ch
        else pre += ch || ''
      }
    }
    return new RegExp('^' + pre + '(?:/.*)?' + '$')
  }

  for (let i = 0; i < glob.length; i++) {
    const ch = glob[i]
    if (ch === '*') {
      if (i + 1 < glob.length && glob[i + 1] === '*') {
        res += '.*'
        i++
      }
      else {
        res += '[^/]*'
      }
    }
    else {
      // Escape regex metacharacters
      const meta = '\\.+?^${}()|[]'
      if (ch && meta.includes(ch)) {
        res += '\\' + ch
      }
      else {
        res += ch || ''
      }
    }
  }
  return new RegExp('^' + res + '$')
}

/**
 * Load rules from route-config using several glob fallbacks.
 * Returns an array of RouteRule.
 */
export async function loadRules(): Promise<RouteRule[]> {
  let rules: RouteRule[] = []

  // Vite's import.meta.glob requires literal patterns. Use each literal
  // pattern explicitly and merge results.
  try {
    // Load any files in the same folder (preferred). Grab the module keys so
    // we can filter out this index file and deduplicate rules by pattern.
  const modulesA = (import.meta as any).glob('./*.{ts,js,json}', { eager: true }) as Record<string, unknown>
    const entries = Object.entries(modulesA || {})
    const patternMap = new Map<string, RouteRule>()
    for (const [key, mod] of entries) {
      // ignore this index file
      if (key.includes('/index.') || key.endsWith('index.ts') || key.endsWith('index.js')) continue
      const m = mod as { default?: RouteRule[] }
      const arr = m?.default || []
      for (const r of arr) {
        if (!r || !r.pattern) continue
        // prefer first-seen rule for a given pattern
        if (!patternMap.has(r.pattern)) patternMap.set(r.pattern, r)
      }
    }
    if (patternMap.size > 0) rules = rules.concat(Array.from(patternMap.values()))
  }
  catch {
    // ignore
  }

  // As a last-resort, attempt to dynamically import a common file name
  if (rules.length === 0) {
    try {
      const mod = await import('./protected')
      if (mod?.default) {
        for (const r of mod.default as RouteRule[]) {
          if (r && r.pattern && !rules.find(rr => rr.pattern === r.pattern)) rules.push(r)
        }
      }
    }
    catch {
      // ignore
    }
  }

  if (process.env.NODE_ENV === 'development') {
    // Print the full rules as JSON to help debug missing properties (labels, etc.)
    try {
      console.debug('[route-config] final loaded rules count:', rules.length)
      // Print raw rules; catch stringify failures separately
      try {
        console.debug('[route-config] rules (raw):', JSON.parse(JSON.stringify(rules)))
      }
      catch {
        console.debug('[route-config] rules (raw) (stringify failed):', rules)
      }
      console.debug('[route-config] rules patterns:', rules.map(r => r.pattern))
    }
    catch {
      console.debug('[route-config] final loaded rules count:', rules.length)
    }
  }

  // Normalize rules to ensure shapes are consistent at runtime. This avoids cases
  // where a mis-exported object or unexpected value causes missing `labels`.
  const normalized: RouteRule[] = rules.map((r: unknown) => {
    const obj = r as Record<string, unknown>
    return {
      pattern: String(obj.pattern || ''),
      requireLogin: obj.requireLogin === true,
      labels: Array.isArray(obj.labels) ? (obj.labels as unknown[]).map(String) : undefined,
      labelsMode: obj.labelsMode === 'all' ? 'all' : 'any',
    }
  })

  return normalized
}

export function matchRule(path: string, rules: RouteRule[]): RouteRule | undefined {
  // Prefer the most specific rule when multiple patterns match the same path.
  // Specificity heuristic: number of non-wildcard characters (higher = more specific),
  // then longer pattern length as a tie-breaker.
  const sorted = rules.slice().sort((a, b) => {
    const aScore = (a.pattern || '').replace(/\*/g, '').length
    const bScore = (b.pattern || '').replace(/\*/g, '').length
    if (bScore !== aScore) return bScore - aScore
    return (b.pattern || '').length - (a.pattern || '').length
  })
  return sorted.find(r => globToRegExp(r.pattern).test(path))
}

export function evaluateLabels(rule: RouteRule | undefined, userLabels: readonly string[] = []): boolean {
  if (!rule || !rule.labels || rule.labels.length === 0) return true
  const mode = rule.labelsMode || 'any'
  if (mode === 'all') return rule.labels!.every(lbl => userLabels.includes(lbl))
  return rule.labels!.some(lbl => userLabels.includes(lbl))
}

/**
 * Check access for a given path and user context.
 * This is a reusable helper that can be called from middleware, plugins
 * or layouts. It loads rules (if needed), finds the matching rule, and
 * evaluates authentication and label requirements.
 */
export async function checkAccessForPath(path: string, user: { labels?: readonly string[] } | null) {
  const rules = await loadRules()
  const match = matchRule(path, rules)

  // If the rule requires login but user is not present, deny
  if (match?.requireLogin && !user) {
    return { allowed: false, reason: 'not_authenticated' as const, rule: match }
  }

  // Evaluate labels
  const userLabels = user?.labels || []
  const labelsOk = evaluateLabels(match, userLabels)
  if (!labelsOk) {
    return { allowed: false, reason: 'missing_labels' as const, rule: match }
  }

  return { allowed: true, reason: 'ok' as const, rule: match }
}

export default {
  loadRules,
  matchRule,
  evaluateLabels,
}
