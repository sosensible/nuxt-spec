/**
 * Redirect Utilities
 * 
 * Shared utilities for safe URL redirection in middleware and composables.
 * Prevents open redirect vulnerabilities by validating redirect URLs.
 */

/**
 * Validates if a URL is a safe relative path for redirection
 * 
 * @description
 * A URL is considered safe if:
 * - It starts with '/' (relative path)
 * - It does NOT start with '//' (protocol-relative URL)
 * 
 * This prevents open redirect attacks where an attacker could redirect
 * users to external malicious sites.
 * 
 * @param url - The URL to validate
 * @returns true if URL is a safe relative path, false otherwise
 * 
 * @example
 * ```typescript
 * isRelativePath('/dashboard')        // true - safe relative path
 * isRelativePath('/admin/users')      // true - safe relative path
 * isRelativePath('//evil.com')        // false - protocol-relative URL
 * isRelativePath('https://evil.com')  // false - absolute URL
 * isRelativePath('javascript:alert()') // false - dangerous protocol
 * ```
 * 
 * @security
 * Used by auth and guest middleware to prevent open redirect vulnerabilities
 * 
 * @see {@link https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html}
 */
export function isRelativePath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//')
}

/**
 * Safely constructs a redirect URL, validating against open redirect attacks
 * 
 * @param url - The requested redirect URL
 * @param fallback - Fallback URL if the requested URL is unsafe (default: '/')
 * @returns A safe redirect URL
 * 
 * @example
 * ```typescript
 * safeRedirectUrl('/dashboard', '/')         // '/dashboard'
 * safeRedirectUrl('//evil.com', '/')         // '/'
 * safeRedirectUrl('https://evil.com', '/')   // '/'
 * safeRedirectUrl('', '/home')               // '/home'
 * ```
 */
export function safeRedirectUrl(url: string | undefined, fallback = '/'): string {
  if (!url) return fallback
  return isRelativePath(url) ? url : fallback
}
