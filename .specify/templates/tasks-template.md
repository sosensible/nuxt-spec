---
description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

### Path Conventions

- **Nuxt Application**: `app/components/`, `app/pages/`, `app/server/api/`, `tests/`
- **Components**: `.vue` files in `app/components/` with TypeScript `<script setup lang="ts">`
- **Server APIs**: TypeScript files in `app/server/api/` following Nuxt server route patterns
- **Tests**: Component tests in `tests/components/`, API tests in `tests/server/`, E2E in `tests/e2e/`
- **Types**: Shared types in `types/` directory for client-server boundary definitions

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit.tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create project structure per implementation plan
- [ ] T002 Initialize [language] project with [framework] dependencies
- [ ] T003 [P] Configure linting and formatting tools

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks for Nuxt applications:

- [ ] T004 Configure Nuxt UI theme and design system in `app.config.ts`
- [ ] T005 [P] Setup server API middleware in `app/server/middleware/`
- [ ] T006 [P] Create base layouts in `app/layouts/` (default, auth, admin)
- [ ] T007 Define shared TypeScript types in `types/` for client-server contracts
- [ ] T008 Configure error handling for both client and server in `app/plugins/`
- [ ] T009 Setup environment configuration with `runtimeConfig` in `nuxt.config.ts`
- [ ] T010 [P] Create base composables in `app/composables/` for shared logic

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (TDD - Write FIRST, Ensure FAIL) ⚠️ MANDATORY

**CRITICAL: Following [Constitution Principle IV](../memory/constitution.md#iv-test-driven-development-non-negotiable)**

**RED Phase (Tests Written BEFORE Implementation)**:

- [ ] T011 [P] [US1] Component tests for [ComponentName] in tests/components/[component-name].nuxt.spec.ts
  - Write test, run test, verify FAILS, document failure
- [ ] T012 [P] [US1] Server API tests for [endpoint] in tests/server/api/[endpoint].spec.ts
  - Write test, run test, verify FAILS, document failure
- [ ] T013 [P] [US1] E2E test for [user journey] in tests/e2e/[journey-name].spec.ts
  - Write test, run test, verify FAILS, document failure

**Checkpoint: RED Phase Complete** - All tests written and failing (proof of RED phase)

### Implementation for User Story 1 (GREEN Phase)

- [ ] T014 [P] [US1] Create [ComponentName] component in app/components/[ComponentName].vue
  - Verify T011 component tests now PASS
- [ ] T015 [P] [US1] Create page component in app/pages/[route-name].vue
  - Verify related tests now PASS
- [ ] T016 [US1] Implement server API route in app/server/api/[endpoint].ts
  - Verify T012 API tests now PASS
- [ ] T017 [US1] Create composable for business logic in app/composables/use[FeatureName].ts
  - Verify composable tests now PASS
- [ ] T018 [US1] Add form validation and error handling with Nuxt UI components
  - Verify E2E tests (T013) now PASS
- [ ] T019 [US1] Configure route rules in nuxt.config.ts for optimal rendering
- [ ] T020 [US1] Add TypeScript types in types/[feature].ts for client-server contracts

**Checkpoint: GREEN Phase Complete** - All tests passing

### Refactor for User Story 1 (REFACTOR Phase - Keep Tests GREEN)

- [ ] T021 [US1] Refactor component code for clarity and maintainability
  - Run tests after each refactor, ensure they stay GREEN
- [ ] T022 [US1] Optimize performance (code splitting, lazy loading if needed)
  - Verify tests still GREEN
- [ ] T023 [US1] Add component documentation (JSDoc with @example)
  - Tests remain GREEN

**Checkpoint: User Story 1 Complete** - Fully functional, tested, refactored, and documented

### Standards Compliance Verification for User Story 1

**Reference: [Development Standards](../memory/development-standards.md)**

- [ ] T024 [US1] Accessibility verification
  - Semantic HTML elements used
  - Keyboard navigation works
  - ARIA labels on icon buttons
  - Focus states visible
  - Passes axe-core automated tests
- [ ] T025 [US1] Code quality verification
  - Component < 300 lines
  - < 10 props per component
  - < 5 events per component
  - Naming conventions followed
- [ ] T026 [US1] Error handling verification
  - All async operations have try-catch
  - Loading/error/success states implemented
  - User-friendly error messages
  - Server errors properly logged
- [ ] T027 [US1] CSS & styling verification
  - Tailwind utilities used
  - No custom CSS (or justified and documented)
  - Responsive at mobile/tablet/desktop
  - Dark mode support included
- [ ] T028 [US1] Documentation verification
  - Components have JSDoc
  - API routes documented
  - README updated
  - Types documented

**Final Checkpoint: User Story 1 Ready** - All standards met, fully testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (TDD - Write FIRST, Ensure FAIL) ⚠️ MANDATORY

**RED Phase**:

- [ ] T029 [P] [US2] Component tests - Write and verify FAIL
- [ ] T030 [P] [US2] API contract tests - Write and verify FAIL
- [ ] T031 [P] [US2] E2E tests - Write and verify FAIL

**Checkpoint: RED Phase Complete**

### Implementation for User Story 2 (GREEN Phase)

- [ ] T032 [P] [US2] Create components - Verify tests PASS
- [ ] T033 [US2] Implement API routes - Verify tests PASS
- [ ] T034 [US2] Create composables - Verify tests PASS
- [ ] T035 [US2] Integrate with User Story 1 (if needed)

**Checkpoint: GREEN Phase Complete**

### Refactor for User Story 2 (REFACTOR Phase)

- [ ] T036 [US2] Refactor and optimize - Keep tests GREEN
- [ ] T037 [US2] Add documentation

**Checkpoint: User Story 2 Complete**

### Standards Compliance Verification for User Story 2

- [ ] T038 [US2] Accessibility verification (semantic HTML, keyboard nav, ARIA)
- [ ] T039 [US2] Code quality verification (complexity limits, naming)
- [ ] T040 [US2] Error handling verification (try-catch, states, messages)
- [ ] T041 [US2] CSS verification (Tailwind-first, responsive, dark mode)
- [ ] T042 [US2] Documentation verification (JSDoc, README)

**Final Checkpoint: User Story 2 Ready**

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (TDD - Write FIRST, Ensure FAIL) ⚠️ MANDATORY

**RED Phase**:

- [ ] T043 [P] [US3] Component tests - Write and verify FAIL
- [ ] T044 [P] [US3] API contract tests - Write and verify FAIL
- [ ] T045 [P] [US3] E2E tests - Write and verify FAIL

**Checkpoint: RED Phase Complete**

### Implementation for User Story 3 (GREEN Phase)

- [ ] T046 [P] [US3] Create components - Verify tests PASS
- [ ] T047 [US3] Implement API routes - Verify tests PASS
- [ ] T048 [US3] Create composables - Verify tests PASS

**Checkpoint: GREEN Phase Complete**

### Refactor for User Story 3 (REFACTOR Phase)

- [ ] T049 [US3] Refactor and optimize - Keep tests GREEN
- [ ] T050 [US3] Add documentation

**Checkpoint: User Story 3 Complete**

### Standards Compliance Verification for User Story 3

- [ ] T051 [US3] Accessibility verification
- [ ] T052 [US3] Code quality verification
- [ ] T053 [US3] Error handling verification
- [ ] T054 [US3] CSS verification
- [ ] T055 [US3] Documentation verification

**Final Checkpoint: User Story 3 Ready - All user stories independently functional**

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Code cleanup and refactoring
- [ ] TXXX Performance optimization across all stories
- [ ] TXXX [P] Additional unit tests (if needed) in tests/unit/
- [ ] TXXX Security hardening
- [ ] TXXX Run quickstart.md validation

### Final TDD Verification (MANDATORY)

**Constitutional Requirement Check** - [Principle IV](../memory/constitution.md#iv-test-driven-development-non-negotiable)

- [ ] TXXX Review git commit history to verify test commits BEFORE implementation commits
- [ ] TXXX Verify test coverage meets >80% threshold for components and server routes
- [ ] TXXX Confirm all tests initially failed (RED phase documented)
- [ ] TXXX Confirm all tests now pass (GREEN phase achieved)
- [ ] TXXX Verify code was refactored while maintaining green tests
- [ ] TXXX Document any exceptions to TDD process with justification

**NO SPEC IS COMPLETE WITHOUT PASSING TESTS THAT WERE INITIALLY FAILING**

### Final Standards Compliance Review

**Reference: [Development Standards](../memory/development-standards.md)**

- [ ] TXXX All components follow naming conventions
- [ ] TXXX All components within complexity limits
- [ ] TXXX All features meet accessibility requirements (WCAG 2.1 AA)
- [ ] TXXX All error handling patterns implemented
- [ ] TXXX All CSS follows Tailwind-first approach
- [ ] TXXX All code properly documented
- [ ] TXXX README updated with all new features
- [ ] TXXX No unapproved dependencies added
- [ ] TXXX Bundle size within limits
- [ ] TXXX Performance budgets met (<3s FCP, <100ms API, <500kb bundle)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Contract test for [endpoint] in tests/contract/test_[name].py"
Task: "Integration test for [user journey] in tests/integration/test_[name].py"

# Launch all models for User Story 1 together:
Task: "Create [Entity1] model in src/models/[entity1].py"
Task: "Create [Entity2] model in src/models/[entity2].py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
