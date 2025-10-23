/**
 * Guest Middleware
 * 
 * Redirects authenticated users away from guest-only pages (login, register).
 * Prevents authenticated users from accessing authentication forms.
 * 
 * @description
 * This middleware:
 * - Checks authentication status via useAuth().checkAuth()
 * - Redirects authenticated users to home page or custom destination
 * - Supports optional redirect query parameter for custom destinations
 * - Validates redirect URLs to prevent open redirect vulnerabilities
 * 
 * @security
 * - Only allows relative paths for redirect (no external redirects)
 * - Prevents protocol-relative URLs (starting with //)
 * - Uses safeRedirectUrl utility for validation
 * 
 * @example
 * ```vue
 * <script setup>
 * definePageMeta({
 *   middleware: 'guest'
 * })
 * </script>
 * ```
 * 
 * @see {@link ~/composables/useAuth.ts} - Authentication composable
 * @see {@link ~/middleware/auth.ts} - Opposite middleware for protected pages
 * @see {@link ~/utils/redirect.ts} - Redirect validation utilities
 */

export default defineNuxtRouteMiddleware(async (to) => {
  const { user, checkAuth } = useAuth()
  
  // Check if user has an active session
  await checkAuth()
  
  // If authenticated, redirect away from guest-only pages
  if (user.value) {
    // Check for custom redirect destination in query parameter
    const redirect = to.query.redirect as string | undefined
    
    // Validate redirect is a safe relative path (prevent open redirect attacks)
    const destination = safeRedirectUrl(redirect)
    
    return navigateTo(destination)
  }
  
  // User is not authenticated, allow access to guest-only page
})
