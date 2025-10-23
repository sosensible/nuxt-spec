# Authentication Speck — Quick Reference

This README consolidates the essential quickstart steps for the `003-login-auth-we` authentication speck.

## Files of interest

- `specs/003-login-auth-we/quickstart.md` — full quickstart and examples
- `specs/003-login-auth-we/.env.example` — example environment variables for Appwrite and GitHub OAuth
- `specs/003-login-auth-we/contracts/api-routes.md` — API contract definitions
- `specs/003-login-auth-we/plan.md` — implementation plan and phases

## Quick env setup (PowerShell)

Copy the example env file to the repo root `.env` and open for editing:

```powershell
# from repo root
Copy-Item -Path .\specs\003-login-auth-we\.env.example -Destination .\.env -Force
code .\.env
```

Then replace placeholder values with your Appwrite project credentials and GitHub client values.

## Run the dev server

```powershell
pnpm install
pnpm dev
```

## Notes

- Do not commit your `.env` file. It's ignored by `.gitignore`.
- If you keep a spec-scoped `.env` file, be careful when running the app to ensure the environment loader picks it up.

For full instructions, see `specs/003-login-auth-we/quickstart.md`.
