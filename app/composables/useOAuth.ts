/**
 * OAuth Composable
 *
 * Provides OAuth authentication functionality for GitHub and other providers.
 * Handles OAuth flow initiation, error handling, and loading states.
 *
 * @example
 * const { loading, loginWithGitHub, getOAuthErrorMessage } = useOAuth()
 *
 * // Initiate GitHub login
 * await loginWithGitHub()
 *
 * // Handle OAuth error from URL
 * const errorCode = route.query.error
 * if (errorCode) {
 *   const message = getOAuthErrorMessage(errorCode)
 * }
 *
 * @returns {Object} OAuth utilities
 * @returns {Readonly<Ref<boolean>>} loading - Loading state during OAuth flow
 * @returns {Readonly<Ref<string>>} error - Error message if OAuth fails
 * @returns {Function} loginWithGitHub - Initiates GitHub OAuth flow
 * @returns {Function} getOAuthErrorMessage - Maps error codes to user-friendly messages
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
      // Include the current route path as returnTo so the server can forward the user back to it after OAuth
      const route = useRoute()
      const returnTo = route.fullPath || undefined
      const response = await $fetch<{ url: string }>('/api/auth/oauth/github', {
        params: returnTo ? { returnTo } : undefined,
      })
      
      // Redirect to GitHub OAuth
      window.location.href = response.url
    } catch (err: unknown) {
      loading.value = false
      // Prefer server-provided message when available (h3/createError -> message)
      let serverMessage: string | undefined
      if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>
        const data = e.data as Record<string, unknown> | undefined
        serverMessage = (data && data.message) as string | undefined || (e.message as string | undefined)
      }
      error.value = serverMessage ? String(serverMessage) : 'Failed to initiate GitHub login. Please try again.'
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
