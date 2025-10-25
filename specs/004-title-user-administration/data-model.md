# Data Model: User Administration

## Entities

### User

- id: string (Appwrite $id)
- email: string (validated, lowercased)
- name: string (display name)
- emailVerified: boolean
- avatar?: string (URL)
- provider: 'email' | 'github' | string
- status: 'active' | 'disabled' | 'deleted' # UI-friendly enum; NOT used as the sole enforcement mechanism
- isDeleted?: boolean # convenience flag for UI/retention queries (derived from status)
- deletedAt?: string (ISO timestamp)
- deletedBy?: string (admin id)
- retentionExpiresAt?: string (ISO timestamp)
- createdAt: string (ISO timestamp)
- updatedAt?: string (ISO timestamp)

Validation rules:

- email must match standard email regex and be stored lowercase
- name is optional but when present max length 100
- avatar must be a valid URL if present

Notes:

- Appwrite remains the source of truth for authentication/authorization state. Any enforcement (disable/block/delete) MUST be applied via Appwrite server-side controls (roles, teams, or custom claims) and active sessions revoked using the Appwrite Admin SDK. The fields above are intended for UI and retention scheduling and MUST NOT be used alone to grant/deny authentication.

### Session

- id: string
- userId: string
- createdAt: string
- lastUsedAt?: string
- ip?: string
- clientInfo?: string

## Relationships

- User has many Sessions
