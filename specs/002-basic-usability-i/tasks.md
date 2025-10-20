# Tasks: Basic Usability Enhancements - Dark Mode & Cross-Section Navigation

**Branch**: `002-basic-usability-i`  
**Input**: Design documents from `/specs/002-basic-usability-i/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/components.md, quickstart.md

**TDD Approach**: Following Constitution Principle IV - Tests written BEFORE implementation (RED-GREEN-REFACTOR cycle)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

### Path Conventions

- **Nuxt Application**: `app/components/`, `app/composables/`, `app/stores/`, `app/plugins/`
- **Components**: `.vue` files in `app/components/` with TypeScript `<script setup lang="ts">`
- **Tests**: Unit tests in `tests/functional/`, E2E in `tests/e2e/`
- **Types**: Shared types in `types/` directory

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions

- [x] T001 Create TypeScript type definitions in `types/theme.ts` for ThemeMode, ActiveTheme, ThemeState
- [x] T002 [P] Verify Tailwind configuration in `tailwind.config.js` has `darkMode: 'class'` setting
- [x] T003 [P] Add CSS transition styles to `app/assets/css/main.css` for smooth theme changes (200ms)

**Checkpoint**: Foundation ready - type system established ✅

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create Pinia theme store in `app/stores/theme.ts` with state structure (mode, current, isTransitioning)
- [x] T005 Create useTheme composable wrapper in `app/composables/useTheme.ts` for store access
- [x] T006 Create theme initialization plugin in `app/plugins/theme-init.client.ts` with enforce: 'pre'
- [x] T007 [P] Extend useNavigation composable in `app/composables/useNavigation.ts` with crossSection computed property

**Checkpoint**: Foundation ready - theme state management and navigation context available ✅

---

## Phase 3: User Story 1 - Dark Mode Toggle (Priority: P1) 🎯 MVP

**Goal**: Enable users to toggle between light and dark themes with system preference detection and persistence across sessions

**Independent Test**: Toggle theme button on any page, verify entire interface switches immediately, reload browser and verify theme persists

### RED Phase: Tests for User Story 1 (Write FIRST, Ensure FAIL) ⚠️ MANDATORY

**CRITICAL: Following [Constitution Principle IV](../../.specify/memory/constitution.md#iv-test-driven-development-non-negotiable)**

- [ ] T008 [P] [US1] **RED**: Write unit tests for theme store in `tests/functional/stores/theme.test.ts`
  - Test initial state (mode: 'system', current: detectSystemPreference())
  - Test toggle() action cycles light → dark → light
  - Test set() action sets explicit mode
  - Test detectSystemPreference() returns 'light' or 'dark'
  - Test isDark getter returns true when current is 'dark'
  - Test hasExplicitPreference getter returns false when mode is 'system'
  - Test toggleIcon getter returns 'sun' for dark, 'moon' for light
  - Test apply() adds/removes 'dark' class on document.documentElement
  - Test persist() writes to localStorage['theme-preference']
  - Test initialize() reads from localStorage and calls apply()
  - **Run tests, verify ALL FAIL, document failure**
- [ ] T009 [P] [US1] **RED**: Write unit tests for useTheme composable in `tests/functional/composables/useTheme.test.ts`

  - Test composable returns reactive refs for mode, current, isTransitioning
  - Test composable returns computed refs for isDark, toggleIcon
  - Test composable exposes toggle, set, detectSystemPreference functions
  - Test state updates propagate to refs
  - Test action calls reach theme store
  - **Run tests, verify ALL FAIL, document failure**

- [ ] T010 [P] [US1] **RED**: Write component tests for ThemeToggle in `tests/functional/components/ThemeToggle.test.ts`

  - Test renders UButton with correct icon (sun when dark, moon when light)
  - Test clicking button calls toggle() function
  - Test aria-label updates based on current theme
  - Test role="switch" and aria-checked attributes present
  - Test button is keyboard accessible (can be focused and activated)
  - **Run tests, verify ALL FAIL, document failure**

- [ ] T011 [P] [US1] **RED**: Write E2E tests for theme toggle flow in `tests/e2e/theme.spec.ts`
  - Test P1-AS-001: System theme detected on first visit (clear localStorage, verify system theme applies)
  - Test P1-AS-002: Click toggle changes theme immediately without page reload
  - Test P1-AS-003: Theme preference persists after browser close/reopen
  - Test P1-AS-004: Theme persists when navigating between frontend and admin sections
  - Test P1-AS-005: All components have sufficient contrast (4.5:1) in both themes
  - Test PV-001: Theme toggle execution completes in <50ms (Performance API measurement)
  - Test PV-003: No FOUC on page load (visual regression test)
  - Test PV-004: localStorage write completes in <10ms
  - **Run tests, verify ALL FAIL, document failure**

**Checkpoint: RED Phase Complete** - All US1 tests written and failing (proof of RED phase)

### GREEN Phase: Implementation for User Story 1

- [ ] T012 [US1] **GREEN**: Implement theme store actions in `app/stores/theme.ts`

  - Implement toggle() to cycle between light and dark
  - Implement set(mode) to set explicit theme
  - Implement detectSystemPreference() using window.matchMedia
  - Implement initialize() to read localStorage and apply theme
  - Implement persist() to write mode to localStorage
  - Implement apply() to add/remove 'dark' class on document.documentElement
  - **Verify T008 unit tests now PASS**

- [ ] T013 [US1] **GREEN**: Implement theme store getters in `app/stores/theme.ts`

  - Implement isDark getter
  - Implement hasExplicitPreference getter
  - Implement toggleIcon getter
  - **Verify T008 unit tests now PASS**

- [ ] T014 [US1] **GREEN**: Implement useTheme composable in `app/composables/useTheme.ts`

  - Return reactive refs using toRef(store, 'property')
  - Return computed refs for getters
  - Expose store action functions
  - **Verify T009 composable tests now PASS**

- [ ] T015 [US1] **GREEN**: Implement theme initialization plugin in `app/plugins/theme-init.client.ts`

  - Call themeStore.initialize() synchronously in setup()
  - Set up system preference change listener (matchMedia.addEventListener)
  - Only react to system changes when mode is 'system'
  - **Verify plugin initializes theme before hydration**

- [ ] T016 [US1] **GREEN**: Create ThemeToggle component in `app/components/ThemeToggle.vue`

  - Use useTheme() composable to get state and actions
  - Render Nuxt UI UButton with dynamic icon (sun/moon)
  - Add role="switch" and aria-checked attributes
  - Add dynamic aria-label describing action
  - Call toggle() on @click
  - **Verify T010 component tests now PASS**

- [ ] T017 [US1] **GREEN**: Add ThemeToggle to AppHeader in `app/components/AppHeader.vue`

  - Import and place ThemeToggle component in header
  - Position appropriately with other header controls
  - **Verify ThemeToggle renders in frontend header**

- [ ] T018 [US1] **GREEN**: Add ThemeToggle to AdminHeader in `app/components/AdminHeader.vue`

  - Import and place ThemeToggle component in admin header
  - Position appropriately with other admin header controls
  - **Verify ThemeToggle renders in admin header**

- [ ] T019 [US1] **GREEN**: Verify theme applies to all existing components
  - Check that existing components use Tailwind classes compatible with dark: variants
  - Add dark: variants to any components that need explicit dark mode styling
  - Test all pages (/, /info, /admin, /admin/users) in both themes
  - **Verify T011 E2E tests now PASS**

**Checkpoint: GREEN Phase Complete** - All US1 tests passing, feature functional

### REFACTOR Phase: Refactor for User Story 1 (Keep Tests GREEN)

- [ ] T020 [US1] **REFACTOR**: Optimize theme store code for clarity and performance

  - Extract repeated logic into private helper methods if needed
  - Ensure localStorage operations are try-catch wrapped
  - Add TypeScript type guards where appropriate
  - **Run T008 tests after each change, ensure they stay GREEN**

- [ ] T021 [US1] **REFACTOR**: Optimize ThemeToggle component

  - Simplify computed properties if possible
  - Ensure icon transitions are smooth (add CSS transition if needed)
  - Review accessibility attributes for completeness
  - **Run T010 tests after each change, ensure they stay GREEN**

- [ ] T022 [US1] **REFACTOR**: Add comprehensive JSDoc documentation
  - Document all theme store actions, getters, state properties
  - Document useTheme() composable with usage example
  - Document ThemeToggle component with usage example
  - Document theme-init plugin purpose and behavior
  - **Verify all tests still GREEN**

**Checkpoint: User Story 1 Complete** - Fully functional, tested, refactored, documented

### Standards Compliance Verification for User Story 1

**Reference: [Development Standards](../../.specify/memory/development-standards.md)**

- [ ] T023 [US1] Accessibility verification

  - ✅ ThemeToggle uses semantic <button> element (via UButton)
  - ✅ ThemeToggle is keyboard accessible (Tab to focus, Enter/Space to activate)
  - ✅ ARIA labels provided (role="switch", aria-checked, aria-label)
  - ✅ Focus states visible (Nuxt UI provides this)
  - ✅ Color contrast meets 4.5:1 ratio in both themes (verify with axe DevTools)
  - Run automated accessibility tests with Playwright + axe-core

- [ ] T024 [US1] Code quality verification

  - ✅ ThemeToggle component <50 lines (icon-only button)
  - ✅ Theme store <300 lines
  - ✅ useTheme composable <50 lines (simple wrapper)
  - ✅ ThemeToggle has 0 props (gets everything from composable)
  - ✅ No events emitted (uses composable actions)
  - ✅ Naming conventions: ThemeToggle.vue (PascalCase), useTheme.ts (camelCase with 'use'), theme.ts (camelCase)

- [ ] T025 [US1] Error handling verification

  - ✅ localStorage operations wrapped in try-catch in persist() and initialize()
  - ✅ Fallback to system preference when localStorage unavailable
  - ✅ matchMedia availability checked before use in detectSystemPreference()
  - ✅ No unhandled errors in theme switching (all graceful)

- [ ] T026 [US1] CSS & styling verification

  - ✅ ThemeToggle uses Nuxt UI UButton (Tailwind-based)
  - ✅ All theme styles use Tailwind dark: variants
  - ✅ Custom CSS for transitions justified (smooth theme change UX)
  - ✅ ThemeToggle responsive on mobile (375px), tablet (768px), desktop (1920px)
  - ✅ Dark mode support via dark: class on html element

- [ ] T027 [US1] Documentation verification
  - ✅ Theme store has JSDoc comments with @example
  - ✅ useTheme composable has JSDoc with @example
  - ✅ ThemeToggle component has JSDoc comment
  - ✅ Plugin has descriptive comment block
  - ✅ README updated with dark mode feature documentation
  - ✅ No new environment variables (no documentation needed)

**Final Checkpoint: User Story 1 Ready** - All standards met, fully testable independently ✅

---

## Phase 4: User Story 2 - Cross-Section Navigation (Priority: P2)

**Goal**: Provide convenient navigation links between frontend and admin sections without manual URL typing

**Independent Test**: Click "Admin Panel" link from frontend homepage, verify navigation to /admin with admin layout. Click "View Site" from admin, verify navigation to / with default layout. Verify theme persists across navigation.

### RED Phase: Tests for User Story 2 (Write FIRST, Ensure FAIL) ⚠️ MANDATORY

- [ ] T028 [P] [US2] **RED**: Write unit tests for useNavigation extension in `tests/functional/composables/useNavigation.test.ts`

  - Test crossSection.currentSection is 'frontend' when route.path is '/' or '/info'
  - Test crossSection.currentSection is 'admin' when route.path starts with '/admin'
  - Test crossSection.targetPath is '/admin' when in frontend
  - Test crossSection.targetPath is '/' when in admin
  - Test crossSection.targetLabel is 'Admin Panel' when in frontend
  - Test crossSection.targetLabel is 'View Site' when in admin
  - Test crossSection.showNav is always true
  - **Run tests, verify ALL FAIL, document failure**

- [ ] T029 [P] [US2] **RED**: Write component tests for AppHeader modifications in `tests/functional/components/AppHeader.test.ts`

  - Test admin navigation link renders when in frontend section
  - Test admin link has correct href ('/admin')
  - Test admin link has correct label ('Admin Panel')
  - Test admin link uses NuxtLink component
  - **Run tests, verify ALL FAIL, document failure**

- [ ] T030 [P] [US2] **RED**: Write component tests for AdminHeader modifications in `tests/functional/components/AdminHeader.test.ts`

  - Test frontend navigation link renders when in admin section
  - Test frontend link has correct href ('/')
  - Test frontend link has correct label ('View Site')
  - Test frontend link uses NuxtLink component
  - **Run tests, verify ALL FAIL, document failure**

- [ ] T031 [P] [US2] **RED**: Write E2E tests for cross-section navigation in `tests/e2e/navigation.spec.ts`
  - Test P2-AS-001: Admin link visible in frontend homepage header
  - Test P2-AS-002: Frontend link visible in admin header
  - Test P2-AS-003: Clicking admin link navigates to /admin with admin layout
  - Test P2-AS-004: Clicking frontend link navigates to / with default layout
  - Test P2-AS-005: Theme preference maintained during cross-section navigation
  - Test PV-002: Cross-section navigation completes in <500ms (client-side routing)
  - **Run tests, verify ALL FAIL, document failure**

**Checkpoint: RED Phase Complete** - All US2 tests written and failing

### GREEN Phase: Implementation for User Story 2

- [ ] T032 [US2] **GREEN**: Extend useNavigation composable in `app/composables/useNavigation.ts`

  - Add crossSection computed property
  - Calculate currentSection from route.path (starts with /admin → 'admin', else 'frontend')
  - Calculate targetPath (admin → '/', frontend → '/admin')
  - Calculate targetLabel (admin → 'View Site', frontend → 'Admin Panel')
  - Set showNav to true
  - **Verify T028 composable tests now PASS**

- [ ] T033 [US2] **GREEN**: Add admin navigation link to AppHeader in `app/components/AppHeader.vue`

  - Import and use useNavigation() composable
  - Add NuxtLink with :to="crossSection.targetPath"
  - Show link only when currentSection is 'frontend'
  - Use crossSection.targetLabel as link text
  - Style link consistently with other header links
  - **Verify T029 component tests now PASS**

- [ ] T034 [US2] **GREEN**: Add frontend navigation link to AdminHeader in `app/components/AdminHeader.vue`

  - Import and use useNavigation() composable
  - Add NuxtLink with :to="crossSection.targetPath"
  - Show link only when currentSection is 'admin'
  - Use crossSection.targetLabel as link text
  - Style link consistently with admin header style
  - **Verify T030 component tests now PASS**

- [ ] T035 [US2] **GREEN**: Optionally add frontend navigation to AdminSidebar in `app/components/AdminSidebar.vue`

  - Import useNavigation() composable
  - Add NuxtLink in sidebar menu
  - Position appropriately in sidebar navigation list
  - **Verify link appears and functions in admin sidebar**

- [ ] T036 [US2] **GREEN**: Test cross-section navigation flow end-to-end
  - Start on frontend homepage, verify admin link visible
  - Click admin link, verify navigation to /admin
  - Verify admin layout is applied
  - Verify theme persists from frontend to admin
  - Click frontend link, verify navigation to /
  - Verify default layout is applied
  - Verify theme persists from admin to frontend
  - **Verify T031 E2E tests now PASS**

**Checkpoint: GREEN Phase Complete** - All US2 tests passing, navigation functional

### REFACTOR Phase: Refactor for User Story 2 (Keep Tests GREEN)

- [ ] T037 [US2] **REFACTOR**: Optimize useNavigation extension for clarity

  - Simplify crossSection computed logic if possible
  - Extract route checking logic into helper function if complex
  - Add TypeScript type annotations for clarity
  - **Run T028 tests after changes, ensure they stay GREEN**

- [ ] T038 [US2] **REFACTOR**: Review navigation link styling consistency

  - Ensure admin link in AppHeader matches other header links
  - Ensure frontend link in AdminHeader matches admin header style
  - Add hover/focus states if not provided by Nuxt UI
  - **Run T029, T030 tests after changes, ensure they stay GREEN**

- [ ] T039 [US2] **REFACTOR**: Add comprehensive JSDoc documentation
  - Document crossSection property in useNavigation with example
  - Document navigation link usage in header components
  - Add code comments explaining section detection logic
  - **Verify all tests still GREEN**

**Checkpoint: User Story 2 Complete** - Fully functional, tested, refactored, documented

### Standards Compliance Verification for User Story 2

- [ ] T040 [US2] Accessibility verification

  - ✅ Navigation links use semantic <a> tags (via NuxtLink)
  - ✅ Links are keyboard accessible (in tab order)
  - ✅ Links have clear, descriptive text ('Admin Panel', 'View Site')
  - ✅ Links have visible focus states (Nuxt UI provides)
  - ✅ No ARIA needed (semantic HTML sufficient for links)

- [ ] T041 [US2] Code quality verification

  - ✅ useNavigation extension <50 lines of added code
  - ✅ Navigation links added to existing components (no new complexity)
  - ✅ crossSection computed property returns typed object
  - ✅ Naming conventions: useNavigation.ts (camelCase with 'use'), crossSection (camelCase)

- [ ] T042 [US2] Error handling verification

  - ✅ Route checking is defensive (handles undefined paths)
  - ✅ Navigation always provides valid targetPath
  - ✅ No special error handling needed (Nuxt router handles navigation errors)

- [ ] T043 [US2] CSS & styling verification

  - ✅ Navigation links use existing Nuxt UI Link styles or Tailwind utilities
  - ✅ No custom CSS added (justified by using existing styles)
  - ✅ Links responsive on mobile, tablet, desktop
  - ✅ Links work in both light and dark themes (inherit theme)

- [ ] T044 [US2] Documentation verification
  - ✅ useNavigation extension has JSDoc with @example
  - ✅ Navigation link usage documented in component comments
  - ✅ README updated with cross-section navigation feature
  - ✅ No new types needed (using existing TypeScript types)

**Final Checkpoint: User Story 2 Ready** - All standards met, fully testable independently ✅

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and validation across both user stories

- [ ] T045 [P] Run full test suite to verify all tests pass (unit, component, E2E)
- [ ] T046 [P] Run linter (`pnpm lint`) and fix any issues
- [ ] T047 Verify performance targets met:
  - Theme toggle <50ms (PV-001)
  - Cross-section navigation <500ms (PV-002)
  - No FOUC <1% occurrence (PV-003)
  - localStorage operations <10ms (PV-004)
- [ ] T048 [P] Manual accessibility testing with screen reader (NVDA/JAWS)
  - Test theme toggle announcement
  - Test navigation link announcement
  - Verify keyboard navigation works completely
- [ ] T049 [P] Visual regression testing for FOUC prevention
  - Test page loads with saved dark preference
  - Verify no flash of light theme before dark theme applies
- [ ] T050 [P] Cross-browser testing (Chrome, Firefox, Safari, Edge)
  - Verify theme toggle works in all browsers
  - Verify navigation works in all browsers
  - Check for any browser-specific issues
- [ ] T051 Update README.md with:
  - Dark mode feature overview
  - How to use theme toggle
  - Cross-section navigation explanation
  - Browser support requirements
  - Accessibility features
- [ ] T052 Review and cleanup code:
  - Remove console.log statements
  - Remove commented-out code
  - Check for TODO comments
  - Verify all TypeScript errors resolved
- [ ] T053 Run quickstart.md final checklist validation
- [ ] T054 Create git commit with conventional commit message:
  - `feat: add dark mode toggle and cross-section navigation`

### Final TDD Verification (MANDATORY)

**Constitutional Requirement Check** - [Principle IV](../../.specify/memory/constitution.md#iv-test-driven-development-non-negotiable)

- [ ] T055 Review git commit history to verify test commits BEFORE implementation commits
  - Verify T008-T011 (US1 RED phase) committed before T012-T019 (US1 GREEN phase)
  - Verify T028-T031 (US2 RED phase) committed before T032-T036 (US2 GREEN phase)
- [ ] T056 Verify test coverage meets >80% threshold:
  - Theme store: 100% coverage
  - useTheme composable: 100% coverage
  - ThemeToggle component: 100% coverage
  - useNavigation extension: 100% coverage
- [ ] T057 Confirm all tests initially failed (RED phase documented)
  - Review test failure logs from T008-T011 (US1)
  - Review test failure logs from T028-T031 (US2)
- [ ] T058 Confirm all tests now pass (GREEN phase achieved)
  - Run `pnpm test` - all tests must pass
  - Run `pnpm test:e2e` - all E2E tests must pass
- [ ] T059 Verify code was refactored while maintaining green tests
  - Tests remained green through T020-T022 (US1 REFACTOR)
  - Tests remained green through T037-T039 (US2 REFACTOR)
- [ ] T060 Document TDD process in commit messages and PR description

**NO SPEC IS COMPLETE WITHOUT PASSING TESTS THAT WERE INITIALLY FAILING** ✅

### Final Standards Compliance Review

**Reference: [Development Standards](../../.specify/memory/development-standards.md)**

- [ ] T061 All components follow naming conventions:
  - ✅ ThemeToggle.vue (PascalCase)
  - ✅ useTheme.ts, useNavigation.ts (camelCase with 'use')
  - ✅ theme.ts store (camelCase)
- [ ] T062 All components within complexity limits:
  - ✅ ThemeToggle <50 lines
  - ✅ Theme store <300 lines
  - ✅ All composables <100 lines
  - ✅ ThemeToggle has 0 props, 0 emits
- [ ] T063 All features meet accessibility requirements (WCAG 2.1 AA):
  - ✅ Semantic HTML
  - ✅ Keyboard accessible
  - ✅ ARIA labels where needed
  - ✅ Color contrast 4.5:1 ratio
  - ✅ Focus states visible
- [ ] T064 All error handling patterns implemented:
  - ✅ localStorage try-catch
  - ✅ matchMedia availability check
  - ✅ Graceful fallbacks
- [ ] T065 All CSS follows Tailwind-first approach:
  - ✅ Nuxt UI components used
  - ✅ dark: variants for theme
  - ✅ Custom CSS justified (transitions)
- [ ] T066 All code properly documented:
  - ✅ JSDoc on all public functions
  - ✅ Component usage examples
  - ✅ README updated
- [ ] T067 No unapproved dependencies added:
  - ✅ All dependencies from plan.md
  - ✅ No new packages installed
- [ ] T068 Performance budgets met:
  - ✅ Theme toggle <50ms
  - ✅ Navigation <500ms
  - ✅ No FOUC
  - ✅ No FCP degradation
  - ✅ Bundle size impact minimal (<5kb)

**Final Status: Feature Complete** - Ready for PR and review ✅

---

## Dependencies & Execution Order

### Phase Dependencies

1. **Setup (Phase 1)**: No dependencies - can start immediately

   - Creates type definitions and configuration
   - Enables TypeScript autocomplete for theme types

2. **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS both user stories

   - Creates core theme infrastructure (store, composable, plugin)
   - Extends navigation composable
   - MUST be complete before US1 or US2 can begin

3. **User Story 1 (Phase 3)**: Can start after Foundational completion

   - No dependencies on User Story 2
   - Independently testable
   - MVP-ready once complete

4. **User Story 2 (Phase 4)**: Can start after Foundational completion

   - No dependencies on User Story 1 (though theme persists across navigation)
   - Independently testable
   - Can be developed in parallel with US1 if team capacity allows

5. **Polish (Phase 5)**: Depends on completion of both US1 and US2
   - Final verification and cleanup
   - TDD compliance check
   - Standards compliance review

### User Story Dependencies

- **US1 (Dark Mode)**: Independent - can be completed and tested without US2
- **US2 (Cross-Section Navigation)**: Independent - can be completed and tested without US1
- **Integration**: US2 tests verify theme persists across navigation (integration with US1), but US2 is functional even without dark mode

### Within Each User Story

**TDD Cycle Order (MANDATORY)**:

1. **RED Phase**: Write ALL tests first, verify they FAIL
2. **GREEN Phase**: Implement minimum code to pass tests
3. **REFACTOR Phase**: Improve code while keeping tests GREEN

**Implementation Order within GREEN Phase**:

1. Store/composable logic first (data layer)
2. Components second (presentation layer)
3. Integration third (wiring components together)

### Parallel Opportunities

**Phase 1 (Setup)**:

- T002 (Tailwind config) and T003 (CSS transitions) can run in parallel with T001 (types)

**Phase 2 (Foundational)**:

- T007 (useNavigation extension) can run in parallel with T004-T006 (theme infrastructure)

**RED Phase for US1**:

- T008 (store tests), T009 (composable tests), T010 (component tests), T011 (E2E tests) can all be written in parallel

**GREEN Phase for US1**:

- T017 (AppHeader) and T018 (AdminHeader) can run in parallel after T016 (ThemeToggle) is complete

**RED Phase for US2**:

- T028 (navigation tests), T029 (AppHeader tests), T030 (AdminHeader tests), T031 (E2E tests) can all be written in parallel

**GREEN Phase for US2**:

- T033 (AppHeader), T034 (AdminHeader), T035 (AdminSidebar) can all run in parallel after T032 (useNavigation) is complete

**Phase 5 (Polish)**:

- Most tasks marked [P] (T045, T046, T048, T049, T050) can run in parallel

### Parallel Team Strategy

**Single Developer**: Sequential priority order

1. Setup → Foundational → US1 (MVP) → US2 → Polish

**Two Developers**:

1. Both: Setup + Foundational together
2. Dev A: US1 (Dark Mode) - RED → GREEN → REFACTOR
3. Dev B: US2 (Cross-Section Navigation) - RED → GREEN → REFACTOR
4. Both: Polish + Final TDD Verification together

**Note**: US1 and US2 can be developed completely in parallel after Foundational phase completes

---

## Parallel Example: User Story 1 RED Phase

```bash
# Launch all test writing for User Story 1 together:
Task: "Write theme store tests in tests/functional/stores/theme.test.ts"
Task: "Write useTheme tests in tests/functional/composables/useTheme.test.ts"
Task: "Write ThemeToggle tests in tests/functional/components/ThemeToggle.test.ts"
Task: "Write E2E theme tests in tests/e2e/theme.spec.ts"

# Then run all tests together and verify they ALL FAIL
```

---

## Implementation Strategy

### MVP First (User Story 1 Only) - Recommended

1. ✅ Complete Phase 1: Setup (T001-T003)
2. ✅ Complete Phase 2: Foundational (T004-T007) - CRITICAL
3. ✅ Complete Phase 3: User Story 1 (T008-T027) - Full TDD cycle
4. **STOP and VALIDATE**:
   - Theme toggle works on all pages
   - System preference detected
   - Theme persists across sessions
   - No FOUC on page load
   - Performance targets met
   - Accessibility verified
5. **DEMO/DEPLOY**: Dark mode is a complete, valuable feature
6. Optionally add US2 later as enhancement

### Incremental Delivery (Both Stories)

1. ✅ Complete Setup + Foundational (T001-T007)
2. ✅ Complete User Story 1 (T008-T027) → Test independently → Deploy/Demo MVP
3. ✅ Complete User Story 2 (T028-T044) → Test independently → Deploy/Demo enhancement
4. ✅ Complete Polish (T045-T068) → Final validation → Deploy/Demo complete feature
5. Each milestone adds value without breaking previous functionality

### Parallel Team Strategy (If Available)

**After Foundational Phase (T007) Completes**:

- **Developer A**: User Story 1 (T008-T027)

  - RED: Write all tests (T008-T011)
  - GREEN: Implement (T012-T019)
  - REFACTOR: Optimize (T020-T022)
  - VERIFY: Standards (T023-T027)

- **Developer B**: User Story 2 (T028-T044)

  - RED: Write all tests (T028-T031)
  - GREEN: Implement (T032-T036)
  - REFACTOR: Optimize (T037-T039)
  - VERIFY: Standards (T040-T044)

- **Both Together**: Polish (T045-T068)

**Timeline**: Parallel development can reduce time by ~40%

---

## Task Summary

**Total Tasks**: 68 tasks across 5 phases

**Task Distribution**:

- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 4 tasks (BLOCKING)
- Phase 3 (US1 - Dark Mode): 20 tasks
  - RED: 4 tasks (T008-T011)
  - GREEN: 8 tasks (T012-T019)
  - REFACTOR: 3 tasks (T020-T022)
  - Standards: 5 tasks (T023-T027)
- Phase 4 (US2 - Navigation): 17 tasks
  - RED: 4 tasks (T028-T031)
  - GREEN: 5 tasks (T032-T036)
  - REFACTOR: 3 tasks (T037-T039)
  - Standards: 5 tasks (T040-T044)
- Phase 5 (Polish): 24 tasks (T045-T068)
  - General: 10 tasks (T045-T054)
  - TDD Verification: 6 tasks (T055-T060)
  - Standards Review: 8 tasks (T061-T068)

**Parallel Opportunities**: 15+ tasks can run in parallel across different phases

**Independent Test Criteria**:

- US1: Toggle theme on any page, verify persistence and no FOUC
- US2: Click cross-section links, verify navigation and theme persistence

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1 only) = 27 tasks

- Delivers complete dark mode feature
- All TDD requirements met
- All standards verified
- Independently valuable to users

**Time Estimate** (single developer):

- MVP (US1 only): ~2-3 days
- Full feature (US1 + US2): ~3-4 days
- With parallel team: ~2 days for full feature

---

## Notes

- **[P]** = Tasks with different files, no dependencies, can run in parallel
- **[Story]** = Links task to specific user story for traceability
- **TDD MANDATORY**: All RED phase tasks MUST verify tests FAIL before moving to GREEN phase
- **Constitution Compliance**: This task list enforces Principle IV (Test-Driven Development)
- Each user story is independently completable and testable
- MVP recommendation: Stop after US1, validate, deploy, then add US2 as enhancement
- Avoid: Starting GREEN phase before RED phase complete, skipping REFACTOR phase, batch test failures
- Commit strategy: Commit after RED phase (failing tests), after GREEN phase (passing tests), after REFACTOR phase (clean code)
- Review checkpoints at end of each phase before proceeding
