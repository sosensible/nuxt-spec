# Operations: Scheduled purge worker

This page documents the scheduled purge worker used to hard-delete users who have been soft-deleted and whose retention window has expired.

WARNING: Hard-deleted users and their data cannot be recovered. Use these settings carefully in non-production environments.

## How it works

- The application includes a Nitro-friendly plugin at `server/plugins/purge-scheduler.server.ts` which schedules the purge job on an interval.
- The purge logic lives in `server/utils/purge-worker.ts` and is testable via dependency injection.
- The worker lists users (via `server/utils/appwrite-admin.ts`), filters those with an expired `prefs.retentionExpiresAt`, and calls `hardDeleteUser` for each eligible user. The worker returns a summary object `{ attempted, deleted, errors }`.

## Environment variables

- `ENABLE_SCHEDULED_PURGES` (boolean) — enable the scheduler. Default: `false`.
- `SCHEDULED_PURGES_ALLOW_NON_PROD` (boolean) — when `true`, the scheduler may run in non-production environments (useful for QA/staging). Default: `false` (scheduler only runs when `NODE_ENV=production`).
- `SCHEDULED_PURGE_INTERVAL_MS` (number) — interval between runs in milliseconds. Default: `86400000` (24 hours).

## Recommended QA procedure

1. In a staging or QA environment, set the environment variables:

```powershell
$env:ENABLE_SCHEDULED_PURGES = 'true'
$env:SCHEDULED_PURGES_ALLOW_NON_PROD = 'true'
$env:SCHEDULED_PURGE_INTERVAL_MS = '60000' # run every minute for testing
pnpm dev
```

2. Create test users and mark them soft-deleted (e.g., with `prefs.retentionExpiresAt` set to a past timestamp) or create users and set retention to a short window (few minutes).

3. Monitor application logs for the string `[purge-scheduler] starting purge job` and then check for the worker summary or deletion confirmations.

4. After testing, unset `SCHEDULED_PURGES_ALLOW_NON_PROD` or `ENABLE_SCHEDULED_PURGES` to avoid accidental deletion.

## Safety and monitoring

- Keep the scheduler disabled by default in production unless you have a documented retention policy and backups.
- Emit logs for each run and monitor for errors. The worker returns a summary which should be shipped to your logs/monitoring system (Sentry, CloudWatch, etc.).
- Consider dry-run mode for the worker (not implemented in this branch) that lists candidates without deleting them — useful for audits before enabling hard delete.

## How to run manually

You can invoke the purge worker manually (e.g., via an administrative route or a one-off script):

```ts
import { purgeExpiredDeletedUsers } from "./server/utils/purge-worker";
import { listUsers, hardDeleteUser } from "./server/utils/appwrite-admin";

await purgeExpiredDeletedUsers({
  appwriteAdmin: { listUsers, hardDeleteUser },
  now: new Date(),
});
```

## Tests

- Unit tests for the worker live in `tests/cron/purge-worker.test.ts`.
- Unit tests for the scheduler plugin live in `tests/cron/purge-scheduler.test.ts` and mock `setInterval` so runs are deterministic.

## Next improvements (optional)

- Add a dry-run flag to the worker to report deletions without performing them.
- Add an audit log entry (external store) for deletions in case compliance requires retention of delete audit trails.
- Add alerting when the worker reports errors or deleted more users than expected.
