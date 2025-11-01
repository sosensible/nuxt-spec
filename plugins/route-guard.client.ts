import type { RouteLocationNormalized } from 'vue-router'

type RouteRule = {
  pattern: string
  requireLogin?: boolean
  labels?: string[]
  /**
   * Mode for label checks. 'any' = user must have at least one label. 'all' = user must have all labels.
   * Defaults to 'any' for backward compatibility when omitted.
   */
  labelsMode?: 'any' | 'all'
}

/**
 * Convert a simple glob pattern (/admin/**, /foo/*) to RegExp.
 * Supports `**` => any characters, `*` => any chars except '/'.
 */
function globToRegExp(glob: string): RegExp {
  // Escape regex special chars (standard safe implementation)
  // Special-case trailing '/**' so '/admin/**' matches both '/admin' and '/admin/...'
  if (glob.endsWith('/**')) {
    const prefix = glob.slice(0, -3)
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

  let res = ''
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
      const meta = '\\.+?^${}()|[]'
      if (ch && meta.includes(ch)) res += '\\' + ch
      else res += ch || ''
    }
  }
  return new RegExp('^' + res + '$')
}

export default defineNuxtPlugin(() => {
  const router = useRouter()
  const auth = useAuth()

  // Load rules via shared route-config module
  let rules: RouteRule[] = []
  try {
    // Use dynamic import so Vite/Nuxt can optimize the module when possible
    const rc = await import('../route-config/index')
    rules = await rc.loadRules()
    if (process.env.NODE_ENV === 'development') {
      console.debug('[route-guard] loaded rules count:', rules.length)
      console.debug('[route-guard] patterns:', rules.map((r: RouteRule) => r.pattern))
    }
  }
  catch {
    // If shared module can't be loaded, fallback to previous behavior
    rules = []
  }

  let compiled = rules.map(r => ({
    ...r,
    regex: globToRegExp(r.pattern),
  })) as Array<RouteRule & { regex: RegExp }>
  let rulesLoaded = compiled.length > 0

  // Router guard
  router.beforeEach(async (to: RouteLocationNormalized) => {
    // If no rules were found via static glob, attempt a dynamic import of a
    // well-known file `route-config/protected.ts` on first navigation. This
    // helps in environments where import.meta.glob didn't match during build.
    if (!rulesLoaded) {

      try {
        // dynamic import relative to this file
        // Attempt to import protected config directly. Try a few fallbacks
        let loaded: { default: RouteRule[] } | null = null
        try {
          // try relative
          loaded = (await import('../route-config/protected.ts'))
        }
        catch {
          try {
            // try root
            loaded = (await import('/route-config/protected.ts'))
          }
          catch {
            // ignore
          }
        }

        if (loaded?.default && loaded.default.length > 0) {
          rules.push(...loaded.default)
          compiled = rules.map(r => ({ ...r, regex: globToRegExp(r.pattern) })) as Array<RouteRule & { regex: RegExp }>
          rulesLoaded = true
          if (process.env.NODE_ENV === 'development') {
            console.debug('[route-guard] dynamically loaded rules:', loaded.default.map(r => r.pattern))
          }
        }
      }
      catch {
        // ignore dynamic import failures
      }
    }
    // Ensure server/session state is loaded
    try {
      await auth.checkAuth()
    }
    catch {
      // ignore - checkAuth will set user to null on failure
    }

    const path = to.path

    for (const r of compiled) {
      if (r.regex.test(path)) {
        if (process.env.NODE_ENV === 'development') {
          console.debug('[route-guard] matched rule', r.pattern, 'for path', path)
          console.debug('[route-guard] user labels', auth.user.value?.labels)
        }
        // require login
        if (r.requireLogin && !auth.user.value) {
          const redirect = encodeURIComponent(to.fullPath || to.path)
          return navigateTo(`/login?redirect=${redirect}`)
        }

        // label checks
        if (r.labels && r.labels.length > 0) {
          const userLabels = auth.user.value?.labels || []
          const mode = (r.labelsMode || 'any')
          let ok = false
          if (mode === 'all') {
            // require every label to be present on the user
            ok = r.labels.every(lbl => userLabels.includes(lbl))
          }
          else {
            // default: require at least one matching label
            ok = r.labels.some(lbl => userLabels.includes(lbl))
          }

          if (!ok) {
            return navigateTo('/unauthorized')
          }
        }

        // matched rule processed; stop checking further rules
        break
      }
    }
  })
})
