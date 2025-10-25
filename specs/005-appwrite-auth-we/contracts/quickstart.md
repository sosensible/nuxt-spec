# Quickstart: Appwrite-backed Admin Users proxy (minimal)

This quickstart contains copyable snippets to run the minimal server-side proxy and call it from the frontend. It assumes you already have the Appwrite JS SDK installed and environment variables configured (you confirmed this).

Environment

Set these environment variables on the server (example names):

- APPWRITE_ENDPOINT (e.g. https://cloud.appwrite.io/v1)
- APPWRITE_PROJECT (your project id)
- APPWRITE_ADMIN_KEY (server-only admin key)

Install (server)

```bash
# npm
npm install node-appwrite express

# or pnpm
pnpm add node-appwrite express
```

Minimal server example (Express)

```js
// server.js
const express = require("express");
const Appwrite = require("node-appwrite");

const app = express();
app.use(express.json());

const client = new Appwrite.Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT)
  .setKey(process.env.APPWRITE_ADMIN_KEY);

const users = new Appwrite.Users(client);

// GET list (simple)
app.get("/api/admin/users", async (req, res) => {
  const { pageSize = 25, cursor, offset, q } = req.query;
  try {
    const limit = Math.min(Number(pageSize), 50);
    const result = await users.list({ limit, cursor, search: q });
    res.json({
      items: result.users || [],
      cursor: result.cursor || null,
      totalCount: result.total || null,
    });
  } catch (err) {
    res
      .status(502)
      .json({
        error: { code: err.code || "appwrite_error", message: err.message },
      });
  }
});

// PATCH update
app.patch("/api/admin/users/:id", async (req, res) => {
  try {
    const result = await users.update(req.params.id, req.body);
    res.json({ item: result });
  } catch (err) {
    res
      .status(400)
      .json({
        error: { code: err.code || "appwrite_error", message: err.message },
      });
  }
});

// DELETE
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    await users.delete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res
      .status(400)
      .json({
        error: { code: err.code || "appwrite_error", message: err.message },
      });
  }
});

app.listen(3001, () => console.log("Proxy listening on http://localhost:3001"));
```

Frontend usage (TypeScript)

See `contracts/types.d.ts` for types. Example usage with the helpers in `contracts/frontend-examples.ts`:

```ts
import { createPagedUsersStore } from "./contracts/frontend-examples";

const store = createPagedUsersStore(25);

// Navigate pages
await store.goNext();
await store.goPrev();

// Update a user
await store.updateUser("userId", { name: "New name" });

// Delete a user
await store.deleteUser("userId");
```

Tips

- Keep `APPWRITE_ADMIN_KEY` server-only. The frontend should never see it.
- Use the example types in `contracts/types.d.ts` to type responses in the frontend.
- For production, add authentication/authorization middleware to the server routes to verify the operator role before calling Appwrite.
