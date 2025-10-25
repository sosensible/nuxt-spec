# Tasks: Upgrade outdated libraries and Nuxt modules (Feature: 004-description-we-want)

**Input**: Design documents from `specs/004-description-we-want/` (plan.md, spec.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Identify environment, confirm package manager(s), and create starter artifacts so the detection prototype and CI can be run.

- [ ] T001 Confirm package manager(s) and lockfile locations by inspecting `package.json`, `pnpm-lock.yaml`, and repo root (path: `package.json`, `pnpm-lock.yaml`)
- [ ] T002 [P] Create detection prototype folder `scripts/dependency-detection/` with README (path: `scripts/dependency-detection/README.md`)
- [ ] T003 [P] Add npm script `detect-deps` in `package.json` to run the detection prototype (path: `package.json`)
- [ ] T004 [P] Create CI workflow stub for scheduled detection `./.github/workflows/dependency-detection.yml` (path: `/.github/workflows/dependency-detection.yml`)
- [ ] T005 Create tasks manifest file in the feature folder `specs/004-description-we-want/tasks.md` (path: `specs/004-description-we-want/tasks.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement core automation pieces and CI primitives that MUST exist before per-story work can reliably run.

- [ ] T006 Implement a dry-run detection prototype that reads `package.json` + lockfile and produces `scripts/dependency-detection/report.json` (path: `scripts/dependency-detection/detect.ts`)
- [ ] T007 [P] Add PR template for dependency upgrades `./.github/PULL_REQUEST_TEMPLATE/dependency-upgrade.md` (path: `/.github/PULL_REQUEST_TEMPLATE/dependency-upgrade.md`)
- [ ] T008 [P] Add a CI scheduled job to upload detection reports `./.github/workflows/dependency-detection.yml` (path: `/.github/workflows/dependency-detection.yml`)
- [ ] T009 [P] Create minimal Playwright smoke-tests skeleton for critical routes in `tests/e2e/smoke/` (path: `tests/e2e/smoke/home.spec.ts`)
- [ ] T010 Create rollback & audit runbook skeleton (path: `docs/rollback-dependency-upgrade.md`)
- [ ] T011 [P] Add a folder for CI snippets and examples `ci/snippets/` with README (path: `ci/snippets/README.md`)

---

## Phase 3: User Story 1 - Upgrade detection and proposal (Priority: P1) 🎯 MVP

Goal: Detect outdated dependencies and Nuxt modules and produce a clear, machine-readable report and a human-readable upgrade proposal.

Independent Test: Run the detection CLI and verify `scripts/dependency-detection/report.json` is produced listing outdated packages (fields: name, currentVersion, latestVersion, semverDiff, scope, riskNote).

### Tests (RED phase - write failing tests first)

- [ ] T012 [P] [US1] Write unit tests for detection logic (expected to FAIL initially) (path: `tests/unit/detection.spec.ts`)
- [ ] T013 [P] [US1] Write contract tests that validate report schema for `report.json` (expected to FAIL initially) (path: `tests/contract/report.schema.spec.ts`)

### Implementation (GREEN phase)

- [ ] T014 [US1] Implement detection CLI that reads `package.json` and lockfile and writes `scripts/dependency-detection/report.json` (path: `scripts/dependency-detection/detect.ts`)
- [ ] T015 [US1] Ensure CLI supports `--output <path>` and `--dry-run` flags (path: `scripts/dependency-detection/detect.ts`)
- [ ] T016 [US1] Create human-readable proposal output `scripts/dependency-detection/proposal.md` generated from `report.json` (path: `scripts/dependency-detection/proposal.md`)
- [ ] T017 [US1] Add npm script `npm run detect-deps -- --output scripts/dependency-detection/report.json` (path: `package.json`)
- [ ] T018 [P] [US1] Add example report artifact to `specs/004-description-we-want/examples/report-sample.json` (path: `specs/004-description-we-want/examples/report-sample.json`)

### Integration & Verification

- [ ] T019 [US1] Run unit + contract tests and verify they PASS after implementation (path: `tests/unit/detection.spec.ts`, `tests/contract/report.schema.spec.ts`)
- [ ] T020 [US1] Document run instructions in `scripts/dependency-detection/README.md` (path: `scripts/dependency-detection/README.md`)

### Refactor & Docs

- [ ] T021 [US1] Add JSDoc/type definitions for detection outputs in `types/dependency.d.ts` (path: `types/dependency.d.ts`)
- [ ] T022 [US1] Add example usage to the feature README `specs/004-description-we-want/README.md` (path: `specs/004-description-we-want/README.md`)

---

## Phase 4: User Story 2 - Safe upgrade execution in feature branches (Priority: P2)

Goal: Apply upgrades in isolated branches/PRs and validate them via CI before merge.

Independent Test: From a generated proposal, run the PR-creation workflow in dry-run mode and confirm a branch/patch is produced and builds successfully in CI.

### Tests (RED)

- [ ] T023 [P] [US2] Write integration test that simulates applying a proposal and verifying the branch builds (expected to FAIL initially) (path: `tests/integration/upgrade-apply.spec.ts`)

### Implementation (GREEN)

- [ ] T024 [P] [US2] Implement PR creation script that converts a proposal into branch metadata (dry-run) (path: `scripts/dependency-detection/create-pr.ts`)
- [ ] T025 [US2] Add CI workflow to validate upgrade branches `./.github/workflows/upgrade-validation.yml` (path: `/.github/workflows/upgrade-validation.yml`)
- [ ] T026 [US2] Add extended integration test job example `ci/snippets/extended-integration.yml` (path: `ci/snippets/extended-integration.yml`)
- [ ] T027 [US2] Create integration verification test that runs the repo build against the generated branch/patch (path: `tests/integration/upgrade-apply.spec.ts`)

### Integration & Verification

- [ ] T028 [US2] Document PR creation and CI gating behavior in `specs/004-description-we-want/README.md` (path: `specs/004-description-we-want/README.md`)

---

## Phase 5: User Story 3 - Rollback and monitoring (Priority: P3)

Goal: Provide clear rollback steps and monitoring guidance so regression in staging or production can be reverted quickly.

Independent Test: Execute the rollback dry-run (non-destructive) and confirm it produces the expected revert actions and that test suite returns to baseline.

### Tests (RED)

- [ ] T029 [P] [US3] Write a dry-run rollback test that verifies the rollback plan structure (expected to FAIL initially) (path: `tests/integration/rollback-dryrun.spec.ts`)

### Implementation (GREEN)

- [ ] T030 [US3] Implement rollback runbook and helper script outputs (path: `scripts/dependency-detection/rollback.ts`, `docs/rollback-dependency-upgrade.md`)
- [ ] T031 [P] [US3] Add monitoring checklist for upgrades (path: `docs/upgrade-monitoring-checklist.md`)
- [ ] T032 [US3] Add example staged rollback run in `specs/004-description-we-want/examples/rollback-sample.md` (path: `specs/004-description-we-want/examples/rollback-sample.md`)

### Integration & Verification

- [ ] T033 [US3] Run rollback dry-run and verify test `tests/integration/rollback-dryrun.spec.ts` passes after implementation (path: `tests/integration/rollback-dryrun.spec.ts`)

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Docs, CI snippets, security checks, and production readiness.

- [ ] T034 [P] Add CI snippets and examples to `ci/snippets/` (path: `ci/snippets/`)
- [ ] T035 [P] Add `pnpm audit` or SCA integration example to CI snippets (path: `ci/snippets/audit.yml`)
- [ ] T036 Update repository `README.md` with short section on "Automated dependency upgrades" and link to `specs/004-description-we-want/README.md` (path: `README.md`)
- [ ] T037 [P] Verify licensing/credentials notes are documented in `specs/004-description-we-want/README.md` (path: `specs/004-description-we-want/README.md`)
- [ ] T038 [P] Run quick security audit and attach findings to `specs/004-description-we-want/audit-findings.md` (path: `specs/004-description-we-want/audit-findings.md`)

---

## Dependencies & Execution Order

- Phase 1 (Setup) tasks T001-T005: can start immediately; several tasks marked [P] can run in parallel.
- Phase 2 (Foundational) tasks T006-T011: MUST complete before any User Story implementation (Phase 3+).
- User Story 1 (US1) tasks T012-T022 (P1): MVP — should be implemented first. Once Foundational is complete, US1 can be worked on immediately.
- User Story 2 (US2) tasks T023-T028 (P2): depends on Foundational and US1 artifacts (reports/proposals) but is independently testable.
- User Story 3 (US3) tasks T029-T033 (P3): depends on Foundational and CI; can be implemented after US1 but is independently testable.
- Final Phase tasks T034-T038: polish and cross-cutting; run after stories are validated.

### Story completion order (recommended):

1. US1 (P1) → detection prototype & proposal
2. US2 (P2) → PR/branch creation + CI validation
3. US3 (P3) → rollback & monitoring
4. Polish & cross-cutting

---

## Parallel Execution Examples

- Run detection unit tests and contract tests in parallel: `tests/unit/detection.spec.ts` and `tests/contract/report.schema.spec.ts` (tasks T012 and T013)
- Implement PR-creation script and CI workflow in parallel (different files, tasks T024 and T025)
- Create smoke-tests and CI snippets in parallel (tasks T009 and T034)

---

## Implementation Strategy (MVP-first)

- MVP scope: User Story 1 (detection + proposal) only. Deliverables: `scripts/dependency-detection/detect.ts`, `scripts/dependency-detection/report.json` example, unit + contract tests, and README.
- Incremental delivery: after MVP, add US2 (PR creation + CI validation) then US3 (rollback + monitoring).
- Keep each story independently testable: stop after US1 and validate before proceeding.

---

## Format Validation

All tasks follow the strict checklist format required by the speckit template:

- Each task starts with `- [ ]`
- Sequential Task IDs `T001` → `T038`
- `[P]` marker included when task is parallelizable
- `[USx]` story label included for story-specific tasks
- Every task description includes an explicit file path

---

## Files created by this generation

- `specs/004-description-we-want/tasks.md` — this file (tasks checklist and execution plan)
- (Implementation tasks reference creating files under `scripts/`, `tests/`, `ci/snippets/`, and `docs/`)

---

Please tell me if you want:

- I should write any of the implementation starter files now (detection prototype, CI workflow examples, or tests), or
- Generate a dependency graph visual (DOT/mermaid) for the story completion order, or
- Produce a condensed tasks-only `tasks.md` without the explanatory sections.
