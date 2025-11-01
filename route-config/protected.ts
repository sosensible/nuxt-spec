/**
 * Protected route configuration.
 *
 * This file (and any other files placed under `route-config/`) will be
 * imported at build time by the client route guard plugin using
 * `import.meta.glob(..., { eager: true })`.
 *
 * Format: Array of rules { pattern, requireLogin?, labels? }
 * - pattern: glob-like pattern using `*` and `**` (e.g. '/admin/**')
 * - requireLogin: if true, user must be logged in
 * - labels: array of label strings; user must have at least one to pass
 * - labelsMode: 'any' (default) or 'all' - whether user must have any or all listed labels
 */

const protectedRoutes = [
  // All admin pages require a logged-in user and the 'admin' label
  {
    pattern: '/admin/**',
    requireLogin: true,
    labels: ['adminx']
  },

  // Example: a specific protected page that requires login but no label
  {
    pattern: '/test-protected',
    requireLogin: true
  },

  // Example requiring multiple labels: user must have BOTH 'admin' and 'staff'
  // This demonstrates `labelsMode: 'all'` which requires all listed labels.
  {
    pattern: '/admin/secure/**',
    requireLogin: true,
    labels: ['admin', 'staff'],
    labelsMode: 'all'
  }
]

export default protectedRoutes
