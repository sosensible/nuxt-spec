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

    // Set session cookie
    setCookie(event, 'session', session.secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    // Redirect to home page
    return sendRedirect(event, '/')
  } catch (error: unknown) {
    console.error('OAuth session creation error:', error)
    
    // Redirect to login with error code
    return sendRedirect(event, '/login?error=session_failed')
  }
})
