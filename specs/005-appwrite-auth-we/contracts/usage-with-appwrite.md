# Server-side usage with Appwrite JS SDK — proxy examples

Purpose: show minimal, copy-paste examples for the server-side proxy that implements the feature's API surface while using the Appwrite JavaScript SDK. Keep admin keys and service accounts on the server only — never embed in client code.

Files created by this doc:

- `contracts/types.d.ts` — TypeScript interfaces for request/response shapes used by the frontend.

Guiding principles

- Use the Appwrite Node/Server SDK on the server to call Appwrite Admin APIs.
- Expose a small set of authenticated server routes to the frontend: GET list, PATCH update, DELETE remove.
- Return normalized responses and a consistent error shape to the frontend to simplify UI handling.

1. GET /api/admin/users — list (paged)

Query parameters (recommended):

- `pageSize` (number, optional) — number of rows (default 25, allowed {10,25,50}).
- `cursor` (string, optional) — Appwrite cursor token for forward/back navigation.
- `offset` (number, optional) — fallback offset when cursors unavailable.
- `q` (string, optional) — simple search/filter (email/name); server maps to Appwrite filters.

Example server-side sketch (Node/Express-like):

```js
// server-side (Node)
const Appwrite = require("node-appwrite");
const client = new Appwrite.Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT)
  .setKey(process.env.APPWRITE_ADMIN_KEY); // server-only

const users = new Appwrite.Users(client);

app.get("/api/admin/users", async (req, res) => {
  const { pageSize = 25, cursor, offset, q } = req.query;
  try {
    // Prefer cursor-based listing if supported
    const limit = Math.min(Number(pageSize), 50);
    let result;
    if (cursor) {
      result = await users.list({ limit, cursor, search: q });
    } else if (offset) {
      // If cursor not available, translate to skip/limit style (if you implement)
      result = await users.list({ limit, offset: Number(offset), search: q });
    } else {
      result = await users.list({ limit, search: q });
    }

    // Normalized response shape
    res.json({
      items: result.users || result.documents || [],
      cursor: result.cursor || null,
      totalCount: result.total || null,
    });
  } catch (err) {
    // Normalize error shape
    res
      .status(502)
      .json({
        error: { code: err.code || "appwrite_error", message: err.message },
      });
  }
});
```

Notes:

- `users.list(...)` shape depends on SDK version — inspect the returned object and normalize to `items`, `cursor`, `totalCount` for the client.
- Avoid exposing raw Appwrite error objects to clients; return sanitized messages and codes.

2. PATCH /api/admin/users/:id — update user

Server sketch:

```js
app.patch("/api/admin/users/:id", async (req, res) => {
  const id = req.params.id;
  const payload = req.body; // validate shape per contracts/types.d.ts
  try {
    const result = await users.update(id, payload);
    res.json({ item: result });
  } catch (err) {
    res
      .status(400)
      .json({
        error: { code: err.code || "appwrite_error", message: err.message },
      });
  }
});
```

Notes:

- Use server-side validation to restrict which fields can be updated (e.g., name, email metadata). Do not allow role escalation from the client.
- Return the updated user object in `item` on success.

3. DELETE /api/admin/users/:id — hard-delete

Server sketch:

```js
app.delete("/api/admin/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await users.delete(id);
    res.status(204).send();
  } catch (err) {
    res
      .status(400)
      .json({
        error: { code: err.code || "appwrite_error", message: err.message },
      });
  }
});
```

Notes:

- For MVP we implement hard-delete; ensure the UI asks for explicit confirmation and shows an irreversible-warning.

Error handling and observability

- Normalize errors to `{ error: { code: string, message: string } }`.
- Log server-side errors with context: operator id, request id, target user id.
- Consider adding a request-id header in responses to aid debugging.

Security

- Authenticate and authorize every server route: verify the calling operator has the elevated in-app admin role before executing Appwrite calls.
- Do not pass the admin key to the client. Use short-lived tokens only if unavoidable and after threat modeling.

Client-side expectations

- Frontend will call these proxy endpoints and expect the TypeScript shapes defined in `contracts/types.d.ts`.
