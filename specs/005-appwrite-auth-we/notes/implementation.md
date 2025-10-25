# Implementation & Planning Notes (moved from spec)

This file contains implementation-facing notes and Nuxt-specific guidance that were intentionally removed from the public-facing feature specification to keep the spec implementation-agnostic.

## Nuxt-specific considerations

- The page route `/admin/users` will need route guards to ensure only authorized operators can access it. Implement server-side or client-side guard depending on the chosen auth flow.

- Data-fetching options to consider during planning:
  - Server-side rendering (SSR) or hybrid SSR + client hydrate for initial load to improve perceived performance and allow server-side authentication checks.
  - Stale-while-revalidate strategies to keep UI snappy while ensuring data is not very stale.

## Appwrite integration notes

- The Admin UI will call Appwrite administrative APIs from a secure server-side proxy or service account. Do NOT embed admin keys in client code.
- Consider building small API routes that translate UI queries (page, filter) into Appwrite Users API calls and apply server-side permission checks.

## SEO / Indexing (backend - NFR-005)

- Admin pages (including `/admin/users`) MUST NOT be indexed by search engines. They should not be included in any public sitemaps, and responses should include appropriate directives to prevent indexing (for example, server-set headers or meta tags like `X-Robots-Tag: noindex, nofollow` or `<meta name="robots" content="noindex,nofollow">`).
- Ensure server-side rendering paths for admin routes do not emit public SEO metadata (title/meta/structured data), and omit these routes from any automated sitemap generation processes.
- Where possible, control indexing at the HTTP header level (server response) to avoid client-side omission mistakes. Document the exact header approach in the deployment checklist.

## Deployment target (NFR-006)

- The deployment target has not been selected yet. During planning select the deployment target (options include static hosting, serverless functions, or Node.js server) and document implications for authentication, server-side routes, and how Appwrite admin calls will be proxied. Defer architecture decisions that depend on the deployment target to the planning phase.

## Implementation concerns to plan for (non-exhaustive)

- Authentication: How the operator authenticates to the Admin UI and how the server validates operator permissions against Appwrite roles/teams.
- Error handling and retries for Appwrite rate limits and transient network failures.
- Pagination model mapping (Appwrite cursors vs UI offset-based paging) and how it impacts tests.
- Audit logging for edit/delete actions.

---

Notes moved from spec on 2025-10-25.
