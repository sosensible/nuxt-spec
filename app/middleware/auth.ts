/**
 * Auth middleware - Protects routes that require authentication
 * 
 * This middleware checks if the user has an active session.
 * If not authenticated, redirects to /login with returnUrl query parameter.
 * 
 * Usage: Add `definePageMeta({ middleware: 'auth' })` to protected pages
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, checkAuth } = useAuth()
  
  // Check if user has an active session
  await checkAuth()
  
  // If not authenticated, redirect to login
  if (!user.value) {
    // Build returnUrl - only allow relative paths for security
    const returnUrl = to.fullPath
    
    // Validate returnUrl is a relative path (starts with /)
    const isRelativePath = returnUrl.startsWith('/') && !returnUrl.startsWith('//')
    
    return navigateTo({
      path: '/login',
      query: {
        returnUrl: isRelativePath ? returnUrl : '/'
      }
    })
  }
})
