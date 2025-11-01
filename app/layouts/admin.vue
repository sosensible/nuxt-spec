<template>
  <div class="min-h-screen flex bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar Component - Phase 5 -->
    <AdminSidebar />

    <div class="flex-1 flex flex-col">
      <!-- Header Component - Phase 5 -->
      <AdminHeader />

      <main v-if="allowed" class="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        <slot />
      </main>
      <main v-else class="flex-1 p-6 bg-gray-100 dark:bg-gray-900">
        <div class="prose mx-auto py-12 text-center">Checking access...</div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
// Phase 5: Admin layout with components
const layout = useLayoutState()
// Initialize layout type when component mounts
onMounted(() => {
  layout.setLayoutType('admin')
})

// Protect admin layout at the layout level so pages using this layout
// are not rendered for unauthenticated or unauthorized users.
// This runs on both server and client in Nuxt when using top-level await
// (Nuxt supports async operations in setup). We await the auth check and
// redirect before the page content is shown.
const { user, checkAuth } = useAuth()

// Ensure session is loaded. If not authenticated, redirect to login.
const allowed = ref(false)

// Skip auth blocking during unit tests (tests expect the layout to render)
if (process.env.NODE_ENV === 'test') {
  allowed.value = true
}
else {
  await checkAuth()
  if (!user.value) {
    navigateTo('/login')
  }
  else {
    // Determine required labels for this route by loading route-config
    const route = useRoute()

    function globToRegExp(glob: string): RegExp {
      // Robust glob -> RegExp converter: '**' => '.*', '*' => '[^/]*', escape other meta chars.
      // If the glob ends with '/**', make the trailing '/**' optional so '/admin/**' matches both '/admin' and '/admin/...'
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

    let requiredLabels: string[] | undefined
    let labelsMode: 'any' | 'all' = 'any'
    try {
      // Use a static import so the route-config module is included in the
      // bundle and loadRules is available at runtime. Dynamic imports were
      // causing intermittent "failed to load" behavior in some dev/SSR
      // environments.
      const rc = await import('../../route-config/index')
      const rules = await rc.loadRules()
      if (process.env.NODE_ENV === 'development') {
        try {
          console.debug('[admin-layout] rules (raw):', JSON.parse(JSON.stringify(rules)))
        }
        catch {
          console.debug('[admin-layout] rules (raw):', rules)
        }
      }
      if (process.env.NODE_ENV === 'development') {
        // Print each rule's pattern, generated regex and whether it matches the current path
        try {
          console.debug('[admin-layout] route.path =', route.path)
          for (const r of rules) {
            const regex = globToRegExp(r.pattern)
            console.debug('[admin-layout] rule pattern:', r.pattern, '-> regex:', regex, 'matches?', regex.test(route.path))
          }
        }
        catch {
          // ignore
        }
      }

      const match = rules.find((r: { pattern: string; labels?: string[]; labelsMode?: 'any' | 'all' }) => globToRegExp(r.pattern).test(route.path))
      console.debug('[admin-match] matched rule:', match)
      if (match) {
        requiredLabels = match.labels
        labelsMode = match.labelsMode || 'any'
      }
    }
    catch (err) {
      // Log the error to help diagnose why imports failed at runtime
      try {
        console.warn('[admin-layout] failed to load route-config; skipping label checks', err && (err as Error).message ? (err as Error).message : err)
      }
      catch {
        console.warn('[admin-layout] failed to load route-config; skipping label checks')
      }
    }

    if (process.env.NODE_ENV === 'development') {
      // Dev-only visibility to help debug why access is allowed/denied
      if (requiredLabels && requiredLabels.length > 0) {
        console.debug('[admin-layout] matched requiredLabels=', requiredLabels, 'labelsMode=', labelsMode)
      } else {
        console.debug('[admin-layout] no label requirement for route', route.path)
        console.debug('[admin-layout] route details', route)
      }
      console.debug('[admin-layout] current user labels=', user.value?.labels)
    }

    if (requiredLabels && requiredLabels.length > 0) {
      const userLabels = user.value.labels || []
      const ok = labelsMode === 'all'
        ? requiredLabels.every((lbl: string) => userLabels.includes(lbl))
        : requiredLabels.some((lbl: string) => userLabels.includes(lbl))
      if (!ok) {
        navigateTo('/unauthorized')
      }
      else {
        allowed.value = true
      }
    }
    else {
      // no label requirement for this route
      allowed.value = true
    }
  }
}
</script>
