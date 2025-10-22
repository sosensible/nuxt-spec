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
    
    // Redirect to login with error message
    return sendRedirect(event, `/login?error=${encodeURIComponent('GitHub authorization was denied or failed. Please try again.')}`)
  }

  const userId = query.userId as string | undefined
  const secret = query.secret as string | undefined

  // Validate required parameters
  if (!userId || !secret) {
    console.error('Missing OAuth parameters:', { userId: !!userId, secret: !!secret })
    return sendRedirect(event, `/login?error=${encodeURIComponent('Invalid OAuth callback. Please try again.')}`)
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
    
    // Redirect to login with error
    return sendRedirect(event, `/login?error=${encodeURIComponent('Failed to complete GitHub login. Please try again.')}`)
  }
})
