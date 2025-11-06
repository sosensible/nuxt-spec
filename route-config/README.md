# Authorization guide — route-config

This document explains how to code against the project's route/page authorization system.
The central source-of-truth is the `route-config` module. It loads rule files from `route-config/*.ts|.js|.json` and exposes a small set of helpers you can call from plugins, layouts, middleware, server handlers and tests.

## Goals / contract

- Provide a single canonical rule source (patterns + metadata) that can be used across client and server.
- Expose a tiny, well-typed helper `checkAccessForPath(path, user)` that returns a structured result so callers can decide how to respond (redirect, throw, return 403, etc.).
- Keep matching logic simple: glob-like patterns against `route.path` (e.g. `/admin/**`).

## Rule format

Each file under `route-config/` should `export default` an array of rules. A rule has this shape:

```ts
export type RouteRule = {
  pattern: string; // e.g. '/admin/**' or '/test-protected'
  requireLogin?: boolean; // if true, user must be logged in
  labels?: string[]; // list of labels required (see labelsMode)
  labelsMode?: "any" | "all"; // 'any' = user needs at least one label (default). 'all' = user must have all labels
};
```

Example `route-config/protected.ts`:

```ts
export default [
  { pattern: "/admin/**", requireLogin: true, labels: ["admin"] },
  {
    pattern: "/admin/secure/**",
    requireLogin: true,
    labels: ["admin", "staff"],
    labelsMode: "all",
  },
  { pattern: "/test-protected", requireLogin: true },
];
```

Notes:

- Patterns use a simple glob subset. `**` matches any characters (including `/`) and `*` matches any characters except `/`.
- Patterns that end with `/**` are treated specially: `/admin/**` will match both `/admin` and `/admin/anything` (the trailing segment is optional). This avoids accidentally excluding the top-level route.

## APIs exported by `route-config/index.ts`

- `loadRules(): Promise<RouteRule[]>`

  - Eagerly loads rule files from `route-config/*.ts|.js|.json`, normalizes them and returns the array.

- `matchRule(path: string, rules: RouteRule[]): RouteRule | undefined`

  - Returns the first rule whose compiled glob matches `path`.

- `evaluateLabels(rule: RouteRule | undefined, userLabels: readonly string[] = []): boolean`

  - Returns true if no label requirement is present or the user labels satisfy the rule's label requirement.

- `checkAccessForPath(path: string, user: { labels?: readonly string[] } | null): Promise<{ allowed: boolean; reason: 'ok'|'not_authenticated'|'missing_labels'; rule?: RouteRule }>`
  - Loads rules (if required), finds the matching rule for `path` and evaluates authentication/labels.
  - Returns a structured result:
    - `allowed: true` and `reason: 'ok'` when access is permitted.
    - `allowed: false` and `reason: 'not_authenticated'` when the rule required login but user is null.
    - `allowed: false` and `reason: 'missing_labels'` when user is present but lacks required labels.

## Usage examples

### 1) Client route guard (already implemented)

The client plugin delegates checks to `checkAccessForPath` before navigation. If the result indicates `not_authenticated` it redirects to login (preserving redirect param). If `missing_labels` it redirects to `/unauthorized`.

This keeps the plugin small and delegates the rule loading/matching logic to the shared module.

### 2) Layout-level defense (already implemented)

Layouts (for example `app/layouts/admin.vue`) call `checkAccessForPath(route.path, user)` in setup before rendering content. This is defense-in-depth in case a page is accidentally navigated to while client guard didn't fire.

Example (conceptual):

```ts
const res = await checkAccessForPath(route.path, user.value || null);
if (res.reason === "not_authenticated") navigateTo("/login");
else if (res.reason === "missing_labels") navigateTo("/unauthorized");
else allowed = true;
```

### 3) Server middleware / API endpoints

To prevent server-side data leaks, call `checkAccessForPath()` in server middleware or route handlers and respond with a 302/401/403 as appropriate before rendering.

Example runtime middleware (sketch):

```ts
// server/middleware/enforce-routes.ts
import { checkAccessForPath } from "~/route-config";
export default defineEventHandler(async (event) => {
  const path = getRequestPath(event); // whatever you use to get url
  const user = await getServerUser(event); // your auth logic
  const res = await checkAccessForPath(path, user);
  if (!res.allowed) {
    if (res.reason === "not_authenticated")
      return sendRedirect(event, "/login");
    return sendError(
      event,
      createError({ statusCode: 403, statusMessage: "Forbidden" })
    );
  }
});
```

### 4) Programmatic checks (actions beyond pages)

You can use `checkAccessForPath` to gate non-route items too. For example, if you want to check access to a resource by path before performing a batch job, call it programmatically and branch behavior based on the result.

## Testing guidance

- `checkAccessForPath` is intentionally easy to unit-test. In tests you can `vi.spyOn(routeConfigModule, 'loadRules').mockResolvedValue([...])` to return deterministic rules and assert the helper's result.
- The repo contains tests under `tests/unit/` that mock `loadRules()` and verify `checkAccessForPath()` behaviour for different label/login cases.

Run tests locally:

```pwsh
pnpm install
pnpm -s test
```

## Debugging tips

- In development mode the loader prints debug information (`[route-config] rules (raw):` and `patterns:`). Use the console logs to verify the final normalized rules.
- If a pattern doesn't behave as expected, check the pattern's normalized version and the `glob -> RegExp` semantics:
  - `*` matches anything except `/`.
  - `**` matches anything including `/`.
  - Trailing `/**` is optional (so `/admin/**` matches `/admin`).
- If rules are seemingly not present at runtime, ensure `route-config` files are in `route-config/` and have `export default` arrays. Vite's `import.meta.glob` requires literal glob patterns; the loader uses a literal import and a fallback `./protected` import for resilience.

## Full-URL matching

The helpers match on `route.path` (the path portion, e.g. `/admin`). If you need to validate complete absolute URLs (e.g. when checking external origins or logs), use a custom regex. Example of the equivalent full-URL regex for `/admin` paths:

```
^https?:\/\/[^\/]+(:\d+)?\/admin(?:\/.*)?$
```

If you need this behavior in the codebase, we can add an optional `matchFullUrl` utility or an option to `checkAccessForPath` to toggle full-URL matching.

## JWT verification (server)

The server helper `getServerUser(event)` supports verifying production JWTs so you can authenticate API/page requests without a round-trip to Appwrite for every request.

Supported verification modes

- HS256 (HMAC) — set `SERVER_JWT_SECRET` to the shared secret used to sign tokens.
- RS256 (RSA) — set `SERVER_JWT_PUBLIC_KEY` to the PEM public key used to verify RSA-signed tokens.

How it works

- The middleware or helper looks for an `Authorization: Bearer <token>` header.
- If a valid JWT is present, the server verifies the signature (HS256 or RS256). After verification the payload is parsed and the helper looks for the user identifier in one of these claims: `sub`, `userId`, `uid`, or `id`.
- If a userId is found the server fetches the user record and derived labels (including team-derived labels) and returns the normalized `{ id, email?, labels }` object used by `checkAccessForPath`.

Recommended JWT claims and behavior

- Put the user's id in the `sub` claim (standard). Example payload: `{ "sub": "user_abc123", "exp": 1699999999 }`.
- Always include an expiry (`exp`) claim and keep token TTLs short (minutes/hours based on your needs).
- The server helper verifies signature and should also check `exp` to ensure the token is not expired.

Environment variables used by verification

- `SERVER_JWT_SECRET` — HMAC secret for HS256 verification.
- `SERVER_JWT_PUBLIC_KEY` — PEM public key for RS256 verification (use literal newlines or an escaped `\n` representation).

Security notes

- Prefer RS256 for production where possible (asymmetric keys). Keep the signing private key secure and only use the public key on servers that verify.
- If you use HS256, protect the shared secret carefully and do not expose it to clients.
- Short-lived tokens are safer. Consider using refresh tokens or re-auth flows for long sessions.

Developer convenience

- During development the server helper also supports a simple dev token format: `Authorization: Bearer user:<userId>` which returns the user with that id (useful for local testing). Replace this with real JWT flow in production.

Detailed guidance & examples

- Token validation checklist (what the server SHOULD verify):

  - Signature (HS256 or RS256 as configured).
  - `exp` (expiry) claim: reject expired tokens.
  - `nbf` (not-before) claim: reject tokens used before their valid time.
  - `aud` (audience) and `iss` (issuer) checks if you rely on those semantics in your system.
  - That the `sub` (subject) or equivalent claim contains the user id used to look up labels.

- Issuing a test HS256 token (Node.js example)

```js
// Example: sign a quick HS256 token for local testing (do not use this secret in prod)
import crypto from "crypto";
function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
const payload = base64url(
  JSON.stringify({
    sub: "user_abc123",
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  })
);
const secret = "test-secret";
const sig = crypto
  .createHmac("sha256", secret)
  .update(header + "." + payload)
  .digest("base64")
  .replace(/=+$/, "")
  .replace(/\+/g, "-")
  .replace(/\//g, "_");
const token = `${header}.${payload}.${sig}`;
console.log(token);
```

- Example server-side token issuance (recommended flow)

Have an authenticated server action that issues short-lived signed tokens to the client (so clients send Authorization: Bearer <token> on subsequent API calls). Signing should be done with a private key (RS256) or a secure secret (HS256) stored only on the server.

- Nuxt 4 middleware registration

Place the middleware in `server/middleware/enforce-routes.ts` (already added in this repo). Nuxt will load server middleware automatically. Ensure the middleware is early in the pipeline so it runs before data-fetching server handlers.

- Cache tuning

Rules are loaded from files and user labels are fetched from Appwrite. For production:

- Cache `loadRules()` at module scope or in a short-lived in-memory cache and reload in dev when files change.
- Cache per-user labels for a short TTL (30s–2m) to reduce Appwrite calls. Invalidate on label change (webhook) if possible.

Testing tips

- Unit test JWT: generate an HS256 token with a test secret and call `getServerUser` (or your middleware) asserting the user is returned. Also test expired token and missing `sub` cases.

## Types & notes

- `checkAccessForPath` accepts `user: { labels?: readonly string[] } | null` to match the readonly arrays used in the app's user model.
- The module exports both named helpers and a default object to make it easy to import in different styles.

## Next steps / recommendations

- Add a server middleware that uses `checkAccessForPath()` to ensure server-side protection for API/data routes.
- Consider centralizing `globToRegExp` in one export if other parts of the code need to compile the same globs.
- Add an integration test that runs a small dev server and verifies the `/admin` page redirects unauthenticated users.

---

If you'd like, I can also:

- Create the `server/middleware/enforce-routes.ts` example as a working file in the repo, or
- Add the full-URL matcher option to the `route-config` helper, or
- Add an integration Playwright test to verify the redirect behavior end-to-end.

Tell me which and I will implement it next.
