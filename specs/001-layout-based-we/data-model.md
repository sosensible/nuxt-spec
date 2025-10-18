# Data Model: Dual Layout System with Admin and Frontend Sections

**Date**: October 14, 2025  
**Feature**: 001-layout-based-we  
**Phase**: 1 - Design & Contracts

## Layout Entities

### Frontend Layout Entity

**Purpose**: Defines the structure and behavior of the public-facing layout

**Properties**:

- `headerComponent`: AppHeader component with public navigation
- `footerComponent`: AppFooter component with site links and branding
- `navigationItems`: Array of public navigation links (Home, Info)
- `renderMode`: SSR (Server-Side Rendering) for SEO optimization
- `responsiveBreakpoints`: Standard web breakpoints (mobile <768px, tablet 768-1024px, desktop >1024px)

**Relationships**:

- Contains multiple Page Templates (Homepage, Info Page)
- Uses Shared Header Component with frontend-specific configuration
- Implements Design System with frontend styling variants

**State Transitions**:

- Responsive state changes based on viewport width
- Navigation active state updates based on current route
- No persistent state required (stateless layout)

**Validation Rules**:

- Navigation items must be valid route paths
- Header component must include site branding
- Footer component must be present on all frontend pages
- Responsive breakpoints must be consistently applied

### Admin Layout Entity

**Purpose**: Defines the structure and behavior of the administrative interface layout

**Properties**:

- `headerComponent`: AppHeader component with admin-specific navigation
- `sidebarComponent`: AdminSidebar component with collapsible functionality
- `sidebarState`: Boolean indicating collapsed/expanded state
- `navigationItems`: Array of admin navigation links and sections
- `renderMode`: CSR (Client-Side Rendering) for interactive functionality
- `responsiveBreakpoints`: Same as frontend but with sidebar behavior modifications

**Relationships**:

- Contains multiple Admin Page Templates
- Uses Shared Header Component with admin-specific configuration
- Manages AdminSidebar component state through Pinia store
- Implements Design System with admin styling variants

**State Transitions**:

- Sidebar: collapsed ↔ expanded (user interaction)
- Navigation: inactive → active → inactive (route changes)
- Responsive: desktop → tablet → mobile (viewport changes with sidebar behavior adaptation)

**Validation Rules**:

- Sidebar must be collapsible and show icons when collapsed
- Admin navigation must be contextually appropriate for administrative tasks
- No footer component in admin layout
- Sidebar state must persist across admin page navigation

### Shared Header Component Entity

**Purpose**: Reusable header component that adapts based on layout context

**Properties**:

- `layoutContext`: String ('frontend' | 'admin')
- `navigationItems`: Context-appropriate navigation links
- `brandingConfig`: Logo, site title, and branding elements
- `userActions`: Context-specific user actions (if any)

**Relationships**:

- Used by both Frontend Layout and Admin Layout
- Receives configuration from parent layout
- Implements Design System base styles with context variants

**State Transitions**:

- Context: frontend ↔ admin (layout switch)
- Navigation: item active states based on current route
- Responsive: full navigation → hamburger menu (mobile breakpoint)

**Validation Rules**:

- Must adapt styling and navigation based on layoutContext
- Branding must be consistent but contextually styled
- Navigation items must be valid for the current context

### Design System Entity

**Purpose**: Shared styling foundation with layout-specific variants

**Properties**:

- `baseColors`: Primary color palette shared across layouts
- `typography`: Font families, sizes, and weights
- `spacing`: Consistent spacing scale using Tailwind utilities
- `components`: Base component styles from Nuxt UI 4
- `frontendVariants`: Frontend-specific styling overrides
- `adminVariants`: Admin-specific styling overrides

**Relationships**:

- Applied to all layout components
- Extended by frontend and admin styling variants
- Integrated with Tailwind CSS configuration

**State Transitions**:

- Theme: base → frontend variant | base → admin variant
- Responsive: desktop styles → tablet styles → mobile styles

**Validation Rules**:

- Base styles must be defined for consistent foundation
- Variants must not conflict with base design system
- All components must inherit from base design system
- Responsive behavior must be consistent across layouts

### Navigation Context Entity

**Purpose**: Context-aware navigation system that adapts to layout environment

**Properties**:

- `currentLayout`: String ('frontend' | 'admin')
- `currentRoute`: Current page route information
- `navigationItems`: Array of navigation items for current context
- `activeStates`: Boolean states for each navigation item

**Relationships**:

- Managed by layout state stores (Pinia)
- Used by header and sidebar components
- Updates based on route changes

**State Transitions**:

- Route: page A → page B (navigation event)
- Context: frontend → admin | admin → frontend (layout switch)
- Active: inactive → active → inactive (navigation selection)

**Validation Rules**:

- Navigation items must be valid routes for current context
- Active states must accurately reflect current route
- Context switches must update navigation appropriately
- Navigation must be accessible via keyboard navigation

## Type Definitions

### Layout Types (`types/layout.ts`)

```typescript
export interface LayoutConfig {
  name: "frontend" | "admin";
  renderMode: "ssr" | "csr";
  hasHeader: boolean;
  hasFooter: boolean;
  hasSidebar: boolean;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
  external?: boolean;
}

export interface ResponsiveBreakpoint {
  name: "mobile" | "tablet" | "desktop";
  minWidth: number;
  maxWidth?: number;
}

export interface HeaderConfig {
  layoutContext: "frontend" | "admin";
  navigationItems: NavigationItem[];
  showBranding: boolean;
  userActions?: NavigationItem[];
}
```

### Admin Types (`types/admin.ts`)

```typescript
export interface AdminSidebarState {
  isCollapsed: boolean;
  activeSection?: string;
  navigationItems: AdminNavigationItem[];
}

export interface AdminNavigationItem extends NavigationItem {
  section?: string;
  children?: AdminNavigationItem[];
  permission?: string;
}

export interface AdminLayoutState {
  sidebarState: AdminSidebarState;
  currentSection: string;
  breadcrumbs: NavigationItem[];
}
```

## Data Flow

### Frontend Layout Flow

1. Page load → SSR renders layout with header/footer
2. Navigation interaction → route change → active state update
3. Responsive change → layout adapts to new breakpoint

### Admin Layout Flow

1. Page load → CSR renders layout with header/sidebar
2. Sidebar toggle → state change in Pinia store → UI update
3. Navigation → route change → sidebar active state update → breadcrumb update
4. Responsive change → sidebar behavior adaptation (auto-collapse on mobile)

## Validation Strategy

### Component Validation

- Layout components must render correctly with all required elements
- Navigation states must accurately reflect current route
- Responsive behavior must be consistent across breakpoints

### State Validation

- Admin sidebar state must persist across page navigation
- Navigation active states must be exclusive (only one active at a time)
- Layout context must be properly maintained throughout user session

### Performance Validation

- SSR rendering must complete within performance budget (<3s FCP)
- Admin layout navigation must respond within <1s
- Layout components must not cause hydration mismatches
