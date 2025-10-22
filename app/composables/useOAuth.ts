/**
 * OAuth Composable
 * 
 * Provides OAuth authentication functionality for GitHub and other providers.
 * Handles OAuth flow initiation, error handling, and loading states.
 */

export const useOAuth = () => {
  const loading = ref(false)
  const error = ref<string>('')

  /**
   * Initiates GitHub OAuth flow
   * Fetches OAuth URL from server and redirects user to GitHub
   */
  async function loginWithGitHub() {
    loading.value = true
    error.value = ''

    try {
      const response = await $fetch<{ url: string }>('/api/auth/oauth/github')
      
      // Redirect to GitHub OAuth
      window.location.href = response.url
    } catch (err) {
      loading.value = false
      error.value = 'Failed to initiate GitHub login. Please try again.'
      console.error('GitHub OAuth error:', err)
      throw err
    }
  }

  /**
   * Gets user-friendly error message from OAuth error code
   */
  function getOAuthErrorMessage(errorCode: string): string {
    const errorMessages: Record<string, string> = {
      'access_denied': 'GitHub authorization was denied or failed. Please try again.',
      'oauth_failed': 'OAuth authentication failed. Please try again.',
      'invalid_callback': 'Invalid OAuth callback. Please try again.',
      'session_failed': 'Failed to complete GitHub login. Please try again.',
    }

    return errorMessages[errorCode] || 'An unexpected error occurred during OAuth. Please try again.'
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    loginWithGitHub,
    getOAuthErrorMessage,
  }
}
