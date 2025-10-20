# Implementation Plan: Basic Usability Enhancements - Dark Mode & Cross-Section Navigation

**Branch**: `002-basic-usability-i` | **Date**: October 20, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-basic-usability-i/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature adds dark mode theme support with system preference detection and cross-section navigation links between frontend and admin sections. The technical approach uses Pinia store for theme state management (accessed via composable), Tailwind's dark: variant system for styling, Nuxt UI v4 components for the theme toggle control, and localStorage for preference persistence. Navigation links use Nuxt router for client-side routing between sections while maintaining theme consistency.

## Technical Context

**Language/Version**: Nuxt 4.x with Vue 3 Composition API and TypeScript strict mode
**Primary Dependencies**: @nuxt/ui v4, @nuxt/image, Pinia, Tailwind CSS, @nuxt/scripts, Nuxt Test Utils
**Storage**: localStorage for client-side theme preference persistence (no server-side storage required)
**Testing**: Vitest for unit/component tests, Nuxt Test Utils for Nuxt-specific testing, Playwright for E2E tests
**Target Platform**: Universal - supports SSR, CSR, and static generation
**Project Type**: Nuxt full-stack application with existing layouts (default.vue, admin.vue)
**Performance Goals**: Theme toggle <50ms, cross-section navigation <500ms, no FOUC, <3s FCP maintained
**Constraints**: SSR/CSR compatibility for theme detection, theme persistence without server calls, WCAG 2.1 AA contrast requirements
**Scale/Scope**: Affects all pages (frontend and admin), all existing components must support dark mode, ~10 components to update for theming

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Modular Component Architecture**: ThemeToggle component will be composable and reusable, using Vue 3 Composition API with useTheme() composable
- [x] **Universal Rendering**: Theme detection works in SSR (server-side system preference detection) and CSR (client-side toggle), no special route rules needed
- [x] **API-First Development**: N/A - No server API routes required (theme is client-side only, navigation uses existing Nuxt router)
- [x] **Test-Driven Development**: RED-GREEN-REFACTOR cycle will be followed - tests written BEFORE implementation for theme store, ThemeToggle component, navigation links, and E2E user flows
- [x] **Deployment Versatility**: Solution is client-side only (localStorage + CSS variables), works across static, serverless, and Node.js deployments
- [x] **Performance Budget**: Theme toggle <50ms (well under <100ms API target), navigation <500ms, no impact on FCP/bundle size beyond minimal CSS
- [x] **Type Safety**: TypeScript strict mode for theme store, composable return types, and component props

## Standards Compliance Checklist

_Reference: [Development Standards](../../.specify/memory/development-standards.md)_

### State Management

- [x] State management pattern identified: Pinia store for theme state, accessed exclusively via useTheme() composable
- [x] Store access pattern follows composable wrapper requirement (no direct theme store imports in components)
- [x] Justification: Theme state needs to be shared across all components and persist across navigation - Pinia store is appropriate

### Component Design

- [x] Component communication pattern defined: ThemeToggle uses theme composable for state, navigation links use props for labels/destinations
- [x] Component complexity within limits: ThemeToggle <50 lines, navigation links <30 lines, both <10 props
- [x] Naming conventions specified: ThemeToggle.vue (PascalCase), useTheme.ts (camelCase with `use` prefix), theme.ts store

### Accessibility & UX

- [x] WCAG 2.1 AA compliance requirements identified: 4.5:1 contrast ratio for all theme color combinations, keyboard navigation for toggle
- [x] Semantic HTML structure planned: <button> for theme toggle, <nav> for section links, proper ARIA labels
- [x] Keyboard navigation requirements defined: Theme toggle accessible via Tab, activated via Enter/Space, navigation links in tab order
- [x] Screen reader support requirements specified: Theme toggle announces "Light/Dark mode", navigation links clearly labeled

### Error Handling

- [x] Client-side error handling strategy defined: Graceful fallback to system preference if localStorage unavailable
- [x] Server-side error handling strategy defined: N/A - no server-side operations
- [x] Error boundaries identified: N/A - theme switching is non-critical, failures fall back to system preference

### Documentation

- [x] Component documentation requirements identified: JSDoc for ThemeToggle, useTheme() composable with usage examples
- [x] API route documentation requirements identified: N/A - no API routes for this feature
- [x] README updates planned: Document theme toggle usage, navigation link patterns, dark mode color customization

### CSS & Styling

- [x] Tailwind-first approach confirmed: All theme styles use Tailwind's dark: variant system
- [x] Custom CSS justified if needed: May need custom CSS for smooth theme transitions (200-300ms), will use Tailwind @apply if possible
- [x] Responsive design requirements defined: Theme toggle visible on mobile (hamburger menu), tablet (header), desktop (header)
- [x] Dark mode support confirmed: This IS the dark mode feature - implements Tailwind's class-based dark mode strategy

## Project Structure

### Documentation (this feature)

```
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```
app/
├── components/
│   ├── ThemeToggle.vue              # NEW: Theme toggle button component (Nuxt UI v4)
│   ├── AppHeader.vue                # MODIFY: Add ThemeToggle and admin navigation link
│   ├── AppFooter.vue                # EXISTING: May add theme toggle for mobile
│   ├── AdminHeader.vue              # MODIFY: Add ThemeToggle and frontend navigation link
│   └── AdminSidebar.vue             # MODIFY: Add frontend navigation link
│
├── composables/
│   └── useTheme.ts                  # NEW: Theme state composable wrapper for store
│
├── stores/
│   └── theme.ts                     # NEW: Pinia store for theme state management
│
├── layouts/
│   ├── default.vue                  # MODIFY: Add dark: class binding to root element
│   └── admin.vue                    # MODIFY: Add dark: class binding to root element
│
├── pages/
│   ├── index.vue                    # EXISTING: Will inherit dark mode support
│   ├── info.vue                     # EXISTING: Will inherit dark mode support
│   ├── admin-test.vue              # EXISTING: Will inherit dark mode support
│   └── admin/
│       ├── index.vue               # EXISTING: Will inherit dark mode support
│       └── users.vue               # EXISTING: Will inherit dark mode support
│
└── assets/
    └── css/
        └── main.css                 # MODIFY: Add dark mode color CSS variables if needed

tests/
├── functional/
│   ├── theme.test.ts               # NEW: Unit tests for theme store and composable
│   └── components/
│       └── ThemeToggle.test.ts     # NEW: Component tests for ThemeToggle
│
└── e2e/
    ├── theme.spec.ts               # NEW: E2E tests for theme toggle and persistence
    └── navigation.spec.ts          # MODIFY: Add cross-section navigation tests

types/
└── theme.ts                        # NEW: TypeScript types for theme state
```

**Structure Decision**: This feature extends the existing Nuxt application structure without requiring new directories. The theme state management follows the established pattern (Pinia store + composable wrapper). Navigation links are integrated into existing header/sidebar components. All existing pages and components will automatically support dark mode through Tailwind's dark: variants applied at the layout level.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

**No Constitution Violations**: All constitutional requirements are met. The feature uses established patterns (Pinia store via composable, Tailwind dark mode, Nuxt UI components) and requires no custom complexity beyond Nuxt's built-in solutions.

## Phase 0: Research & Unknowns

**Status**: ✅ Complete

All technical decisions are clear from the specification and existing project architecture:

1. **Theme State Management**: Pinia store accessed via `useTheme()` composable (established pattern in project)
2. **Dark Mode Implementation**: Tailwind's class-based dark mode with `dark:` variants (already configured in project)
3. **Theme Toggle UI**: Nuxt UI v4 components (project standard per NFR-007)
4. **System Preference Detection**: `prefers-color-scheme` media query (standard Web API)
5. **Theme Persistence**: localStorage with fallback to system preference (standard pattern)
6. **SSR Theme Hydration**: Nuxt plugin to read localStorage and set class before hydration (established pattern)
7. **Cross-Section Navigation**: NuxtLink components with router paths (standard Nuxt routing)

**No research required** - proceeding directly to Phase 1 (Design & Contracts).

**Output**: [research.md](./research.md) - Documents all technical decisions and rationale

## Phase 1: Design & Contracts

**Status**: ✅ Complete

### Artifacts Generated

1. **[data-model.md](./data-model.md)**: Defines Theme Preference and Navigation Context entities

   - Theme Preference: mode (light/dark/system), current (computed), isTransitioning
   - Navigation Context: currentSection, targetPath, targetLabel, showNav
   - Store structure, composable interfaces, state transitions
   - 35+ test cases defined for data model validation

2. **[contracts/components.md](./contracts/components.md)**: Complete API contracts

   - Theme Store contract: state, getters, actions with behavior specs
   - useTheme() composable contract: return types and usage examples
   - useNavigation() extension contract: cross-section navigation context
   - ThemeToggle component contract: props, emits, accessibility requirements
   - Modified component contracts: AppHeader, AdminHeader, layouts
   - Plugin contract: theme-init.client.ts pre-hydration initialization
   - Type definitions, CSS contracts, localStorage schema
   - Performance contracts: <50ms toggle, <500ms navigation, no FOUC
   - 60+ test cases across all contract levels

3. **[quickstart.md](./quickstart.md)**: Development setup and TDD workflow

   - Prerequisites and environment setup
   - RED-GREEN-REFACTOR workflow with detailed steps
   - Testing commands and manual testing checklists
   - Troubleshooting guide and performance verification
   - Accessibility verification procedures
   - Final completion checklist

4. **Agent Context Updated**:
   - GitHub Copilot instructions updated with new technologies
   - Added: localStorage for theme persistence
   - Technologies tracked: Nuxt 4.x, @nuxt/ui v4, Pinia, Tailwind, Nuxt Test Utils

### Constitution Re-Check (Post-Design)

All constitutional principles remain satisfied:

- ✅ Modular Component Architecture: ThemeToggle is fully composable
- ✅ Universal Rendering: SSR/CSR compatible design confirmed
- ✅ API-First: N/A (client-side feature)
- ✅ Test-Driven Development: 60+ test cases defined before implementation
- ✅ Deployment Versatility: Client-side design works everywhere
- ✅ Performance Budget: <50ms toggle, <500ms navigation targets met
- ✅ Type Safety: TypeScript contracts fully defined

### Design Decisions Summary

**Theme Management**:

- Pinia store with composable wrapper (established pattern)
- Tailwind class-based dark mode (`dark:` variants)
- localStorage persistence with system preference fallback
- Pre-hydration plugin prevents FOUC

**Navigation**:

- Computed properties in useNavigation() composable
- NuxtLink for client-side routing
- Context-aware links in headers/sidebars

**UI Components**:

- Nuxt UI v4 UButton for ThemeToggle (NFR-007 requirement)
- Icon-only toggle with ARIA labels for accessibility
- 200ms CSS transitions for smooth theme changes

**Performance Strategy**:

- Single DOM operation for theme toggle (class on <html>)
- Synchronous localStorage operations (<10ms)
- No network requests, all client-side
- Client-side routing prevents full page reloads

**Accessibility Approach**:

- WCAG 2.1 AA contrast requirements in contracts
- Keyboard navigation specified (Tab, Enter, Space)
- ARIA attributes documented (role, aria-checked, aria-label)
- Screen reader support requirements defined

### Next Phase

**Phase 2**: Task Breakdown (run `/speckit.tasks` command)

- Break down into atomic implementation tasks
- Map tasks to RED-GREEN-REFACTOR phases
- Define task dependencies and order
- Create detailed implementation checklist

**Not included in `/speckit.plan` command** - Phase 2 is handled by separate `/speckit.tasks` command.
