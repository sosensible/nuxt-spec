/**
 * Auth Middleware
 * 
 * Protects routes requiring authentication. Redirects unauthenticated users
 * to the login page with a return URL parameter.
 * 
 * @description
 * This middleware:
 * - Checks authentication status via useAuth().checkAuth()
 * - Redirects unauthenticated users to /login
 * - Preserves the original URL as returnUrl query parameter
 * - Validates returnUrl to prevent open redirect vulnerabilities
 * 
 * @security
 * - Only allows relative paths for returnUrl (no external redirects)
 * - Prevents protocol-relative URLs (starting with //)
 * - Uses safeRedirectUrl utility for validation
 * 
 * @example
 * ```vue
 * <script setup>
 * definePageMeta({
 *   middleware: ['auth']
 * })
 * </script>
 * ```
 * 
 * @see {@link ~/composables/useAuth.ts} - Authentication composable
 * @see {@link ~/middleware/guest.ts} - Opposite middleware for guest-only pages
 * @see {@link ~/utils/redirect.ts} - Redirect validation utilities
 */

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, checkAuth } = useAuth()
  
  // Check if user has an active session
  await checkAuth()
  
  // If not authenticated, redirect to login with return URL
  if (!user.value) {
    const returnUrl = to.fullPath
    
    // Validate returnUrl is a safe relative path (prevent open redirect attacks)
    const safeReturnUrl = safeRedirectUrl(returnUrl)
    
    return navigateTo({
      path: '/login',
      query: { returnUrl: safeReturnUrl },
    })
  }
  
  // User is authenticated, allow access to protected route
})
