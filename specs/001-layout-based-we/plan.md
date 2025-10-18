# Implementation Plan: Dual Layout System with Admin and Frontend Sections

**Branch**: `001-layout-based-we` | **Date**: October 14, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-layout-based-we/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a dual layout system providing distinct frontend and admin sections with Nuxt 4 layouts. Frontend layout includes header, navigation, footer supporting homepage and info pages. Admin layout features collapsible sidebar navigation with header, accessible via /admin/\* URLs. Both layouts share a design system with layout-specific variants and support responsive breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px). Implementation uses Nuxt UI 4, Pinia for state management, and TypeScript with shared and admin-specific type definitions.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Nuxt 4.x with Vue 3 Composition API and TypeScript strict mode
**Primary Dependencies**: @nuxt/ui v4, @nuxt/image, Pinia, Tailwind CSS, @nuxt/scripts
**Storage**: N/A (layout-focused feature, no data persistence required)
**Testing**: Nuxt Test Utils, Vitest for components/server, Playwright for E2E layout validation
**Target Platform**: Universal - static sites, serverless functions, Node.js servers
**Project Type**: Nuxt full-stack application with layout system focus
**Performance Goals**: <3s FCP, <1s admin navigation, responsive breakpoints at 768px/1024px, >90 Lighthouse scores
**Constraints**: SSR for frontend (SEO), CSR for admin (interactivity), shared design system, collapsible sidebar
**Scale/Scope**: Layout foundation for future expansion - 2 primary layouts, 4+ pages, responsive design

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Initial Check (Pre-Research)**:

- [x] **Modular Component Architecture**: Layout components (AdminSidebar, AppHeader, AppFooter) are composable Vue 3 components with Composition API
- [x] **Universal Rendering**: Frontend pages use SSR for SEO, admin pages use CSR for interactivity - route rules will be explicitly defined
- [x] **API-First Development**: Layout feature requires no backend APIs - focuses on client-side layout and navigation patterns
- [x] **Component-Driven Testing**: Test strategy covers layout components with Nuxt Test Utils and E2E layout validation with Playwright
- [x] **Deployment Versatility**: Layout system works universally across static, serverless, and Node.js deployment targets
- [x] **Performance Budget**: <3s FCP for frontend, <1s admin navigation, responsive breakpoints defined, Lighthouse >90 targets set
- [x] **Type Safety**: TypeScript strict mode with layout and admin-specific type definitions in dedicated files

**Post-Design Validation**:

- [x] **Modular Component Architecture**: Confirmed - Components follow Vue 3 Composition API with clear contracts and reusable patterns
- [x] **Universal Rendering**: Confirmed - SSR/CSR modes explicitly defined per layout with appropriate route configurations
- [x] **API-First Development**: Confirmed - Component contracts define clear interfaces, no backend APIs required for layout functionality
- [x] **Component-Driven Testing**: Confirmed - Testing strategy covers component contracts, layout behavior, and E2E navigation flows
- [x] **Deployment Versatility**: Confirmed - Layout system designed to work across all Nuxt deployment targets
- [x] **Performance Budget**: Confirmed - Specific performance targets defined with bundle size constraints and rendering benchmarks
- [x] **Type Safety**: Confirmed - Comprehensive TypeScript definitions with strict mode compatibility verified

**GATE STATUS**: ✅ PASSED - All constitution requirements met

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

<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```
# Nuxt 4 Dual Layout Application Structure
app/
├── components/           # Shared and layout-specific components
│   ├── layout/          # Layout-specific components
│   │   ├── AdminSidebar.vue
│   │   ├── AppHeader.vue
│   │   └── AppFooter.vue
│   ├── ui/              # Shared UI components
│   └── admin/           # Admin-specific components
├── composables/         # Layout and navigation composables
│   ├── useNavigation.ts # Navigation state management
│   └── useLayoutState.ts # Layout state (sidebar collapse, etc.)
├── layouts/            # Application layouts
│   ├── default.vue     # Frontend layout (header, footer, nav)
│   └── admin.vue       # Admin layout (header, sidebar, no footer)
├── pages/              # File-based routing
│   ├── index.vue       # Homepage (frontend layout)
│   ├── info.vue        # Info page (frontend layout)
│   └── admin/          # Admin section (/admin/* URLs)
│       └── index.vue   # Admin dashboard
├── assets/             # Styles and design system
│   └── css/
│       ├── main.css    # Base styles and design system
│       ├── frontend.css # Frontend-specific variants
│       └── admin.css   # Admin-specific variants
└── stores/             # Pinia stores
    ├── layout.ts       # Layout state management
    └── navigation.ts   # Navigation state

tests/
├── components/         # Component tests
│   ├── layout/        # Layout component tests
│   └── admin/         # Admin component tests
└── e2e/               # End-to-end layout tests
    ├── frontend-navigation.spec.ts
    └── admin-layout.spec.ts

types/                 # TypeScript definitions
├── layout.ts          # Common layout types
└── admin.ts           # Admin-specific types
```

**Structure Decision**: Selected Nuxt 4 file-based routing with dedicated admin directory under pages/ for clean URL structure (/admin/\*). Layouts directory contains two distinct layout components. Components organized by context (shared, admin-specific) with dedicated layout component directory. Pinia stores manage layout and navigation state across both contexts.

## Complexity Tracking

_Fill ONLY if Constitution Check has violations that must be justified_

No constitution violations detected. The dual layout system implementation follows all established architectural principles and requires no complexity justifications.
