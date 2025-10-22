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

export default defineEventHandler(async (_event) => {
  try {
    const config = useRuntimeConfig()
    const baseUrl = config.public.appUrl || 'http://localhost:3000'
    
    // Success and failure callback URLs
    const successUrl = `${baseUrl}/api/auth/callback/github`
    const failureUrl = `${baseUrl}/login?error=oauth_failed`

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
    console.error('GitHub OAuth initiation error:', error)
    
    throw createError({
      statusCode: 500,
      message: 'Failed to initiate GitHub OAuth',
    })
  }
})
