# Session revocation decision

Date: 2025-10-24

Decision: Immediate invalidation with best-effort retries (short exponential backoff)

Options considered

- Immediate invalidation (chosen)

  - Call Appwrite's session revocation helper to revoke active sessions immediately.
  - Retry on transient failures (network/timeouts/5xx/429) for a small number of attempts.
  - Map permanent failures to a 502 server error for the caller.

- Expire-only

  - Mark sessions to expire later; simpler but leaves active tokens valid until expiry.

- Queued/background revocation
  - Enqueue a job and process asynchronously; more robust for large accounts but needs infra.

Rationale

- Admin UX expects immediate locking of accounts. This repo already has an Appwrite helper `revokeAllSessionsForUser`.
- Best-effort immediate invalidation with bounded retries balances security and reliability.

Implementation notes

- Handler will attempt up to 3 attempts by default with a small exponential backoff (backoff base 5ms) to keep tests fast.
- Transient errors are detected by message patterns (timeouts, connection resets, 429/5xx). Permanent errors are surfaced as a 502.
- The revocation operation is idempotent: multiple calls are safe.
