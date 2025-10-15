# Layout-Based Web Experience - Incremental Implementation Plan

**Date:** October 14, 2025  
**Status:** Phase 3 COMPLETE! ✅

## Summary of Progress

**Phase 1: Basic Structure** - ✅ COMPLETE

- ✅ Step 1.1: Minimal working app with single page
- ✅ Step 1.2: Basic layouts (default & admin) working
- ✅ Step 1.3: Multiple pages with routing working

**Phase 2: State Management** - ✅ COMPLETE

- ✅ Step 2.1: Pinia module added
- ✅ Step 2.2: Layout store created
- ✅ Step 2.3: Navigation store created
- ✅ Step 2.4: Stores tested and working in pages

**Phase 3: Composables Layer** - ✅ COMPLETE

- ✅ Step 3.1: useLayoutState composable created and tested
- ✅ Step 3.2: useNavigation composable created and tested

**Current State:** We have a fully functional multi-page Nuxt app with layouts, Pinia stores, and composable wrappers.

---

## Problem Analysis

The current implementation is crashing during startup because:

1. Stores/composables may have circular dependencies
2. Layouts trying to use stores before Pinia initialization
3. Complex components loaded at build time
4. Multiple modules potentially conflicting

## New Phased Approach

### Phase 0: Foundation & Verification ✅ COMPLETE

- [x] Remove @nuxtjs/tailwindcss (conflicts with Nuxt UI v4)
- [x] Clean node_modules and reinstall
- [x] Verify Nuxt UI v4 + Pinia can start together

**Status:** Server can start with minimal config + basic pages

---

### Phase 1: Basic Structure (CURRENT)

**Goal:** Get a working app with simple layouts, no stores

#### Step 1.1: Debug Nitro Server Startup

**Status:** ✅ COMPLETE

- [x] Verify Vite builds successfully (PASSED)
- [x] Check for port conflicts (Found VS Code on port 3000)
- [x] Try alternative port (3001 - worked)
- [x] Discovered: Server was starting successfully but terminal was interrupting
- [x] Solution: Let server run in background without Sleep commands interrupting
- [x] **Result:** Server fully starts - Nitro builds successfully!

#### Step 1.1.1: Minimal Working App

**Status:** ✅ COMPLETE & VERIFIED!

- [x] Nuxt config with only `@nuxt/ui` module
- [x] Simple `app.vue` with just `<NuxtPage />`
- [x] Single page (`index.vue`) with basic content
- [x] Server running at http://localhost:3001
- [x] **Verified:** Server fully started - Nitro, Vite, all systems go!
- [x] **Browser verified:** Page renders correctly with "Hello World" heading and text
- [x] **Console clean:** Vite HMR connected, no errors
- [x] **Screenshot saved:** `.playwright-mcp/phase-1-1-complete.png`

**Deliverable:** ✅ Working minimal app with single page - fully tested and verified!

---

#### Step 1.2: Add Basic Layouts

**Status:** ✅ COMPLETE & VERIFIED!

- [x] Create minimal `default.vue` layout (no stores, just wrapper)
- [x] Create minimal `admin.vue` layout (no stores, just wrapper)
- [x] Update `app.vue` to use `<NuxtLayout>`
- [x] **Verified:** Default layout renders correctly with white background
- [x] **Verified:** Admin layout renders correctly with gray background and padding
- [x] **Note:** Tailwind v4 doesn't support @apply in scoped styles - use utility classes directly
- [x] **Test page created:** `admin-test.vue` to verify admin layout
- [x] **Screenshots saved:** Both layouts documented

**Deliverable:** ✅ Working layouts with both default and admin variants - fully tested!

**Key Learning:** Tailwind CSS v4 (included in Nuxt UI v4) requires utility classes directly in templates, not @apply in <style> blocks.

---

#### Step 1.3: Add Multiple Pages

**Status:** ✅ COMPLETE & VERIFIED!

- [x] Add `info.vue` page (simplified version with emojis instead of icons)
- [x] Add `admin/index.vue` page (dashboard with stats and activity)
- [x] Add `admin/users.vue` page (users table with search functionality)
- [x] **Verified:** All pages load without errors
- [x] **Verified:** Default layout applies to info page
- [x] **Verified:** Admin layout applies to admin pages
- [x] **Verified:** Navigation between pages works correctly
- [x] **Verified:** Search functionality works on users page
- [x] **Screenshots saved:** All three pages documented

**Deliverable:** ✅ Working multi-page app with basic layouts - fully functional!

**Key Decisions:**

- Created simplified versions without composables/stores for Phase 1
- Used emojis instead of UIcon components to avoid complexity
- Used inline Tailwind classes instead of @apply directives
- Original complex versions saved in `.disabled` folders for future migration

---

### Phase 2: Add State Management

**Status:** ✅ COMPLETE & VERIFIED!

**Goal:** Integrate Pinia stores safely

#### Step 2.1: Add Pinia Module

- [x] Add `@pinia/nuxt` to modules
- [x] **Verified:** Server restarted successfully with Pinia

#### Step 2.2: Create Simple Layout Store

- [x] Create basic `stores/layout.ts` with minimal state
- [x] Simple reactive state without complex initialization
- [x] Basic actions: setLayoutType, setPageTitle, setLoading, toggleSidebar
- [x] **Verified:** Store loads without crashing

#### Step 2.3: Create Simple Navigation Store

- [x] Create basic `stores/navigation.ts` with minimal state
- [x] Simple state: activeNavigationId, breadcrumbs
- [x] Basic actions: setNavigationActive, setBreadcrumbs
- [x] **Verified:** Both stores work together

#### Step 2.4: Use Stores in Pages (NOT Layouts)

- [x] Test accessing stores from `index.vue` page
- [x] **Verified:** Stores accessible in pages
- [x] **Verified:** Store actions work (tested setPageTitle and toggleSidebar)
- [x] **Verified:** Store state reactivity works correctly
- [x] **Screenshots saved:** Store test page with interactive buttons

**Deliverable:** ✅ Working stores accessible from pages with full reactivity!

**Key Achievements:**

- Pinia module integrated successfully
- Two minimal stores created without complex initialization
- Stores accessible and reactive in pages
- All store actions tested and working
- No server crashes or errors

---

### Phase 3: Add Composables Layer

**Status:** ✅ COMPLETE & VERIFIED!

**Goal:** Create safe composable wrappers

#### Step 3.1: Create Basic useLayoutState

- [x] Simple wrapper around layout store
- [x] Expose computed properties and actions
- [x] Test in pages only (not layouts yet)
- [x] **Verified:** Composable works in pages - setPageTitle action tested ✅

#### Step 3.2: Create Basic useNavigation

- [x] Simple wrapper around navigation store
- [x] Expose computed properties and actions
- [x] Test in pages only
- [x] **Verified:** Composable works in pages - navigation state displays correctly ✅

**Deliverable:** ✅ Working composables in pages - fully tested!

**Key Achievements:**

- Created `composables/useLayoutState.ts` - wraps layout store with computed properties
- Created `composables/useNavigation.ts` - wraps navigation store with computed properties
- Updated `index.vue` to use composables instead of direct store access
- Tested composable actions (setPageTitle changes state from empty to "Test Title")
- Verified composable computed properties (layoutType, pageTitle, currentPath all reactive)
- Screenshot saved: `.playwright-mcp/phase3-composables-working.png`

**Implementation Details:**

- Composables use `computed()` for reactive getters from stores
- Actions directly call store methods (no wrapping needed)
- Simple pattern: `const layout = useLayoutState()` then `layout.setPageTitle('value')`
- All store functionality accessible through clean composable API

---

### Phase 4: Enhanced Layouts (NEXT)

**Goal:** Add store integration to layouts safely

#### Step 4.1: Update Default Layout

- [ ] Add composables to `default.vue`
- [ ] Use `onMounted` for any initialization
- [ ] **Verify:** Layout works with stores

#### Step 4.2: Update Admin Layout

- [ ] Add composables to `admin.vue`
- [ ] Use `onMounted` for initialization
- [ ] **Verify:** Admin layout works

**Deliverable:** Layouts with state management

---

### Phase 5: Add Components

**Goal:** Build reusable components incrementally

#### Step 5.1: Header Components

- [ ] Create basic `AppHeader.vue`
- [ ] Create basic `AdminHeader.vue`
- [ ] Add to layouts
- [ ] **Verify:** Headers render

#### Step 5.2: Other Components

- [ ] `AppFooter.vue`
- [ ] `AdminSidebar.vue`
- [ ] `AppLogo.vue`
- [ ] Add incrementally, testing each

**Deliverable:** Complete component library

---

### Phase 6: Add Styling

**Goal:** Apply design system

#### Step 6.1: Add CSS Files

- [ ] Add `main.css` without @import
- [ ] Add `frontend.css`
- [ ] Add `admin.css`
- [ ] **Verify:** Styles load correctly

#### Step 6.2: Apply Tailwind Classes

- [ ] Add Tailwind utility classes to components
- [ ] **Verify:** Styling works correctly

**Deliverable:** Fully styled application

---

### Phase 7: Add Remaining Modules

**Goal:** Add other Nuxt modules safely

#### Step 7.1: Add Modules One by One

- [ ] Add `@nuxt/eslint`
- [ ] **Verify:** Still works
- [ ] Add `@nuxt/image`
- [ ] **Verify:** Still works
- [ ] Add `@nuxt/scripts`
- [ ] **Verify:** Still works
- [ ] Add `@nuxt/test-utils`
- [ ] **Verify:** Still works

**Deliverable:** Full module stack

---

### Phase 8: Advanced Features

**Goal:** Add remaining functionality

#### Step 8.1: TypeScript Strict Mode

- [ ] Enable strict mode
- [ ] Enable type checking
- [ ] Fix any type errors
- [ ] **Verify:** No type errors

#### Step 8.2: Route Rules

- [ ] Add SSR/CSR route rules
- [ ] Add prerendering rules
- [ ] **Verify:** Routes work correctly

#### Step 8.3: Full Store Functionality

- [ ] Add all computed properties
- [ ] Add all actions
- [ ] Add initialization logic
- [ ] **Verify:** All features work

**Deliverable:** Complete feature set

---

## Testing Strategy

After each step:

1. Start dev server and wait for full build (60+ seconds)
2. Check terminal for errors
3. Visit http://localhost:3000 in browser
4. Test page navigation
5. Check browser console for errors

## Rollback Strategy

If any step fails:

1. Note the exact error
2. Revert the last change
3. Verify server works again
4. Analyze the error
5. Adjust approach before retry

## Success Criteria

- ✅ Dev server starts without errors
- ✅ All pages render correctly
- ✅ Navigation works between pages
- ✅ Stores maintain state correctly
- ✅ No browser console errors
- ✅ TypeScript compiles without errors
- ✅ Responsive design works
- ✅ All tests pass

## Current Status

**Phase:** 1.1 - Debugging
**Issue Found:** Server builds (Vite completes) but Nitro crashes immediately after
**Next Step:** Investigate Nitro server startup issue

### Debug Findings

- ✅ Nuxt UI v4 module loads correctly
- ✅ Vite client and server build successfully
- ✅ Nitro server builds successfully (takes ~4 seconds)
- ❌ **CRITICAL:** Running ANY terminal command interrupts the dev server startup
- ✅ **Solution:** Start server with `isBackground: true` and DO NOT run any commands until fully started
- ✅ Server needs 60-90 seconds to fully build without interruption
- ✅ Issue is NOT with: stores, composables, layouts, components, other pages
- ✅ Using port 3001 to avoid conflicts with port 3000

### Potential Causes

1. ~~Port already in use~~ ✅ FIXED - using port 3001
2. ~~Nitro configuration issue~~ ✅ WORKS - just needs time
3. ~~Missing dependency~~ ✅ NOT THE ISSUE
4. ~~Windows-specific Nitro issue~~ ✅ NOT THE ISSUE
5. ✅ **ROOT CAUSE:** Terminal commands interrupting startup process

### Next Actions

1. ✅ Start server without interruption
2. ⏳ Wait 90 seconds for full build (IN PROGRESS)
3. Check browser at http://localhost:3001
4. Verify page renders correctly

---

## Notes

- Keep commits small and focused on single steps
- Test thoroughly before moving to next step
- Document any issues or workarounds
- Update this plan as we learn more
