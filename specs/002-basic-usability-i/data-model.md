# Data Model: Basic Usability Enhancements - Dark Mode & Cross-Section Navigation

**Feature**: `002-basic-usability-i`  
**Date**: October 20, 2025  
**Phase**: Phase 1 - Design & Contracts

## Overview

This feature introduces theme state management and navigation context tracking. The data model is **entirely client-side** with no server-side persistence. Theme preference is stored in localStorage, and navigation context is derived from the current route.

## Entities

### 1. Theme Preference

**Purpose**: Stores user's selected theme mode and computes the current active theme.

**Storage**: localStorage (key: `theme-preference`)

**TypeScript Definition**:

```typescript
export type ThemeMode = "light" | "dark" | "system";
export type ActiveTheme = "light" | "dark";

export interface ThemeState {
  /** User's explicit preference: light, dark, or follow system */
  mode: ThemeMode;

  /** Current active theme (computed from mode + system preference) */
  current: ActiveTheme;

  /** Whether theme is currently being applied (for transition states) */
  isTransitioning: boolean;
}
```

**Fields**:

| Field             | Type          | Required | Default    | Description                                                      |
| ----------------- | ------------- | -------- | ---------- | ---------------------------------------------------------------- |
| `mode`            | `ThemeMode`   | Yes      | `'system'` | User's theme preference: explicit choice or follow system        |
| `current`         | `ActiveTheme` | Yes      | (computed) | Currently active theme, computed from mode and system preference |
| `isTransitioning` | `boolean`     | Yes      | `false`    | Flag for CSS transition state (prevents flickering)              |

**Validation Rules**:

- `mode` must be one of: `'light'`, `'dark'`, `'system'`
- `current` is always computed, never set directly
- When `mode` is `'system'`, `current` reflects OS preference
- When `mode` is `'light'` or `'dark'`, `current` matches `mode`

**State Transitions**:

```
Initial State: { mode: 'system', current: detectSystemTheme() }

On toggle():
  light → dark → light (cycle between explicit choices)

On set(mode):
  Any mode → specified mode

On system preference change (when mode='system'):
  current updates to match new system preference
```

**Persistence**:

- Stored in localStorage: `localStorage.setItem('theme-preference', mode)`
- Read on app initialization
- No server-side persistence required
- Graceful fallback if localStorage unavailable: use system preference

**Relationships**:

- No relationships to other entities
- Used by all components via `useTheme()` composable

---

### 2. Navigation Context

**Purpose**: Identifies current section (frontend vs admin) to determine appropriate cross-section navigation links.

**Storage**: Derived from current route (no persistence)

**TypeScript Definition**:

```typescript
export type SectionType = "frontend" | "admin";

export interface NavigationContext {
  /** Current section: frontend or admin */
  currentSection: SectionType;

  /** Whether user is on a page that should show cross-section links */
  showCrossSectionNav: boolean;

  /** Target path for cross-section navigation */
  targetPath: string;

  /** Label for cross-section navigation link */
  targetLabel: string;
}
```

**Fields**:

| Field                 | Type          | Required | Default    | Description                                 |
| --------------------- | ------------- | -------- | ---------- | ------------------------------------------- |
| `currentSection`      | `SectionType` | Yes      | (computed) | Current section derived from route path     |
| `showCrossSectionNav` | `boolean`     | Yes      | `true`     | Whether to display cross-section navigation |
| `targetPath`          | `string`      | Yes      | (computed) | Path to navigate to opposite section        |
| `targetLabel`         | `string`      | Yes      | (computed) | User-facing label for navigation link       |

**Computation Logic**:

```typescript
const getNavigationContext = (
  route: RouteLocationNormalizedLoaded
): NavigationContext => {
  const isAdmin = route.path.startsWith("/admin");

  return {
    currentSection: isAdmin ? "admin" : "frontend",
    showCrossSectionNav: true, // Always show for now
    targetPath: isAdmin ? "/" : "/admin",
    targetLabel: isAdmin ? "View Site" : "Admin Panel",
  };
};
```

**Validation Rules**:

- `currentSection` determined by route path prefix `/admin`
- `targetPath` is always opposite of current section
- `targetLabel` must be user-friendly and accessible

**State Transitions**:

```
On route change:
  Frontend route → { currentSection: 'frontend', targetPath: '/admin', targetLabel: 'Admin Panel' }
  Admin route    → { currentSection: 'admin', targetPath: '/', targetLabel: 'View Site' }
```

**Persistence**:

- Not persisted (derived from route on every render)
- No localStorage or server storage needed

**Relationships**:

- Depends on: Vue Router's current route
- Used by: AppHeader, AdminHeader, AdminSidebar components

---

## Store Structure (Pinia)

### Theme Store

**File**: `app/stores/theme.ts`

**State Shape**:

```typescript
interface ThemeStoreState {
  mode: ThemeMode;
  current: ActiveTheme;
  isTransitioning: boolean;
}
```

**Getters**:

```typescript
{
  // Current active theme (convenience getter)
  isDark: (state) => state.current === 'dark',

  // Whether user has explicit preference (not system)
  hasExplicitPreference: (state) => state.mode !== 'system',

  // Icon name for toggle button (sun or moon)
  toggleIcon: (state) => state.current === 'dark' ? 'sun' : 'moon'
}
```

**Actions**:

```typescript
{
  /**
   * Toggle between light and dark themes
   * Cycles: light → dark → light
   */
  toggle(): void

  /**
   * Set explicit theme mode
   * @param mode - 'light', 'dark', or 'system'
   */
  set(mode: ThemeMode): void

  /**
   * Detect and apply system theme preference
   * Used on initial load when mode is 'system'
   */
  detectSystemPreference(): void

  /**
   * Initialize theme from localStorage
   * Called once on app startup
   */
  initialize(): void

  /**
   * Persist current mode to localStorage
   * Called after toggle() or set()
   */
  persist(): void

  /**
   * Apply theme to document element
   * Adds/removes 'dark' class on <html>
   */
  apply(): void
}
```

**Side Effects**:

- All actions that change `mode` or `current` call `apply()` and `persist()`
- `apply()` manipulates DOM: `document.documentElement.classList.toggle('dark', isDark)`
- `persist()` writes to localStorage: `localStorage.setItem('theme-preference', mode)`

---

## Composable Interfaces

### useTheme()

**File**: `app/composables/useTheme.ts`

**Purpose**: Provide components with access to theme state and actions.

**Return Type**:

```typescript
interface UseThemeReturn {
  // State (reactive)
  mode: Ref<ThemeMode>;
  current: Ref<ActiveTheme>;
  isDark: ComputedRef<boolean>;
  isTransitioning: Ref<boolean>;

  // Actions
  toggle: () => void;
  set: (mode: ThemeMode) => void;
  detectSystemPreference: () => void;

  // Utility
  toggleIcon: ComputedRef<string>;
}
```

**Usage Example**:

```vue
<script setup lang="ts">
const { current, toggle, isDark, toggleIcon } = useTheme();
</script>

<template>
  <UButton
    :icon="toggleIcon"
    @click="toggle"
    :aria-label="`Switch to ${isDark ? 'light' : 'dark'} mode`"
  />
</template>
```

**Implementation Pattern**:

```typescript
export const useTheme = () => {
  const store = useThemeStore();

  return {
    // Expose state as refs
    mode: toRef(store, "mode"),
    current: toRef(store, "current"),
    isTransitioning: toRef(store, "isTransitioning"),

    // Expose getters as computed
    isDark: computed(() => store.isDark),
    toggleIcon: computed(() => store.toggleIcon),

    // Expose actions
    toggle: store.toggle,
    set: store.set,
    detectSystemPreference: store.detectSystemPreference,
  };
};
```

---

### useNavigation()

**File**: `app/composables/useNavigation.ts` (existing - may need extension)

**Purpose**: Provide navigation context for cross-section links.

**Extension Required**:

```typescript
interface UseNavigationReturn {
  // ... existing navigation functionality ...

  // NEW: Cross-section navigation
  crossSection: ComputedRef<{
    currentSection: SectionType;
    targetPath: string;
    targetLabel: string;
    showNav: boolean;
  }>;
}
```

**Usage Example**:

```vue
<script setup lang="ts">
const { crossSection } = useNavigation();
</script>

<template>
  <NuxtLink v-if="crossSection.showNav" :to="crossSection.targetPath">
    {{ crossSection.targetLabel }}
  </NuxtLink>
</template>
```

**Implementation**:

```typescript
export const useNavigation = () => {
  const route = useRoute();

  const crossSection = computed(() => {
    const isAdmin = route.path.startsWith("/admin");
    return {
      currentSection: isAdmin ? ("admin" as const) : ("frontend" as const),
      targetPath: isAdmin ? "/" : "/admin",
      targetLabel: isAdmin ? "View Site" : "Admin Panel",
      showNav: true,
    };
  });

  return {
    // ... existing navigation functionality ...
    crossSection,
  };
};
```

---

## Component Contracts

### ThemeToggle Component

**File**: `app/components/ThemeToggle.vue`

**Props**: None (gets state from composable)

**Emits**: None (calls composable actions directly)

**Public Interface**:

```typescript
// No props or emits - fully encapsulated
// Uses useTheme() composable internally
```

**Internal Structure**:

```vue
<script setup lang="ts">
const { current, toggle, isDark, toggleIcon } = useTheme();

const ariaLabel = computed(
  () => `Switch to ${isDark.value ? "light" : "dark"} mode`
);
</script>

<template>
  <UButton
    :icon="toggleIcon"
    variant="ghost"
    color="gray"
    @click="toggle"
    :aria-label="ariaLabel"
    role="switch"
    :aria-checked="isDark"
  />
</template>
```

---

## Data Flow Diagram

```
User Action: Click ThemeToggle
         ↓
ThemeToggle.vue calls toggle()
         ↓
useTheme() composable forwards to store.toggle()
         ↓
Theme Store updates state: mode, current
         ↓
Theme Store calls apply() → Updates DOM (dark class)
         ↓
Theme Store calls persist() → Writes to localStorage
         ↓
Vue reactivity propagates state change
         ↓
All components using useTheme() see new theme
         ↓
CSS transitions apply new colors (200ms)
```

```
Page Load: App Initialization
         ↓
Nuxt Plugin (theme-init.client.ts) runs
         ↓
Plugin reads localStorage['theme-preference']
         ↓
Plugin calls store.initialize()
         ↓
Store sets mode from localStorage (or 'system')
         ↓
Store calls detectSystemPreference() if mode='system'
         ↓
Store calls apply() → Sets dark class before hydration
         ↓
Vue app hydrates with correct theme (no FOUC)
```

```
Navigation: Frontend ↔ Admin
         ↓
User clicks NuxtLink (cross-section)
         ↓
Nuxt Router performs client-side navigation
         ↓
Route changes, new layout loads
         ↓
useNavigation() recomputes crossSection
         ↓
Layout components see new section context
         ↓
Theme state persists (no reinitialization)
         ↓
New page renders with correct theme and layout
```

---

## Migration & Backward Compatibility

**No migration required** - this is a new feature with no existing data.

**Initial State**:

- Users with no localStorage entry: mode defaults to `'system'`
- System theme is detected and applied automatically
- Users can immediately start using theme toggle

**Future Compatibility**:

- localStorage schema is simple and extensible
- Can add new theme modes (e.g., 'auto', 'high-contrast') without breaking existing data
- Theme store can be extended with additional preferences (font size, reduced motion, etc.)

---

## Performance Considerations

### Theme Store Performance

**State Updates**: O(1) - simple property assignments
**DOM Manipulation**: O(1) - single class toggle on root element
**localStorage Operations**: O(1) - single key write, <10ms

**Optimization**: Store actions are synchronous and fast (<50ms total)

### Navigation Context Performance

**Computation**: O(1) - simple route path check
**Re-computation**: Only on route change (Vue Router hook)
**Memory**: Negligible - single computed ref per component using it

**Optimization**: No performance concerns, computation is trivial

---

## Testing Strategy

### Unit Tests (Stores & Composables)

**Theme Store**:

- [x] Initial state is `{ mode: 'system', current: detectSystemPreference() }`
- [x] `toggle()` cycles: light → dark → light
- [x] `set('dark')` sets mode to dark and current to dark
- [x] `set('system')` sets mode to system and current to detected preference
- [x] `isDark` getter returns true when current is 'dark'
- [x] `hasExplicitPreference` returns false when mode is 'system'
- [x] `toggleIcon` returns 'sun' for dark theme, 'moon' for light theme
- [x] `apply()` adds 'dark' class when current is 'dark'
- [x] `apply()` removes 'dark' class when current is 'light'
- [x] `persist()` writes mode to localStorage
- [x] `initialize()` reads mode from localStorage

**useTheme() Composable**:

- [x] Returns reactive refs for mode, current, isTransitioning
- [x] Returns computed refs for isDark, toggleIcon
- [x] Exposes toggle, set, detectSystemPreference functions
- [x] Functions call underlying store actions

**useNavigation() Extension**:

- [x] `crossSection.currentSection` is 'admin' when route starts with /admin
- [x] `crossSection.currentSection` is 'frontend' for all other routes
- [x] `crossSection.targetPath` is '/' when in admin
- [x] `crossSection.targetPath` is '/admin' when in frontend
- [x] `crossSection.targetLabel` is 'View Site' when in admin
- [x] `crossSection.targetLabel` is 'Admin Panel' when in frontend

### Component Tests

**ThemeToggle Component**:

- [x] Renders UButton with correct icon (sun for dark, moon for light)
- [x] Clicking button calls toggle() function
- [x] aria-label updates based on current theme
- [x] role="switch" and aria-checked attributes present
- [x] Button is keyboard accessible (Tab, Enter/Space)

### Integration Tests

**Theme Persistence**:

- [x] Theme preference persists across component unmount/remount
- [x] Theme preference persists across route navigation
- [x] localStorage write happens after every theme change

**Layout Integration**:

- [x] Dark class applied to root element propagates to all components
- [x] Theme state available in both default and admin layouts
- [x] Navigation between layouts preserves theme state

### E2E Tests

**Theme Toggle Flow** (Playwright):

- [x] System theme detected on first visit (no localStorage)
- [x] Toggle button changes theme immediately (<1s per SC-001)
- [x] Theme preference persists after page reload (SC-002)
- [x] Theme applies to all visible components (SC-003)
- [x] No FOUC on page load (PV-003)
- [x] Theme toggle execution <50ms (PV-001)

**Cross-Section Navigation** (Playwright):

- [x] Admin link visible in frontend header
- [x] Frontend link visible in admin header
- [x] Clicking admin link navigates to /admin with admin layout
- [x] Clicking frontend link navigates to / with default layout
- [x] Theme persists across section navigation
- [x] Navigation completes in <500ms (PV-002)

---

## Summary

**Entities**: 2 (Theme Preference, Navigation Context)
**Stores**: 1 (theme.ts)
**Composables**: 2 (useTheme.ts, useNavigation.ts extension)
**Components**: 1 new (ThemeToggle.vue), 4 modified (headers/sidebars)
**Persistence**: localStorage only (client-side)
**Performance**: <50ms theme toggle, <500ms navigation, no FOUC
**Testing**: 35+ test cases across unit, component, integration, and E2E levels

**Ready for Phase 1 Contracts**: Data model is complete and testable.
