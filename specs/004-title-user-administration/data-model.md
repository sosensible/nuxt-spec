# Data Model: User Administration

## Entities

### User
- id: string (Appwrite $id)
- email: string (validated, lowercased)
- name: string (display name)
- emailVerified: boolean
- avatar?: string (URL)
- provider: 'email' | 'github' | string
- status: 'active' | 'disabled' | 'deleted'
- createdAt: string (ISO timestamp)
- updatedAt?: string (ISO timestamp)

Validation rules:
- email must match standard email regex and be stored lowercase
- name is optional but when present max length 100
- avatar must be a valid URL if present

### Session
- id: string
- userId: string
- createdAt: string
- lastUsedAt?: string
- ip?: string
- clientInfo?: string

### AuditRecord
- id: string
- actorId: string (admin id)
- action: string (e.g., "delete_user", "disable_user")
- targetId: string (user id)
- timestamp: string
- metadata?: Record<string, unknown>

## Relationships

- User has many Sessions
- AuditRecords reference User and admin actor
