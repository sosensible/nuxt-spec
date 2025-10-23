# TODO — Authentication Speck (actionable)

This file lists small, actionable items for implementers working on `specs/003-login-auth-we`.

## 4 quick items requested by reviewers

- [ ] Create/update `.env` from the example and populate Appwrite & GitHub credentials
  - Use `pnpm run env:auth` (cross-platform Node helper) or `pnpm run env:auth:ps` for PowerShell
- [ ] Ensure `specs/003-login-auth-we/contracts/api-routes.md` contains concrete request/response examples (already present)
- [ ] Ensure `specs/003-login-auth-we/PHASE-3-TESTING.md` is kept up-to-date with test results (already present)
- [ ] Add any missing implementation `TODO` notes into `plan.md` (phase-based)

## Quick commands

```powershell
# Copy spec env into repo .env (PowerShell)
pnpm run env:auth:ps

# Cross-platform copy
pnpm run env:auth

# Start dev server
pnpm install
pnpm dev
```

## Notes

- `.env` is ignored by `.gitignore`.
- Keep secrets out of git; use CI secret stores for production.
