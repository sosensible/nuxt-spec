# Dependency detection (removed)

Per project standards, dependency detection and outdated checks are handled by the package manager (pnpm). The prototype and related scaffolding that attempted to reimplement or orchestrate pnpm functionality have been removed.

If you need an automated check, prefer invoking `pnpm outdated --json` in CI or locally and processing its output externally. Do not add in-repo replication of pnpm behavior.
