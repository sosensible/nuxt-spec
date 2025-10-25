# Research: Basic Usability Enhancements - Dark Mode & Cross-Section Navigation

**Feature**: `002-basic-usability-i`  
**Date**: October 20, 2025  
**Status**: Complete - No Research Required

## Summary

This feature requires **no additional research** because all technical decisions align with established project patterns and standard web APIs. All unknowns from the Technical Context have been resolved using existing architectural patterns.

## Technical Decisions

### 1. Theme State Management

**Decision**: Pinia store accessed via `useTheme()` composable

**Rationale**:

- Established project pattern per Development Standards (state management via composable wrapper)
- Theme state needs to be shared across all components and layouts
- Pinia provides reactive state with TypeScript support
- Composable wrapper prevents direct store imports in components

**Alternatives Considered**:

- ❌ Composable-only (no Pinia): Would require prop drilling or provide/inject for deep component trees
- ❌ Direct Pinia store access: Violates Development Standards requirement for composable wrappers
- ✅ Pinia store + composable wrapper: Meets standards, provides clean API, supports testing

**Implementation Pattern**:

```typescript
// stores/theme.ts
export const useThemeStore = defineStore('theme', {
  state: () => ({ mode: 'system', current: 'light' }),
  actions: { toggle(), set(), detect() }
})

// composables/useTheme.ts
export const useTheme = () => {
  const store = useThemeStore()
  return { mode, current, toggle, set, detect }
}
```

### 2. Dark Mode Implementation Strategy

**Decision**: Tailwind's class-based dark mode with `dark:` variants

**Rationale**:

- Tailwind is already configured in the project (@nuxt/ui v4 uses Tailwind)
- Class-based approach (`class="dark"` on root element) allows programmatic control
- `dark:` variants provide consistent theming across all components
- Better performance than media query approach (no CSS recalculation on toggle)
- Nuxt UI v4 components already support dark mode via Tailwind

**Alternatives Considered**:

- ❌ CSS custom properties only: Would require extensive custom CSS, loses Tailwind benefits
- ❌ Media query dark mode: Can't be controlled programmatically, only responds to system preference
- ❌ Inline styles: Poor performance, difficult to maintain, no consistency
- ✅ Tailwind class-based dark mode: Leverages existing setup, performant, maintainable

**Configuration Required**:

```javascript
// tailwind.config.js
module.exports = {
  darkMode: "class", // Enable class-based dark mode
  // ... rest of config
};
```

### 3. Theme Toggle UI Component

**Decision**: Nuxt UI v4 Button or Toggle component

**Rationale**:

- NFR-007 requirement: "Theme toggle control MUST use Nuxt UI v4 components"
- Ensures UI consistency with rest of application
- Provides accessibility features out-of-the-box (ARIA labels, keyboard navigation)
- Supports dark mode styling automatically
- Icon support for sun/moon symbols

**Alternatives Considered**:

- ❌ Custom button component: Violates NFR-007, would require reimplementing accessibility
- ❌ Native HTML button with custom styling: Inconsistent with app UI, more work to match design
- ✅ Nuxt UI v4 component: Meets requirement, consistent, accessible, less code

**Component Choice**:

- Use `UButton` with icon prop for compact toggle in header
- Use `UToggle` if switch-style UI is preferred
- Both support `@click` event for theme switching

### 4. System Preference Detection

**Decision**: `prefers-color-scheme` media query + `matchMedia` API

**Rationale**:

- Standard Web API supported in all modern browsers (Chrome 76+, Firefox 67+, Safari 12.1+)
- Matches project's browser support requirements (Chrome 90+, Firefox 88+, Safari 14+)
- Non-blocking and synchronous detection
- Works in both SSR and CSR contexts

**Alternatives Considered**:

- ❌ User-agent sniffing: Unreliable, doesn't detect actual user preference
- ❌ Time-based heuristics: Assumes user location and schedule, poor UX
- ✅ `prefers-color-scheme`: Standard, reliable, user-controlled

**Implementation Pattern**:

```typescript
const detectSystemTheme = (): "light" | "dark" => {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
};
```

### 5. Theme Preference Persistence

**Decision**: localStorage with key `theme-preference`, fallback to system preference

**Rationale**:

- localStorage is standard, synchronous, and available in all target browsers
- Persists across browser sessions (FR-003 requirement)
- Can be read before hydration to prevent FOUC
- Graceful degradation if unavailable (fallback to system preference per FR-010)

**Alternatives Considered**:

- ❌ Cookies: Unnecessary server roundtrip, adds payload to every request
- ❌ IndexedDB: Asynchronous API adds complexity, overkill for single string
- ❌ sessionStorage: Doesn't persist across browser sessions (fails FR-003)
- ✅ localStorage: Simple, synchronous, appropriate for single preference value

**Storage Schema**:

```typescript
// Stored value: 'light' | 'dark' | 'system'
localStorage.setItem("theme-preference", mode);
```

### 6. SSR Theme Hydration (Preventing FOUC)

**Decision**: Nuxt plugin that reads localStorage and sets dark class before Vue hydration

**Rationale**:

- NFR-002 requirement: "Theme preference MUST be hydrated on SSR to prevent flash of wrong theme"
- Plugin runs before Vue app hydration, allowing DOM class manipulation
- Can execute inline script in app.html for even earlier execution if needed
- Established pattern in Nuxt ecosystem for theme initialization

**Alternatives Considered**:

- ❌ Set theme in component mounted hook: Too late, causes FOUC
- ❌ Middleware: Runs server-side, can't access localStorage
- ❌ CSS-only approach: Can't read localStorage from CSS
- ✅ Client-only plugin with priority: Runs before hydration, prevents FOUC

**Implementation Pattern**:

```typescript
// plugins/theme-init.client.ts
export default defineNuxtPlugin({
  name: "theme-init",
  enforce: "pre", // Run before other plugins
  setup() {
    // Read preference before hydration
    const preference = localStorage.getItem("theme-preference") || "system";
    const theme = preference === "system" ? detectSystemTheme() : preference;
    document.documentElement.classList.toggle("dark", theme === "dark");
  },
});
```

### 7. Cross-Section Navigation Implementation

**Decision**: NuxtLink components with explicit paths (/admin, /)

**Rationale**:

- NFR-004 requirement: "Navigation links MUST use Nuxt's router"
- NuxtLink provides client-side routing without full page reloads
- Maintains theme state across navigation (no page reload)
- Supports proper layout switching (default.vue ↔ admin.vue)
- Provides active link styling and prefetching automatically

**Alternatives Considered**:

- ❌ Standard <a> tags: Would cause full page reload, lose theme state
- ❌ window.location navigation: Same issue as <a> tags
- ❌ router.push in click handlers: Works but more code than NuxtLink
- ✅ NuxtLink: Standard Nuxt pattern, client-side routing, maintains state

**Navigation Schema**:

```vue
<!-- In AppHeader.vue (frontend) -->
<NuxtLink to="/admin">Admin Panel</NuxtLink>

<!-- In AdminHeader.vue (admin) -->
<NuxtLink to="/">View Site</NuxtLink>
```

### 8. Theme Transition Animation

**Decision**: CSS transition on background-color and color properties (200-300ms)

**Rationale**:

- Smooth theme transitions improve perceived performance
- CSS transitions are hardware-accelerated and performant
- 200-300ms duration feels smooth without being sluggish
- Transitions prevent jarring color changes

**Alternatives Considered**:

- ❌ No transitions: Jarring instant color change
- ❌ JavaScript animations: Worse performance than CSS, more code
- ❌ Very long transitions (>500ms): Feels sluggish, annoys users
- ✅ Short CSS transitions (200-300ms): Smooth, performant, pleasant

**Implementation Pattern**:

```css
/* In main.css or Tailwind config */
html {
  transition: background-color 200ms ease-in-out, color 200ms ease-in-out;
}
```

## Performance Considerations

### Theme Toggle Performance

**Target**: <50ms execution time (NFR-006)

**Strategy**:

- Use Pinia store for reactive state (optimized for Vue reactivity)
- Toggle dark class on document root (single DOM operation)
- CSS transitions handled by GPU (no JavaScript animation loop)
- localStorage write is synchronous and fast (<10ms per PV-004)

**Validation**: Performance.now() measurements in E2E tests

### Cross-Section Navigation Performance

**Target**: <500ms navigation time (NFR-006)

**Strategy**:

- NuxtLink client-side routing (no network request)
- Layout switching handled by Vue transition system
- Theme state preserved in Pinia (no re-initialization)
- Minimal JavaScript execution during navigation

**Validation**: Performance API measurements in E2E tests

### Preventing FOUC

**Target**: 99% of page loads with no flash (PV-003)

**Strategy**:

- Plugin with enforce: 'pre' runs before hydration
- Can add inline script in app.html for even earlier execution
- System preference detection is synchronous
- Theme class applied before any components render

**Validation**: Visual regression testing with Playwright

## Accessibility Considerations

### WCAG 2.1 AA Compliance

**Requirements**:

- SC-006: All color combinations pass 4.5:1 contrast ratio
- Keyboard navigation for theme toggle
- Screen reader announcements for theme changes
- Focus states visible in both themes

**Implementation**:

- Use Tailwind color palette with verified contrast ratios
- Nuxt UI v4 Button component provides keyboard support
- Add aria-label="Toggle theme" to button
- Add role="switch" and aria-checked attribute
- Announce theme change with aria-live region

**Validation**:

- Automated contrast checking with tools (e.g., axe DevTools)
- Manual keyboard navigation testing
- Screen reader testing (NVDA/JAWS)

## Security & Privacy Considerations

### localStorage Security

**Considerations**:

- localStorage is accessible to JavaScript (XSS risk)
- Theme preference is non-sensitive data
- No PII or authentication tokens stored

**Mitigations**:

- N/A - theme preference is public information
- Application-level XSS prevention (CSP headers, input sanitization) handles security

### System Preference Privacy

**Considerations**:

- `prefers-color-scheme` exposes user preference
- Part of browser fingerprinting surface
- User can control via OS settings

**Mitigations**:

- N/A - this is standard Web API used by most sites
- User control via OS settings is sufficient

## Testing Strategy

### Unit Tests (Vitest)

**Theme Store**:

- State initialization (default to 'system')
- toggle() action toggles between light/dark
- set() action sets specific theme
- detect() action reads system preference

**Theme Composable**:

- Returns reactive theme state
- Exposes toggle, set, detect functions
- Works with Pinia store

**System Detection Utility**:

- Correctly detects light preference
- Correctly detects dark preference
- Handles missing matchMedia API (fallback)

### Component Tests (Vitest + @vue/test-utils + Nuxt Test Utils)

**ThemeToggle Component**:

- Renders button with correct icon (sun/moon)
- Calls toggle function on click
- Updates aria-checked attribute
- Shows correct state (light/dark)

**Layout Components**:

- default.vue applies dark class when theme is dark
- admin.vue applies dark class when theme is dark
- Theme class removed when theme is light

### E2E Tests (Playwright)

**Theme Toggle Flow**:

- Toggle changes UI immediately (P1-AS-002)
- Theme preference persists across browser sessions (P1-AS-003)
- System theme detected on first visit (P1-AS-001)
- No FOUC on page load (P1-AS-005)
- Theme consistent across components (P1-AS-005)

**Cross-Section Navigation**:

- Frontend to admin navigation works (P2-AS-003)
- Admin to frontend navigation works (P2-AS-004)
- Theme maintained during navigation (P2-AS-005)
- Navigation completes in <500ms (PV-002)

**Accessibility**:

- Theme toggle keyboard accessible (Tab, Enter/Space)
- Theme toggle announced by screen reader
- Contrast ratios meet WCAG 2.1 AA in both themes

## Dependencies & Integration Points

### Existing Components to Modify

1. **AppHeader.vue**: Add ThemeToggle and admin navigation link
2. **AdminHeader.vue**: Add ThemeToggle and frontend navigation link
3. **AdminSidebar.vue**: Add frontend navigation link (optional)
4. **AppFooter.vue**: Potentially add ThemeToggle for mobile

**Integration Risk**: Low - these are minor additions to existing components

### Tailwind Configuration

**Required**: Ensure `darkMode: 'class'` is set in `tailwind.config.js`

**Verification**: Check if already configured (Nuxt UI v4 may already set this)

### Existing Color Palette

**Assumption #10 from spec**: "Existing Tailwind configuration includes or will be updated to include appropriate color schemes that meet WCAG 2.1 AA contrast requirements"

**Validation Needed**: Review current color usage for contrast compliance

**Risk**: Low - Tailwind's default palette generally meets contrast requirements

## Open Questions

**None** - All technical decisions are resolved using established patterns and standard APIs.

## Next Steps (Phase 1)

With research complete, proceed to Phase 1:

1. **Generate data-model.md**: Define Theme Preference and Navigation Context entities
2. **Generate contracts/**: Document component APIs and composable interfaces
3. **Generate quickstart.md**: Development setup and testing instructions
4. **Update agent context**: Run update-agent-context.ps1 script

**No blockers** - ready to proceed with Phase 1 design and contracts.
