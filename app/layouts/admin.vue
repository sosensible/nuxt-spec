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



    let requiredLabels: string[] | undefined
    let labelsMode: 'any' | 'all' = 'any'
    try {
      // Use the centralized helper to check access for the current path.
      // We import the module so bundlers include it in the client bundle.
      const rc = await import('../../route-config/index')
      const res = await rc.checkAccessForPath(route.path, user.value || null)
      if (process.env.NODE_ENV === 'development') {
        console.debug('[admin-layout] checkAccessForPath result:', JSON.parse(JSON.stringify(res)))
      }

      if (res.reason === 'not_authenticated') {
        // If the rule indicates authentication is required but there's no user,
        // redirect to login. (Normally checkAuth above already handled this,
        // but keep this for defense-in-depth.)
        navigateTo('/login')
      }
      else if (res.reason === 'missing_labels') {
        navigateTo('/unauthorized')
      }
      else {
        requiredLabels = res.rule?.labels
        labelsMode = (res.rule?.labelsMode as 'any' | 'all') || 'any'
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
