<!--
Sync Impact Report:
- Version change: 1.1.0 → 1.1.0
- Created separate Development Standards document (development-standards.md)
- Added reference to Development Standards in Nuxt Architecture Standards section
- Updated Governance to include Development Standards as constitutional requirement
- Templates requiring updates:
  ⚠️ Needs update - plan-template.md (Add standards compliance check)
  ⚠️ Needs update - spec-template.md (Add standards reference)
  ⚠️ Needs update - tasks-template.md (Add standards checklist)
- Follow-up TODOs: Create PR review checklist referencing standards document
-->

# Nuxt Spec Constitution

## Core Principles

### I. Modular Component Architecture

Every feature MUST be built as composable, reusable components; Components MUST follow Vue 3 Composition API patterns; Each component MUST be independently testable and documented; Server components MUST be distinguished from client components with clear boundaries.

**Rationale**: Nuxt 4's modular architecture enables better code reuse, easier testing, and cleaner separation of concerns between client and server logic.

### II. Universal Rendering & Performance

All pages MUST support both SSR and client-side rendering; Route rules MUST be explicitly defined for pre-rendering, SPA mode, or ISR; Performance budgets MUST be enforced: <3s FCP, <100ms API responses, <500kb initial bundle.

**Rationale**: Nuxt's universal rendering capabilities are core to delivering optimal user experience and SEO performance across all deployment targets.

### III. API-First Development (NON-NEGOTIABLE)

Every backend feature starts as a Nuxt server API route; API contracts MUST be defined before implementation; All external service integrations MUST use Nuxt's server proxy patterns; Type safety MUST be maintained across client-server boundaries.

**Rationale**: Nuxt 4's server engine enables full-stack development within a single codebase while maintaining clear API boundaries and type safety.

### IV. Test-Driven Development (NON-NEGOTIABLE)

**RED-GREEN-REFACTOR CYCLE IS MANDATORY**: Tests MUST be written before implementation code; Every spec item MUST have failing tests written first (RED); Implementation MUST make tests pass (GREEN); Code MUST then be refactored while maintaining green tests; Component tests MUST be written using Nuxt Test Utils; Server API routes MUST have contract tests; E2E tests MUST cover critical user journeys using Playwright; Test coverage MUST be >80% for components and server routes; **NO SPEC IS COMPLETE WITHOUT PASSING TESTS THAT WERE INITIALLY FAILING**.

**Rationale**: Test-driven development ensures specifications are implemented correctly, facilitates regression testing, provides living documentation, and validates acceptance criteria. The red-green cycle proves that tests actually validate the implementation rather than passing by accident.

### V. Deployment Versatility

Applications MUST be deployable to multiple targets: static sites, serverless functions, Node.js servers; Build outputs MUST be optimized per deployment target; Environment configuration MUST support development, staging, and production contexts seamlessly.

**Rationale**: Nuxt 4's deployment flexibility requires consistent patterns that work across Vercel, Netlify, traditional servers, and static hosting.

## Nuxt Architecture Standards

**Framework Version**: Nuxt 4.x with Vue 3 Composition API
**UI Framework**: Nuxt UI components with Tailwind CSS
**State Management**: Pinia for client state, server state via Nuxt server composables
**Type Safety**: TypeScript with strict mode, auto-generated types for server APIs
**Module System**: Official Nuxt modules preferred (@nuxt/image, @nuxt/ui, @nuxt/scripts)
**Server Engine**: Nitro for universal deployment and server API routes
**Testing Stack**: Nuxt Test Utils, Vitest, Playwright for E2E
**Performance**: Web Vitals monitoring, bundle analysis, image optimization

**Detailed Standards**: All development MUST comply with the comprehensive standards defined in [development-standards.md](./development-standards.md). These standards are considered constitutional requirements and MUST be verified during spec creation, implementation, and review processes.

## Development Workflow

**Specification-Driven Development**: All development MUST start from a specification in the contracts document; Each spec item defines clear acceptance criteria and required test types (unit, integration, or E2E).

**Test-Driven Development Cycle** (MANDATORY):

1. **Write Failing Test (RED)**: Before any implementation, write test(s) that validate the spec's acceptance criteria; Tests MUST fail initially, proving they test actual functionality
2. **Implement Minimum Code (GREEN)**: Write only enough code to make the tests pass; Implementation MUST satisfy spec requirements
3. **Refactor (MAINTAIN GREEN)**: Improve code quality, performance, and maintainability while keeping all tests passing
4. **Verify Acceptance**: Spec is complete ONLY when all tests pass and acceptance criteria are met

**File Organization**: Follow Nuxt 4 directory structure - pages/, components/, server/, composables/, middleware/

**Code Style**: ESLint with Nuxt configuration, Prettier for formatting, conventional commits

**Terminal Management**: Development server (`pnpm dev`) MUST run in a dedicated terminal; Additional commands (tests, builds, git operations) MUST be executed in separate terminal instances; NEVER interrupt or share the dev server terminal to prevent process conflicts and hot-reload disruption

**Review Process**: All PRs MUST pass: TypeScript checks, component tests, server API tests, performance budgets; **Reviewers MUST verify TDD cycle was followed** (test commits before implementation commits)

**Feature Development**: Spec → Failing Tests → Component → Server API → Green Tests → Integration → E2E test → Refactor → Performance validation

**Deployment Gates**: Build succeeds, tests pass, Lighthouse CI scores >90, security scan passes; **All spec items MUST have associated passing tests**

## Governance

Constitution supersedes all other development practices; **Development Standards document is considered part of the constitution**; Amendments to Core Principles require team consensus, version increment, and migration plan; Standards document updates require PR approval and changelog entry; All PRs/reviews MUST verify compliance with modular architecture, **TDD methodology**, development standards, and performance standards; Complexity MUST be justified against Nuxt's built-in solutions before custom implementations; **Any implementation without test-first evidence MUST be rejected**.

**Version**: 1.1.0 | **Ratified**: 2025-10-14 | **Last Amended**: 2025-10-18
