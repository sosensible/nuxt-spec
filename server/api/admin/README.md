# Admin API Routes

This directory contains server-side API routes for admin operations.

## Routes

- `GET /api/admin/users` - List users with pagination
- `PATCH /api/admin/users/[id]` - Update user
- `DELETE /api/admin/users/[id]` - Delete user

## Authentication

All routes require authentication and elevated admin role (MVP: any authenticated user).
See `server/middleware/auth.ts` for authorization logic.

## Response Format

All responses follow the contracts defined in `specs/005-appwrite-auth-we/contracts/types.d.ts`.

### Success Response

```typescript
{
  items: UserRecord[],
  cursor?: string | null,
  totalCount?: number | null
}
```

### Error Response

```typescript
{
  error: {
    code: string | number,
    message: string
  }
}
```

## Logging

All admin actions are logged with:

- Request ID
- Operator ID
- Action type
- Target resource

See `server/utils/logger.ts` for logging utilities.
