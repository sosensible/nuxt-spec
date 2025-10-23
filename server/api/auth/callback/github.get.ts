/**
 * GitHub OAuth Callback Route
 * 
 * Handles the callback from GitHub OAuth.
 * Creates a session and redirects to home or shows error.
 * 
 * @route GET /api/auth/callback/github
 * @query userId - User ID from Appwrite
 * @query secret - OAuth secret from Appwrite  
 * @query error - OAuth error if authorization failed
 * @returns Redirects to home page or login with error
 */

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Check for OAuth error
  if (query.error) {
    const errorMessage = String(query.error)
    console.error('GitHub OAuth error:', errorMessage)
    
    // Map OAuth error to user-friendly error code
    const errorCode = errorMessage === 'access_denied' ? 'access_denied' : 'oauth_failed'
    
    // Redirect to login with error code
    return sendRedirect(event, `/login?error=${errorCode}`)
  }

  const userId = query.userId as string | undefined
  const secret = query.secret as string | undefined

  // Validate required parameters
  if (!userId || !secret) {
    console.error('Missing OAuth parameters:', { userId: !!userId, secret: !!secret })
    return sendRedirect(event, '/login?error=invalid_callback')
  }

  try {
    // Create session with OAuth token
    const { createAppwriteClient, createAccountService } = await import('../../../utils/appwrite')
    
    const client = createAppwriteClient()
    const account = createAccountService(client)

    // Create session from OAuth
    const session = await account.createSession(userId, secret)

    // Ensure session secret exists
  const sessionObj = session as { secret?: string; $id?: string } | undefined
  const sessionSecret = (sessionObj && (sessionObj.secret || sessionObj.$id)) || undefined
    if (!sessionSecret) {
      console.error('No session secret returned from Appwrite:', session)
      return sendRedirect(event, '/login?error=session_failed')
    }

    // Use shared helper to set session cookie with consistent options
    const { setSessionCookie } = await import('../../../utils/auth')
    setSessionCookie(event, sessionSecret as string)

  // Build an absolute redirect back to the frontend. If a validated returnTo was provided to the initiation step,
  // the initiation step included it on the Appwrite success URL and Appwrite has returned it to us; forward it after creating session.
  const config = useRuntimeConfig()
  const baseUrl = config.public.appUrl || 'http://localhost:3000'
  const incomingReturnTo = query.returnTo as string | undefined
  const safeReturnTo = (incomingReturnTo && incomingReturnTo.startsWith('/') && !incomingReturnTo.startsWith('//')) ? incomingReturnTo : '/'
  return sendRedirect(event, `${baseUrl}${safeReturnTo}`)
  } catch (error: unknown) {
    console.error('OAuth session creation error:', error)
    
    // Redirect to login with error code
    return sendRedirect(event, '/login?error=session_failed')
  }
})
