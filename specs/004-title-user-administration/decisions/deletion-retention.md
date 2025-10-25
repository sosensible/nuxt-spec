# Deletion & retention decision

Date: 2025-10-24

Decision: Soft-delete by default with configurable retention window (30 days default)

Summary

- When an admin deletes a user via the admin API, we will not immediately hard-delete the Appwrite user record.
- Instead we set deletion metadata in the user's preferences (`prefs`) including `deletedAt` and `retentionExpiresAt` and a `deletedByAdmin` flag.
- A separate purge process (not implemented here) can periodically remove users whose `retentionExpiresAt` has passed.

Rationale

- Soft-delete prevents accidental permanent data loss and allows account recovery within the retention window.
- It simplifies audit and legal requirements around retention and gives operator control over purge timing.

Implementation notes

- The server-side delete handler delegates to `server/utils/appwrite-admin.deleteUser`, which now performs a soft-delete by default.
- The retention window is configurable via `USER_DELETION_RETENTION_DAYS` (defaults to 30 days).
- For deployments that require immediate hard-delete, maintainers can call the Appwrite SDK directly or we can add an env-gated `ADMIN_FORCE_HARD_DELETE=true` later.
