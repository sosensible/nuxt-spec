<!--
Sync Impact Report:
- Version change: Initial → 1.0.0
- New constitution created for Nuxt Spec project
- Added 5 core principles tailored for Nuxt 4 modular architecture
- Added Nuxt Architecture Standards section
- Added Development Workflow section
- Templates requiring updates:
  ✅ Updated - plan-template.md (Constitution Check gates aligned)
  ✅ Updated - spec-template.md (Nuxt-specific requirements added)
  ✅ Updated - tasks-template.md (Nuxt component/page/middleware task types)
- Follow-up TODOs: None
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

### IV. Component-Driven Testing

Component tests MUST be written using Nuxt Test Utils; Server API routes MUST have contract tests; E2E tests MUST cover critical user journeys using Playwright; Test coverage MUST be >80% for components and server routes.

**Rationale**: Nuxt applications span client and server code requiring comprehensive testing strategies that cover both universal rendering and API functionality.

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

## Development Workflow

**File Organization**: Follow Nuxt 4 directory structure - pages/, components/, server/, composables/, middleware/
**Code Style**: ESLint with Nuxt configuration, Prettier for formatting, conventional commits
**Review Process**: All PRs MUST pass: TypeScript checks, component tests, server API tests, performance budgets
**Feature Development**: Component → Server API → Integration → E2E test → Performance validation
**Deployment Gates**: Build succeeds, tests pass, Lighthouse CI scores >90, security scan passes

## Governance

Constitution supersedes all other development practices; Amendments require team consensus, version increment, and migration plan for existing code; All PRs/reviews MUST verify compliance with modular architecture and performance standards; Complexity MUST be justified against Nuxt's built-in solutions before custom implementations.

**Version**: 1.0.0 | **Ratified**: 2025-10-14 | **Last Amended**: 2025-10-14
