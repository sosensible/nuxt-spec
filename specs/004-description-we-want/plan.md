# Implementation Plan: Upgrade outdated libraries and Nuxt modules

Created: 2025-10-25
Related spec: `spec.md`

Purpose: Turn the feature specification into a small, actionable plan with tasks, owners, and estimates so the team can implement automated dependency detection, safe upgrade proposals, CI validation, staging verification, and rollback procedures.

Contract (inputs / outputs / success criteria)

- Inputs: repository with lockfile(s), CI access, staging environment, repo automation credentials (read-only for discovery, write for PRs if opted).
- Outputs: a reusable automation prototype that detects outdated deps and opens upgrade PRs/branches, CI job snippets (detection, extended integration tests, staging smoke-tests), PR template, smoke-test scripts, and a rollback runbook.
- Success: All acceptance criteria in `spec.md` met; at least one end-to-end dry-run demonstrates: detection → upgrade proposal branch → CI run → staging smoke-test (green) → merge gating behavior (blocked or auto-merge depending on risk).

High-level phases and timeline (recommended)

- Phase A (2 days): Design & small spikes — identify package manager(s), draft CI job definitions, list critical pages for smoke-tests.
- Phase B (3 days): Prototype automation (dry-run mode) that detects outdated deps and creates local branch/PR metadata (no auto-push by default).
- Phase C (3 days): Integrate CI jobs: detection scheduled job, PR creator, extended integration test job, staging smoke-tests; wire gating rules for merges.
- Phase D (2 days): Run security & compatibility audits, run smoke-tests in staging, produce rollout notes & rollback runbook.
- Phase E (1 day): Finalize docs, PR template, and handover.

Total recommended effort: 11 working days (approx. 3 weeks calendar with reviews). Estimates assume one engineer with CI access.

Deliverables

- Detection prototype (script/action) — dry-run mode that outputs JSON report of outdated deps and suggested versions.
- CI snippets: YAML examples for scheduled detection job, PR creation workflow, extended integration test job, staging smoke-test job.
- PR template for upgrade proposals (changelog, risk notes, test results, staging status).
- Smoke-test checklist + minimal Playwright scripts for critical routes.
- Rollback & audit runbook (steps to revert dependency changes, how to find audit logs, contact points).
- Plan.md and tasks.md updated; example upgrade PR demonstrating the flow.

Tasks (detailed)

1. Discovery & design — 8 hours (Owner: Maintainer)

- Confirm package manager(s) used (pnpm in repo root), locate lockfile(s) and any monorepo patterns.
- Identify private registries and credential needs.
- Produce a short design doc describing detection approach (registry API vs local lockfile comparison).

2. Detection prototype (dry-run) — 16 hours (Owner: Automation Engineer)

- Implement a Node.js or shell prototype that reads package.json + lockfile and outputs outdated packages grouped by scope (runtime/dev/nuxt-module).
- Produce JSON output with fields: name, currentVersion, latestVersion, semverDiff, riskNote, recommendedTarget.
- Add a `--apply` flag for a later phase (default: dry-run).

3. CI job definitions — 12 hours (Owner: CI Engineer)

- Scheduled detection job (weekly) that uploads report artifacts.
- PR creation workflow: takes detection report (or incremental results) and opens a branch/PR with changelog and test triggers.
- Extended integration tests job: runs longer integration suites when PR label `high-risk` present.
- Staging smoke-test job: deploys PR to ephemeral staging or runs smoke-test suite against designated staging environment.

4. PR template and automation rules — 4 hours (Owner: Maintainer)

- PR body template including: summary, affected deps, risk level, CI results, staging link, rollback notes.
- Auto-labeling rules (low/medium/high risk) based on semver diff and known advisories.

5. Smoke-tests & scripts — 12 hours (Owner: QA / Test Engineer)

- Define critical pages/routes to smoke-test (home, login, main flows) and implement minimal Playwright scripts.
- Document execution steps and pass/fail criteria for smoke-tests.

6. Rollback & audit runbook — 6 hours (Owner: Maintainer / Ops)

- Document how to revert a merged upgrade (cherry-pick previous lockfile, revert PR), meetpoints for on-call, and locations of audit logs.
- Include checklist for incident response (who to notify, quick mitigation steps).

7. Security audit (optional but recommended) — 4 hours (Owner: Security)

- Run `pnpm audit` or SCA tooling and attach findings to plan; prioritize packages with high severity.

Acceptance criteria (ready-for-merge signals)

- Detection prototype produces a report with at least 95% of runtime dependencies correctly identified in a dry-run.
- A sample upgrade PR can be generated and triggers CI jobs: build, tests, extended integration tests (if labeled), and staging smoke-tests.
- For single-maintainer repos, gating policy implemented: PRs touching production dependencies only merge after 1 maintainer approval, extended CI passes, and staging smoke-tests pass.
- Rollback playbook validated via a dry run (reverting a trivial non-production PR) and documented.

Risks & mitigations

- Private registries: may block automation — mitigation: detect and surface credentials as blockers and require manual handling.
- Large major upgrades: risk of breakage — mitigation: label as `high-risk`, require extended tests and manual approval.
- CI capacity/time: extended integration tests can be slow — mitigation: run them only for high-risk PRs, use parallelism where possible.

Notes / Next steps

- After owner assignment, start with Task 1 (Discovery & design) and update `tasks.md` with status and any sub-tasks.
- I can generate the CI YAML snippets and a starter detection prototype if you want me to continue (select "CI snippets" or "prototype").
