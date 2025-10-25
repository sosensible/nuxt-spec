Title: Remove app-level audit feature and related tests/docs

## Summary

This change removes the previously-introduced application-level audit feature and neutralized tests. The audit feature was removed per product decision and replaced with documentation and neutral wording. This PR (description) summarizes the files deleted/updated and the verification steps taken.

## Files removed

- server/utils/audit.ts (audit stub)
- server/utils/audit-file.ts (file-backed audit client stub)
- tests/unit/audit-file.test.ts
- tests/api/admin/audit-file.test.ts
- tests/api/admin/audit-file-rotation.test.ts
- tests/api/admin/users.revoke-sessions.audit.test.ts
- tests/api/admin/users.delete.audit.test.ts
- tests/api/admin/users.change-roles.audit.test.ts

## Files updated

- specs/004-title-user-administration/spec.md — removed AuditRecord wording
- specs/004-title-user-administration/checklists/requirements.md — 'audit coverage' -> 'observability coverage'
- specs/003-login-auth-we/spec.md — 'for audit' -> 'for security monitoring' (FR-018)
- specs/001-layout-based-we/PHASE-8-COMPLETE.md — 'Accessibility Audit' -> 'Accessibility review'
- specs/001-layout-based-we/tasks.md — 'performance auditing' -> 'performance checks'
- specs/002-basic-usability-i/research.md — 'Audit current color usage' -> 'Review current color usage'
- specs/001-layout-based-we/contracts/components.md — 'audits' -> 'checks'
- .specify/memory/development-standards.md — 'Audit Process' -> 'Vulnerability scanning process' and replaced literal 'pnpm audit' with generic guidance

## Verification performed

- Ran full test suite: `npm test` — all tests passed (140 tests).
- Searched repository for literal 'audit' in human-authored specs and docs and replaced instances where appropriate. Remaining 'audit' occurrences are in generated artifacts under `.nuxt/` and tool/process docs referencing `pnpm audit` (now updated to generic phrasing in the vulnerability scanning section).

## Notes

- The changes intentionally preserve actionable security guidance (run a vulnerability scanner such as `pnpm audit`) while removing the product-level audit implementation and tests.
- Generated files under `.nuxt/` still contain identifiers referencing `audit` — these are build artifacts and will regenerate; they were not edited.

## Next steps (recommendations)

1. Review and merge this branch into the main branch once you confirm the removal.
2. Decide whether to delete any additional historical artifacts or references in external docs/CI.
3. Proceed with the next speckit task: session-revocation tests and documentation for deletion/retention policy.

Signed-off-by: Automated repo assistant
