# Component Contracts: Basic Usability Enhancements - Dark Mode & Cross-Section Navigation

**Feature**: `002-basic-usability-i`  
**Date**: October 20, 2025  
**Phase**: Phase 1 - Design & Contracts

## Overview

This document defines the public interfaces (contracts) for all components, composables, and stores in this feature. These contracts MUST be implemented exactly as specified to ensure compatibility and testability.

---

## Stores

### Theme Store

**File**: `app/stores/theme.ts`

**Contract**:

```typescript
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ActiveTheme = 'light' | 'dark'

export interface ThemeStoreState {
  mode: ThemeMode
  current: ActiveTheme
  isTransitioning: boolean
}

export const useThemeStore = defineStore('theme', {
  state: (): ThemeStoreState => ({
    mode: 'system',
    current: 'light',
    isTransitioning: false
  }),

  getters: {
    /**
     * Whether current theme is dark
     * @returns true if current theme is 'dark'
     */
    isDark: (state): boolean => state.current === 'dark',

    /**
     * Whether user has set explicit preference (not following system)
     * @returns true if mode is not 'system'
     */
    hasExplicitPreference: (state): boolean => state.mode !== 'system',

    /**
     * Icon name for theme toggle button
     * @returns 'sun' for dark theme (to indicate switching to light), 'moon' for light theme
     */
    toggleIcon: (state): string => state.current === 'dark' ? 'sun' : 'moon'
  },

  actions: {
    /**
     * Toggle between light and dark themes
     * Cycles: light → dark → light (ignores system mode)
     */
    toggle(): void

    /**
     * Set explicit theme mode
     * @param mode - 'light', 'dark', or 'system'
     * @throws Error if mode is not valid ThemeMode
     */
    set(mode: ThemeMode): void

    /**
     * Detect and apply system theme preference
     * Uses window.matchMedia('(prefers-color-scheme: dark)')
     * @returns 'light' or 'dark' based on system preference
     */
    detectSystemPreference(): ActiveTheme

    /**
     * Initialize theme from localStorage
     * Reads 'theme-preference' key, falls back to 'system' if not found
     * Calls apply() to set DOM class
     */
    initialize(): void

    /**
     * Persist current mode to localStorage
     * Writes 'theme-preference' key
     * Gracefully handles localStorage unavailable
     */
    persist(): void

    /**
     * Apply theme to document element
     * Adds/removes 'dark' class on <html> element
     * Sets isTransitioning flag for CSS transitions
     */
    apply(): void
  }
})
```

**Behavior Specifications**:

- **`toggle()`**:

  - If `current` is `'light'`, set `mode` to `'dark'` and `current` to `'dark'`
  - If `current` is `'dark'`, set `mode` to `'light'` and `current` to `'light'`
  - Call `apply()` and `persist()` after state change
  - Performance: MUST complete in <50ms (NFR-006)

- **`set(mode)`**:

  - Set `this.mode` to provided `mode`
  - If `mode` is `'system'`, call `detectSystemPreference()` and set `current` to result
  - If `mode` is `'light'` or `'dark'`, set `current` to `mode`
  - Call `apply()` and `persist()` after state change
  - Throw `Error` if mode is not `'light'`, `'dark'`, or `'system'`

- **`detectSystemPreference()`**:

  - Check `window.matchMedia('(prefers-color-scheme: dark)').matches`
  - Return `'dark'` if matches, `'light'` otherwise
  - MUST work in both SSR and CSR contexts (check for window existence)
  - Return `'light'` as fallback if matchMedia not available

- **`initialize()`**:

  - Read `localStorage.getItem('theme-preference')` if available
  - If found and valid ThemeMode, call `set(mode)`
  - If not found, call `set('system')`
  - Handle localStorage unavailable gracefully (use 'system')
  - MUST be called exactly once on app startup

- **`persist()`**:

  - Write `localStorage.setItem('theme-preference', this.mode)`
  - Gracefully handle localStorage unavailable (no-op)
  - Performance: MUST complete in <10ms (PV-004)

- **`apply()`**:
  - Set `isTransitioning = true`
  - Toggle `'dark'` class on `document.documentElement` based on `isDark`
  - Use `document.documentElement.classList.toggle('dark', isDark)`
  - Set `isTransitioning = false` after 300ms (CSS transition duration)
  - MUST work in both SSR and CSR (check for document existence)

**Testing Requirements**:

- 15+ unit tests for all getters and actions
- Mock localStorage and matchMedia in tests
- Verify performance targets in E2E tests

---

## Composables

### useTheme()

**File**: `app/composables/useTheme.ts`

**Contract**:

````typescript
import { computed, toRef, type Ref, type ComputedRef } from 'vue'
import { useThemeStore, type ThemeMode, type ActiveTheme } from '~/stores/theme'

export interface UseThemeReturn {
  /** User's theme preference (reactive ref) */
  mode: Ref<ThemeMode>

  /** Current active theme (reactive ref) */
  current: Ref<ActiveTheme>

  /** Whether theme is currently transitioning (reactive ref) */
  isTransitioning: Ref<boolean>

  /** Whether current theme is dark (computed) */
  isDark: ComputedRef<boolean>

  /** Icon name for toggle button: 'sun' or 'moon' (computed) */
  toggleIcon: ComputedRef<string>

  /** Toggle between light and dark themes */
  toggle: () => void

  /** Set explicit theme mode */
  set: (mode: ThemeMode) => void

  /** Detect system theme preference */
  detectSystemPreference: () => ActiveTheme
}

/**
 * Access theme state and actions
 *
 * @returns Theme state refs and action functions
 *
 * @example
 * ```vue
 * <script setup>
 * const { current, toggle, isDark } = useTheme()
 * </script>
 *
 * <template>
 *   <button @click="toggle">
 *     Current theme: {{ current }}
 *   </button>
 * </template>
 * ```
 */
export const useTheme = (): UseThemeReturn
````

**Implementation Requirements**:

- MUST use `useThemeStore()` internally (no other store access allowed)
- MUST return reactive refs for state properties
- MUST return computed refs for getters
- MUST return direct function references for actions
- MUST NOT add additional logic beyond store access
- Components MUST use this composable, not direct store access

**Testing Requirements**:

- 5+ unit tests verifying composable returns correct types
- Test that state updates propagate to refs
- Test that action calls reach store

---

### useNavigation() Extension

**File**: `app/composables/useNavigation.ts`

**Contract Extension**:

````typescript
import { computed, type ComputedRef } from 'vue'
import { useRoute } from '#app'

export type SectionType = 'frontend' | 'admin'

export interface CrossSectionNav {
  /** Current section: 'frontend' or 'admin' */
  currentSection: SectionType

  /** Path to navigate to opposite section */
  targetPath: string

  /** User-facing label for cross-section link */
  targetLabel: string

  /** Whether to show cross-section navigation (always true for now) */
  showNav: boolean
}

export interface UseNavigationReturn {
  // ... existing useNavigation functionality ...

  /**
   * Cross-section navigation context
   * Computed based on current route
   */
  crossSection: ComputedRef<CrossSectionNav>
}

/**
 * Access navigation state and context
 *
 * @returns Navigation context including cross-section info
 *
 * @example
 * ```vue
 * <script setup>
 * const { crossSection } = useNavigation()
 * </script>
 *
 * <template>
 *   <NuxtLink v-if="crossSection.showNav" :to="crossSection.targetPath">
 *     {{ crossSection.targetLabel }}
 *   </NuxtLink>
 * </template>
 * ```
 */
export const useNavigation = (): UseNavigationReturn
````

**Behavior Specifications**:

- **`crossSection` computed**:
  - Read current route via `useRoute()`
  - Determine `currentSection`: `'admin'` if `route.path.startsWith('/admin')`, else `'frontend'`
  - Set `targetPath`: `'/'` if admin, `'/admin'` if frontend
  - Set `targetLabel`: `'View Site'` if admin, `'Admin Panel'` if frontend
  - Set `showNav`: always `true` (may be configurable in future)
  - Re-compute on every route change

**Testing Requirements**:

- 6+ unit tests for section detection and target computation
- Test with various routes: /, /about, /admin, /admin/users, /admin/settings
- Verify labels and paths are correct for each section

---

## Components

### ThemeToggle Component

**File**: `app/components/ThemeToggle.vue`

**Props**: None (stateless, gets data from composable)

**Emits**: None (calls composable actions directly)

**Slots**: None

**Contract**:

````typescript
// No props interface - component uses useTheme() internally

/**
 * Theme toggle button component
 *
 * Renders a button that toggles between light and dark themes.
 * Uses Nuxt UI v4 UButton component for consistent styling.
 * Fully accessible with ARIA attributes and keyboard support.
 *
 * @component
 * @example
 * ```vue
 * <template>
 *   <ThemeToggle />
 * </template>
 * ```
 */
export default {
  name: "ThemeToggle",
};
````

**Rendered Output**:

```html
<button
  type="button"
  class="... nuxt-ui button classes ..."
  role="switch"
  aria-checked="[true if dark, false if light]"
  aria-label="Switch to [light|dark] mode"
  @click="toggle()"
>
  <icon name="[sun|moon]" />
</button>
```

**Behavior Specifications**:

- Renders `UButton` component from Nuxt UI v4
- Shows sun icon (☀️) when dark mode active (indicates "switch to light")
- Shows moon icon (🌙) when light mode active (indicates "switch to dark")
- Calls `toggle()` from `useTheme()` on click
- Updates `aria-checked` based on `isDark` value
- Updates `aria-label` dynamically based on current theme
- Supports keyboard navigation (Tab to focus, Enter/Space to activate)

**Accessibility Requirements** (WCAG 2.1 AA):

- MUST have `role="switch"` attribute
- MUST have `aria-checked` attribute reflecting current state
- MUST have `aria-label` describing action (not current state)
- MUST be keyboard accessible (Tab, Enter, Space)
- MUST have visible focus indicator
- Button MUST have sufficient contrast in both themes

**Styling**:

- Uses Nuxt UI v4 button variants: `variant="ghost"`, `color="gray"`
- Icon only, no text label (aria-label provides context)
- Size should be consistent with other header buttons
- Transitions smoothly between states (icon rotation optional)

**Testing Requirements**:

- 10+ component tests for rendering, interaction, accessibility
- Test icon changes based on theme
- Test aria attributes update correctly
- Test click triggers toggle function
- Test keyboard navigation works

**Integration Points**:

- Used in: AppHeader.vue, AdminHeader.vue
- May be used in: AppFooter.vue (mobile optimization)

---

## Modified Components

### AppHeader Component

**File**: `app/components/AppHeader.vue` (EXISTING - MODIFY)

**Modifications Required**:

1. **Add ThemeToggle component**:

   ```vue
   <template>
     <header>
       <AppLogo />
       <!-- Navigation items -->
       <ThemeToggle />
       <!-- NEW -->
       <NuxtLink to="/admin">Admin Panel</NuxtLink>
       <!-- NEW -->
     </header>
   </template>
   ```

2. **Add cross-section navigation link**:

   ```vue
   <script setup>
   const { crossSection } = useNavigation();
   </script>

   <template>
     <!-- ... existing content ... -->
     <NuxtLink
       v-if="crossSection.currentSection === 'frontend'"
       :to="crossSection.targetPath"
     >
       {{ crossSection.targetLabel }}
     </NuxtLink>
   </template>
   ```

**Testing Requirements**:

- Verify ThemeToggle renders in header
- Verify admin link appears when on frontend section
- Verify link has correct path and label
- Verify responsive behavior (may hide on mobile)

---

### AdminHeader Component

**File**: `app/components/AdminHeader.vue` (EXISTING - MODIFY)

**Modifications Required**:

1. **Add ThemeToggle component**:

   ```vue
   <template>
     <header>
       <h1>Admin Panel</h1>
       <!-- Navigation items -->
       <ThemeToggle />
       <!-- NEW -->
       <NuxtLink to="/">View Site</NuxtLink>
       <!-- NEW -->
     </header>
   </template>
   ```

2. **Add cross-section navigation link**:

   ```vue
   <script setup>
   const { crossSection } = useNavigation();
   </script>

   <template>
     <!-- ... existing content ... -->
     <NuxtLink
       v-if="crossSection.currentSection === 'admin'"
       :to="crossSection.targetPath"
     >
       {{ crossSection.targetLabel }}
     </NuxtLink>
   </template>
   ```

**Testing Requirements**:

- Verify ThemeToggle renders in admin header
- Verify frontend link appears when on admin section
- Verify link has correct path and label

---

### default.vue Layout

**File**: `app/layouts/default.vue` (EXISTING - MODIFY)

**Modifications Required**:

1. **Add dark class binding to root element**:

   ```vue
   <script setup>
   const { isDark } = useTheme();
   </script>

   <template>
     <div :class="{ dark: isDark }">
       <!-- MODIFY -->
       <AppHeader />
       <main>
         <slot />
       </main>
       <AppFooter />
     </div>
   </template>
   ```

**Alternative approach** (more performant):

```vue
<script setup>
// Theme is applied to <html> by store.apply()
// No need for layout-level class binding
</script>

<template>
  <div>
    <!-- No modification needed if using html element strategy -->
    <AppHeader />
    <main>
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
```

**Decision**: Use `html` element strategy (no layout modification needed) for better performance.

**Testing Requirements**:

- Verify theme applies to all child components
- Verify theme persists across page navigation within layout

---

### admin.vue Layout

**File**: `app/layouts/admin.vue` (EXISTING - MODIFY)

**Modifications Required**:

Same as default.vue - use `html` element strategy, no layout changes needed.

**Testing Requirements**:

- Verify theme applies to admin layout components
- Verify theme persists when navigating within admin section

---

## Plugins

### Theme Initialization Plugin

**File**: `app/plugins/theme-init.client.ts` (NEW)

**Contract**:

```typescript
/**
 * Theme initialization plugin
 *
 * Runs before Vue hydration to prevent FOUC (Flash of Unstyled Content).
 * Reads theme preference from localStorage and applies dark class to <html>.
 *
 * This plugin has enforce: 'pre' to run before other plugins.
 * It must execute synchronously to block hydration until theme is applied.
 *
 * @plugin
 */
export default defineNuxtPlugin({
  name: "theme-init",
  enforce: "pre",
  setup() {
    // Initialize theme store
    const themeStore = useThemeStore();
    themeStore.initialize();

    // Watch for system preference changes (when mode is 'system')
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        if (themeStore.mode === "system") {
          themeStore.set("system"); // Re-detect and apply
        }
      });
    }
  },
});
```

**Behavior Specifications**:

- MUST run with `enforce: 'pre'` to execute before hydration
- MUST call `themeStore.initialize()` synchronously
- MUST set up system preference change listener
- MUST only react to system changes when mode is 'system'
- MUST NOT delay hydration beyond theme initialization

**Testing Requirements**:

- E2E test verifies no FOUC on page load
- Unit test verifies plugin calls initialize
- Integration test verifies system preference listener works

---

## Type Definitions

### Theme Types

**File**: `types/theme.ts` (NEW)

```typescript
/**
 * User's explicit theme preference
 * - 'light': Always use light theme
 * - 'dark': Always use dark theme
 * - 'system': Follow system preference
 */
export type ThemeMode = "light" | "dark" | "system";

/**
 * Currently active theme (computed from mode + system preference)
 * - 'light': Light theme is active
 * - 'dark': Dark theme is active
 */
export type ActiveTheme = "light" | "dark";

/**
 * Theme state stored in Pinia
 */
export interface ThemeState {
  mode: ThemeMode;
  current: ActiveTheme;
  isTransitioning: boolean;
}

/**
 * Return type of useTheme() composable
 */
export interface UseThemeReturn {
  mode: Ref<ThemeMode>;
  current: Ref<ActiveTheme>;
  isTransitioning: Ref<boolean>;
  isDark: ComputedRef<boolean>;
  toggleIcon: ComputedRef<string>;
  toggle: () => void;
  set: (mode: ThemeMode) => void;
  detectSystemPreference: () => ActiveTheme;
}
```

### Navigation Types

**File**: `types/navigation.ts` (EXISTING - EXTEND)

```typescript
/**
 * Section of the application
 * - 'frontend': Public-facing pages
 * - 'admin': Admin panel pages
 */
export type SectionType = "frontend" | "admin";

/**
 * Cross-section navigation context
 */
export interface CrossSectionNav {
  currentSection: SectionType;
  targetPath: string;
  targetLabel: string;
  showNav: boolean;
}

/**
 * Return type of useNavigation() composable (extended)
 */
export interface UseNavigationReturn {
  // ... existing navigation properties ...
  crossSection: ComputedRef<CrossSectionNav>;
}
```

---

## CSS Contracts

### Tailwind Configuration

**File**: `tailwind.config.js` (EXISTING - VERIFY/MODIFY)

**Required Configuration**:

```javascript
module.exports = {
  darkMode: "class", // MUST be 'class' not 'media'
  theme: {
    extend: {
      transitionDuration: {
        theme: "200ms", // Optional: custom transition duration
      },
    },
  },
};
```

**Verification Required**:

- Check if `darkMode: 'class'` is already set (Nuxt UI v4 may set this)
- If not set, add this configuration

---

### Main CSS

**File**: `app/assets/css/main.css` (EXISTING - MAY MODIFY)

**Optional CSS Enhancements**:

```css
/**
 * Smooth theme transitions
 * Applied to root element for global effect
 */
html {
  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
}

/**
 * Prevent transition on page load (prevents animation on initial render)
 */
html.no-transitions,
html.no-transitions * {
  transition: none !important;
}
```

**Usage**:

- `no-transitions` class can be added by plugin, removed after 100ms
- Prevents unwanted animations when page first loads with saved theme

---

## localStorage Contracts

### Storage Schema

**Key**: `theme-preference`

**Value Type**: `string` (ThemeMode: `'light'`, `'dark'`, or `'system'`)

**Read Contract**:

```typescript
const savedMode = localStorage.getItem("theme-preference") as ThemeMode | null;
if (savedMode && ["light", "dark", "system"].includes(savedMode)) {
  // Use saved mode
} else {
  // Default to 'system'
}
```

**Write Contract**:

```typescript
try {
  localStorage.setItem("theme-preference", mode);
} catch (error) {
  // localStorage unavailable or quota exceeded
  // Fail silently, theme will fallback to system preference
  console.warn("Failed to persist theme preference:", error);
}
```

**Error Handling**:

- MUST handle `SecurityError` (localStorage disabled)
- MUST handle `QuotaExceededError` (unlikely for single string)
- MUST NOT throw errors to user
- MUST fallback to system preference when unavailable

---

## Performance Contracts

### Theme Toggle Performance

**Requirement**: <50ms from click to DOM update (NFR-006, PV-001)

**Measurement**:

```typescript
const start = performance.now();
await toggle();
const end = performance.now();
expect(end - start).toBeLessThan(50);
```

**Validation**: E2E test with Performance API

---

### Navigation Performance

**Requirement**: <500ms for cross-section navigation (NFR-006, PV-002)

**Measurement**:

```typescript
const start = performance.now();
await page.click('a[href="/admin"]');
await page.waitForLoadState("networkidle");
const end = performance.now();
expect(end - start).toBeLessThan(500);
```

**Validation**: E2E test with Playwright

---

### No FOUC Requirement

**Requirement**: <1% occurrence of flash of wrong theme (PV-003)

**Measurement**:

- Visual regression testing with Playwright
- 100 page loads with saved dark preference
- 0-1 instances of light theme flash acceptable

**Validation**: Automated visual tests

---

## Testing Contracts

### Test Coverage Requirements

**Unit Tests**:

- Theme store: 15+ tests (100% coverage of actions and getters)
- useTheme composable: 5+ tests (100% coverage)
- useNavigation extension: 6+ tests (100% coverage of cross-section logic)

**Component Tests**:

- ThemeToggle: 10+ tests (rendering, interaction, accessibility)
- Modified headers: 5+ tests each (verify new elements render)

**E2E Tests**:

- Theme toggle flow: 6+ tests (all acceptance scenarios from spec)
- Cross-section navigation: 6+ tests (all navigation scenarios)
- Performance: 4+ tests (theme toggle speed, navigation speed, FOUC, storage)

**Total**: 60+ test cases minimum

---

## Summary

**Contracts Defined**:

- 1 Store contract (ThemeStore)
- 2 Composable contracts (useTheme, useNavigation extension)
- 1 New component contract (ThemeToggle)
- 4 Modified component contracts (headers + layouts)
- 1 Plugin contract (theme-init)
- 2 Type definition contracts (theme, navigation)
- 3 CSS/Config contracts (Tailwind, main.css, localStorage)
- 4 Performance contracts (toggle speed, nav speed, FOUC, persistence)
- 60+ test cases across all levels

**Ready for Implementation**: All public interfaces are fully specified and testable. Implementation phase can begin with TDD approach (RED-GREEN-REFACTOR).
