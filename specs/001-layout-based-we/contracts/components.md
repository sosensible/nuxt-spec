# Component Contracts: Dual Layout System

**Date**: October 14, 2025  
**Feature**: 001-layout-based-we  
**Type**: Component Interface Contracts

## Layout Component Contracts

### Frontend Layout Contract (`layouts/default.vue`)

**Interface**:

```typescript
interface FrontendLayoutProps {
  // No props - layout uses global state and routing
}

interface FrontendLayoutSlots {
  default: void; // Page content slot
}

interface FrontendLayoutEmits {
  // No emits - layout is reactive to routing
}
```

**Behavior Contract**:

- **MUST** render AppHeader component with frontend navigation
- **MUST** render AppFooter component with site links
- **MUST** provide default slot for page content
- **MUST** support SSR rendering mode
- **MUST** be responsive across all defined breakpoints
- **MUST** maintain consistent branding and navigation

**Dependencies**:

- AppHeader component with frontend configuration
- AppFooter component
- Nuxt routing system
- Tailwind CSS responsive utilities

### Admin Layout Contract (`layouts/admin.vue`)

**Interface**:

```typescript
interface AdminLayoutProps {
  // No props - layout uses Pinia store state
}

interface AdminLayoutSlots {
  default: void; // Page content slot
}

interface AdminLayoutEmits {
  // No emits - layout state managed via Pinia
}
```

**Behavior Contract**:

- **MUST** render AppHeader component with admin navigation
- **MUST** render AdminSidebar component with collapsible functionality
- **MUST** provide default slot for page content
- **MUST** support CSR rendering mode
- **MUST** manage sidebar state through Pinia store
- **MUST** adapt to responsive breakpoints with sidebar behavior changes

**Dependencies**:

- AppHeader component with admin configuration
- AdminSidebar component
- Pinia layout store
- Tailwind CSS responsive utilities

## Component Contracts

### AppHeader Contract (`components/layout/AppHeader.vue`)

**Interface**:

```typescript
interface AppHeaderProps {
  layoutContext: "frontend" | "admin";
  navigationItems?: NavigationItem[];
  showBranding?: boolean;
}

interface AppHeaderSlots {
  brand?: void; // Custom branding slot
  actions?: void; // User actions slot
}

interface AppHeaderEmits {
  navigate: [item: NavigationItem]; // Navigation item clicked
}
```

**Behavior Contract**:

- **MUST** adapt styling based on layoutContext
- **MUST** render navigation items appropriate to context
- **MUST** highlight active navigation item based on current route
- **MUST** be responsive with mobile navigation patterns
- **MUST** emit navigate events for navigation tracking

### AdminSidebar Contract (`components/layout/AdminSidebar.vue`)

**Interface**:

```typescript
interface AdminSidebarProps {
  navigationItems: AdminNavigationItem[];
  isCollapsed?: boolean;
}

interface AdminSidebarSlots {
  header?: void; // Sidebar header content
  footer?: void; // Sidebar footer content
}

interface AdminSidebarEmits {
  toggle: [collapsed: boolean]; // Sidebar toggle state
  navigate: [item: AdminNavigationItem]; // Navigation item clicked
}
```

**Behavior Contract**:

- **MUST** support collapsed and expanded states
- **MUST** show icons when collapsed, full labels when expanded
- **MUST** persist state through Pinia store
- **MUST** support keyboard navigation
- **MUST** animate collapse/expand transitions smoothly
- **MUST** adapt to mobile breakpoints (auto-collapse)

### AppFooter Contract (`components/layout/AppFooter.vue`)

**Interface**:

```typescript
interface AppFooterProps {
  links?: NavigationItem[];
  showBranding?: boolean;
  year?: number;
}

interface AppFooterSlots {
  default?: void; // Additional footer content
  social?: void; // Social media links
}

interface AppFooterEmits {
  navigate: [item: NavigationItem]; // Footer link clicked
}
```

**Behavior Contract**:

- **MUST** render site links and branding
- **MUST** be responsive across all breakpoints
- **MUST** support external links with proper attributes
- **MUST** include copyright information
- **MUST** only appear on frontend layout pages

## Store Contracts

### Layout Store Contract (`stores/layout.ts`)

**Interface**:

```typescript
interface LayoutState {
  currentLayout: "frontend" | "admin";
  sidebarCollapsed: boolean;
  mobileMenuOpen: boolean;
}

interface LayoutActions {
  toggleSidebar(): void;
  setSidebarCollapsed(collapsed: boolean): void;
  toggleMobileMenu(): void;
  setCurrentLayout(layout: "frontend" | "admin"): void;
}

interface LayoutGetters {
  isAdminLayout: boolean;
  isFrontendLayout: boolean;
  sidebarState: "collapsed" | "expanded";
}
```

**Behavior Contract**:

- **MUST** persist sidebar state across admin page navigation
- **MUST** reset mobile menu state on route changes
- **MUST** provide reactive state for layout components
- **MUST** handle responsive state changes automatically

### Navigation Store Contract (`stores/navigation.ts`)

**Interface**:

```typescript
interface NavigationState {
  currentRoute: string;
  frontendNavigation: NavigationItem[];
  adminNavigation: AdminNavigationItem[];
  breadcrumbs: NavigationItem[];
}

interface NavigationActions {
  setCurrentRoute(route: string): void;
  updateBreadcrumbs(items: NavigationItem[]): void;
  setActiveNavigation(path: string): void;
}

interface NavigationGetters {
  activeNavigationItem: NavigationItem | null;
  contextualNavigation: NavigationItem[] | AdminNavigationItem[];
  isRouteActive: (path: string) => boolean;
}
```

**Behavior Contract**:

- **MUST** track current route and update active states
- **MUST** provide context-appropriate navigation items
- **MUST** generate breadcrumbs for admin navigation
- **MUST** support nested navigation structure

## Composable Contracts

### useLayoutState Contract (`composables/useLayoutState.ts`)

**Interface**:

```typescript
interface UseLayoutStateReturn {
  currentLayout: Ref<"frontend" | "admin">;
  sidebarCollapsed: Ref<boolean>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobile: Ref<boolean>;
}
```

**Behavior Contract**:

- **MUST** provide reactive access to layout state
- **MUST** handle responsive breakpoint detection
- **MUST** manage sidebar state persistence
- **MUST** integrate with Pinia layout store

### useNavigation Contract (`composables/useNavigation.ts`)

**Interface**:

```typescript
interface UseNavigationReturn {
  currentRoute: Ref<string>;
  navigationItems: ComputedRef<NavigationItem[]>;
  isRouteActive: (path: string) => boolean;
  navigate: (path: string) => Promise<void>;
  breadcrumbs: ComputedRef<NavigationItem[]>;
}
```

**Behavior Contract**:

- **MUST** provide reactive navigation state
- **MUST** handle route navigation with proper state updates
- **MUST** generate contextual navigation items
- **MUST** manage breadcrumb generation for admin routes

## Testing Contracts

### Component Testing Requirements

**Layout Component Tests**:

- Must render all required child components
- Must handle responsive breakpoint changes
- Must manage state correctly through props/stores
- Must emit expected events for navigation

**Shared Component Tests**:

- Must adapt correctly to different layout contexts
- Must handle user interactions (clicks, keyboard)
- Must maintain accessibility standards
- Must render slots and props correctly

### E2E Testing Requirements

**Frontend Layout E2E**:

- Must navigate between homepage and info page
- Must maintain layout consistency across pages
- Must be responsive across device sizes
- Must pass Lighthouse performance audits

**Admin Layout E2E**:

- Must access admin section via /admin/\* URLs
- Must toggle sidebar collapse/expand functionality
- Must maintain layout consistency in admin section
- Must switch between frontend and admin without conflicts

## Performance Contracts

### Rendering Performance

- Frontend layout SSR: <3s First Contentful Paint
- Admin layout CSR: <1s navigation between pages
- Layout components: <100ms render time
- Sidebar toggle: <200ms animation duration

### Bundle Size Constraints

- Layout components combined: <50kb gzipped
- Store management: <10kb gzipped
- Styling (layout-specific): <25kb gzipped
- Total layout system: <100kb gzipped
