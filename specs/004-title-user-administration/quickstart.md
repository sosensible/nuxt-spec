# Quickstart: Admin User Management (Developer)

This quickstart shows how to run unit tests and start local development for the User Administration feature.

Prerequisites

- Node.js matching project setup (see root package.json)
- An Appwrite project with an API key that has user management permissions (store this in `.env` during local dev)
- Environment variables (add to `.env`):
  - APPWRITE_ENDPOINT
  - APPWRITE_PROJECT_ID
  - APPWRITE_API_KEY  # server-side admin key (keep secret)

Run locally

1. Install deps:

```pwsh
pnpm install
```

2. Run typecheck and unit tests:

```pwsh
npm run typecheck
npm test
```

Notes

- Use the Appwrite JavaScript SDK only from server-side API routes. Unit tests should mock the SDK methods rather than calling the real service.
- E2E tests are intentionally disabled for this feature's CI. Focus on Vitest and API contract tests.
