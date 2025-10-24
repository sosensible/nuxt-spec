# Research: User Administration - Appwrite Users

## Decision: Use Appwrite JavaScript SDK on server-side

Rationale:
- The Appwrite JavaScript SDK provides a stable, typed API that abstracts REST details and handles auth, sessions, and client interactions. Using the SDK server-side keeps API keys and secrets off the browser and simplifies error handling and type mapping.
- Stubbing/mocking the SDK in unit tests is straightforward and avoids fragile HTTP mocks.

Alternatives considered:
- Direct REST calls to Appwrite: provides parity but increases boilerplate and error-prone signing; requires asking user permission before using REST. Rejected in favor of SDK.

## Decision: Server-side API adapter pattern

Rationale:
- Composables and client code will call our server API routes (e.g., `/api/admin/users`) which act as thin adapters to the Appwrite SDK. This ensures SSR safety (no browser-only APIs on server), centralizes admin authorization checks, and makes unit testing easier.

Alternatives:
- Calling Appwrite SDK directly in composables (client or server): rejected because it risks exposing keys or leaking implementation into clients.

## Decision: Unit tests + API contract tests only (no E2E)

Rationale:
- Per project constraints, focus on Vitest + Nuxt Test Utils. API contract tests will mock the Appwrite SDK and validate server endpoints' behavior. Playwright E2E tests remain disabled for now.

## Decision: Use Nuxt UI 4 components where applicable

Rationale:
- Use `UCard`, `UButton`, `UTable` (or `UList`), `UForm`, `UAlert`, and other Nuxt UI primitives rather than Tailwind utilities where a Nuxt UI equivalent exists. This keeps style consistent and reduces custom CSS.

## Technical unknowns and clarifications

1. Team management API surface in Appwrite — kept optional for initial delivery. If the Appwrite SDK lacks team endpoints we can omit or mock in tests.

2. Admin authorization model — assumed server middleware can identify admin flag on requests (e.g., via session cookie). If missing, we will add a server-only `isAdmin` guard that reads user roles from a trusted session.

No further action required in Phase 0; decisions recorded and will guide API contracts and implementation.
