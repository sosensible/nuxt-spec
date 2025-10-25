# Appwrite Auth Integration - Admin Users Management

**Feature**: Admin Users list with Appwrite as source of truth  
**Status**: Implemented (MVP)  
**Branch**: `005-appwrite-auth-we`

## Overview

This feature provides admin operators with a complete user management interface backed by Appwrite. The `/admin/users` page displays canonical user data from Appwrite and allows authorized operators to edit and delete users through a secure server-side proxy.

## Features

- ✅ **View canonical user list** - Paginated list with cursor-based navigation
- ✅ **Search and filter** - Search users by email or name
- ✅ **Edit user** - Update name, email, and custom attributes via popup editor
- ✅ **Delete user** - Hard-delete with explicit confirmation (irreversible)
- ✅ **Real-time sync** - UI reflects Appwrite state after operations
- ✅ **Error handling** - Clear, actionable error messages with retry options

## Quick Start

### 1. Prerequisites

- Node.js 18+ or compatible runtime
- Appwrite instance (Cloud or self-hosted)
- Appwrite project with Users service enabled

### 2. Environment Setup

Copy `.env.example` to `.env` and configure:

```bash
# Appwrite Configuration
APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id-here
APPWRITE_API_KEY=your-api-key-here
```

**Required Appwrite API Key Scopes:**

- `users.read` - List and read user data
- `users.write` - Update user attributes
- `sessions.write` - Manage user sessions

**Security Note:** Never expose `APPWRITE_API_KEY` to the client. It's used only in server-side routes.

### 3. Install Dependencies

```bash
pnpm install
```

### 4. Run Development Server

```bash
pnpm dev
```

Navigate to: http://localhost:3000/admin/users

## Architecture

### Server-Side Proxy (Secure)

All Appwrite operations go through server-side API routes:

- `GET /api/admin/users` - List users with pagination
- `PATCH /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user

**Authentication**: All routes require admin authentication via `requireAdminRole()` middleware.

### Frontend Components

- `AdminUsersList.vue` - Main table with pagination controls
- `EditUserPopup.vue` - Modal for editing user attributes
- `DeleteUserModal.vue` - Confirmation modal with explicit warnings

### Composables

- `usePagedUsers()` - Manages paginated list, cursor navigation, and mutations

## API Reference

### GET /api/admin/users

**Query Parameters:**

- `pageSize` (number, default: 25, max: 50) - Items per page
- `cursor` (string, optional) - Cursor for next page
- `offset` (number, optional) - Fallback offset for pagination
- `q` (string, optional) - Search query for email/name

**Response:**

```typescript
{
  items: UserRecord[],
  cursor?: string | null,
  totalCount?: number | null
}
```

### PATCH /api/admin/users/:id

**Body:**

```typescript
{
  name?: string,
  email?: string,
  customAttributes?: Record<string, unknown>
}
```

**Response:**

```typescript
{
  item: UserRecord;
}
```

### DELETE /api/admin/users/:id

**Response:** `204 No Content` on success

## Type Definitions

See `types/admin.ts` for complete type definitions:

- `UserRecord` - User data shape
- `PagedResponse<T>` - Paginated response wrapper
- `ApiError` - Error response format
- `UpdateUserPayload` - Update request body

## Security

### Authorization

**MVP Implementation**: Any authenticated user is considered an admin operator.

**Production TODO**: Implement proper role checking:

- Query Appwrite Teams for admin team membership
- Check custom user attributes for admin flag
- Verify against specific role IDs

See `server/middleware/auth.ts` for implementation details.

### Audit Logging

All admin actions are logged with:

- Request ID (for tracing)
- Operator ID (who performed the action)
- Action type (list_users, update_user, delete_user)
- Target resource (user ID)
- Metadata (operation details)

Logs can be found in server console output.

## Testing

### Run Tests

```bash
# Unit and API contract tests
pnpm test

# Specific test suites
pnpm test tests/server/admin-users-get.spec.ts
pnpm test tests/server/admin-users-patch.spec.ts
pnpm test tests/server/admin-users-delete.spec.ts
```

### Test Coverage

- ✅ API contract tests for all endpoints
- ✅ Validation logic tests
- ✅ Error handling scenarios
- ⏳ E2E tests (deferred to future work)

## Known Limitations

### Hard-Delete (MVP)

The current implementation uses **hard-delete** which permanently removes users from Appwrite. This carries compliance and audit implications.

**Future Work**: Implement soft-delete or retention policy.

### Role Mapping

MVP uses a simplified "any authenticated user = admin" approach.

**Future Work**: Tighten mapping to Appwrite Teams or organization-level roles.

### Data Freshness

UI uses on-demand refresh (manual refresh button + reload on operations).

**Future Work**: Consider polling or real-time subscriptions for live updates.

## Troubleshooting

### "Missing Appwrite configuration" Error

Ensure all environment variables are set in `.env`:

- `APPWRITE_ENDPOINT`
- `APPWRITE_PROJECT_ID`
- `APPWRITE_API_KEY`

### "Authentication required" Error

The endpoint requires a valid session. Ensure you're logged in to the admin panel.

### "Failed to fetch users from Appwrite" Error

1. Check Appwrite endpoint is accessible
2. Verify API key has required scopes
3. Check server logs for detailed error messages

### Pagination Issues

If pagination doesn't work:

1. Verify Appwrite supports cursor-based pagination
2. Check `totalCount` is available from Appwrite
3. Try using offset-based pagination as fallback

## Development

### Project Structure

```
server/
├── api/admin/
│   ├── users.get.ts          # List users endpoint
│   └── users/
│       ├── [id].patch.ts     # Update user endpoint
│       └── [id].delete.ts    # Delete user endpoint
├── middleware/
│   └── auth.ts               # Admin auth middleware
└── utils/
    ├── appwrite.ts           # Appwrite client utilities
    ├── auth.ts               # Auth helper functions
    └── logger.ts             # Logging utilities

app/
├── components/
│   ├── AdminUsersList.vue    # Main users table
│   ├── EditUserPopup.vue     # Edit modal
│   └── DeleteUserModal.vue   # Delete confirmation
├── composables/
│   └── usePagedUsers.ts      # Paging & mutations
└── pages/admin/
    └── users.vue             # Main users page

types/
└── admin.ts                  # TypeScript definitions

tests/server/
├── admin-users-get.spec.ts
├── admin-users-patch.spec.ts
└── admin-users-delete.spec.ts
```

### Adding New Fields

To add new editable fields:

1. Update `UpdateUserPayload` in `types/admin.ts`
2. Add field to whitelist in `server/api/admin/users/[id].patch.ts`
3. Add validation in PATCH endpoint
4. Update `EditUserPopup.vue` with new form field
5. Add tests for new field validation

## Contributing

See the main project documentation for contribution guidelines.

## Related Documentation

- [Feature Specification](spec.md)
- [Implementation Plan](plan.md)
- [API Contracts](contracts/)
- [Task List](tasks.md)
