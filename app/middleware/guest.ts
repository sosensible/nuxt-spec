/**
 * Guest middleware - Redirects authenticated users away from guest-only pages
 * 
 * This middleware checks if the user is already authenticated.
 * If authenticated, redirects to home page or custom redirect destination.
 * 
 * Usage: Add `definePageMeta({ middleware: 'guest' })` to login/register pages
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { user, checkAuth } = useAuth()
  
  // Check if user has an active session
  await checkAuth()
  
  // If authenticated, redirect away from guest-only pages
  if (user.value) {
    // Check for custom redirect destination in query
    const redirect = to.query.redirect as string | undefined
    
    // Validate redirect is a relative path (starts with /) for security
    const isRelativePath = redirect?.startsWith('/') && !redirect.startsWith('//')
    
    return navigateTo(isRelativePath ? redirect : '/')
  }
})
