/**
 * GitHub OAuth Initiation Route
 * 
 * Generates the GitHub OAuth URL using Appwrite SDK.
 * Returns the URL for client-side redirect to GitHub.
 * 
 * @route GET /api/auth/oauth/github
 * @returns { url: string } - GitHub OAuth URL
 * @throws 500 - Server error
 */

import { createAppwriteClient, createAccountService } from '../../../utils/appwrite'
import { OAuthProvider } from 'node-appwrite'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const baseUrl = config.public.appUrl || 'http://localhost:3000'

    // Read optional returnTo from caller and validate it (allow only safe relative paths)
    const query = getQuery(event)
    const returnTo = (query.returnTo as string | undefined) || undefined

    const isSafeReturnTo = (p: string | undefined) => {
      if (!p) return false
      // Must start with a single slash, not protocol or //, and no newline characters
      if (!p.startsWith('/')) return false
      if (p.startsWith('//')) return false
      if (p.includes('://')) return false
      if (p.includes('\n') || p.includes('\r')) return false
      // Keep length reasonable
      if (p.length > 2048) return false
      return true
    }

    const validReturnTo = isSafeReturnTo(returnTo) ? returnTo : undefined

    // Success and failure callback URLs (server callback). If returnTo validated, include it so server can forward after session creation.
    const successUrl = validReturnTo ? `${baseUrl}/api/auth/callback/github?returnTo=${encodeURIComponent(validReturnTo)}` : `${baseUrl}/api/auth/callback/github`
    const failureUrl = validReturnTo ? `${baseUrl}/login?error=oauth_failed&returnTo=${encodeURIComponent(validReturnTo)}` : `${baseUrl}/login?error=oauth_failed`

    // Validate Appwrite environment configuration before calling SDK
    const endpoint = process.env.APPWRITE_ENDPOINT
    const projectId = process.env.APPWRITE_PROJECT_ID
    const apiKey = process.env.APPWRITE_API_KEY

    if (!endpoint || !projectId || !apiKey) {
      console.error('Appwrite configuration missing for OAuth initiation', { endpoint, projectId, apiKey: !!apiKey })
      throw createError({
        statusCode: 500,
        message:
          'Server misconfigured: missing Appwrite environment variables (APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY).',
      })
    }

    // Create admin client for OAuth
    const client = createAppwriteClient()
    const account = createAccountService(client)

    // Generate OAuth URL
    const redirectUrl = await account.createOAuth2Token(
      OAuthProvider.Github,
      successUrl,
      failureUrl
    )

    return {
      url: redirectUrl,
    }
  } catch (error: unknown) {
    // Log full error for server debugging
    console.error('GitHub OAuth initiation error:', error)

    // Include underlying error message in the response for local debugging
  const underlying = error && typeof error === 'object' && 'message' in (error as Record<string, unknown>) ? (error as Record<string, unknown>).message as string : String(error)

    throw createError({
      statusCode: 500,
      message: `Failed to initiate GitHub OAuth${underlying ? `: ${underlying}` : ''}`,
    })
  }
})
