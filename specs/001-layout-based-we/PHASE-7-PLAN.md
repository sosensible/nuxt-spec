# Phase 7: Add Remaining Modules

**Status:** 🚀 IN PROGRESS  
**Goal:** Integrate additional Nuxt modules to enhance development experience

## Module Overview

All modules are already installed in `package.json`. We need to:

1. Add them to `nuxt.config.ts` one at a time
2. Verify each one works before adding the next
3. Test that they don't conflict with existing setup

## Modules to Add

### 1. @nuxt/eslint ✅ (Already in devDependencies)

**Purpose:** Enhanced linting with Nuxt-specific rules  
**Benefits:**

- Auto-configured ESLint for Nuxt
- Vue/Nuxt best practices enforcement
- TypeScript linting support

**Scripts available:**

- `pnpm lint` - Already configured

### 2. @nuxt/image (Already in dependencies)

**Purpose:** Optimized image handling  
**Benefits:**

- Automatic image optimization
- Responsive images
- Lazy loading out of the box
- Multiple providers support

**Usage:**

```vue
<NuxtImg src="/image.jpg" />
<NuxtPicture src="/image.jpg" />
```

### 3. @nuxt/scripts (Already in dependencies)

**Purpose:** Third-party script management  
**Benefits:**

- Performance-optimized script loading
- Easy integration for analytics, maps, etc.
- Script loading strategies

**Usage:**

```vue
<ScriptGoogleMaps />
```

### 4. @nuxt/test-utils (Already in dependencies)

**Purpose:** Testing utilities  
**Benefits:**

- E2E testing with Playwright
- Component testing
- Server testing
- Already installed, just needs configuration

## Implementation Steps

### Step 7.1: Add @nuxt/eslint ✅

- [x] Already installed in devDependencies
- [ ] Add to modules array
- [ ] Verify dev server still works
- [ ] Run `pnpm lint` to test

### Step 7.2: Add @nuxt/image

- [x] Already installed in dependencies
- [ ] Add to modules array
- [ ] Verify dev server still works
- [ ] Test with a simple image component

### Step 7.3: Add @nuxt/scripts

- [x] Already installed in dependencies
- [ ] Add to modules array
- [ ] Verify dev server still works
- [ ] Optional: Configure script providers

### Step 7.4: Configure @nuxt/test-utils

- [x] Already installed in dependencies
- [ ] Add to modules array (if needed)
- [ ] Create basic test setup
- [ ] Verify tests can run

## Testing Strategy

After adding each module:

1. ✅ Dev server starts without errors
2. ✅ Existing pages still work
3. ✅ No console errors in browser
4. ✅ Module-specific features work
5. ✅ No conflicts with Nuxt UI or Pinia

## Rollback Plan

If any module causes issues:

1. Remove from modules array
2. Verify server works again
3. Document the issue
4. Research fix or defer to later

## Success Criteria

- ✅ All 4 modules integrated
- ✅ Dev server runs without errors
- ✅ All existing functionality preserved
- ✅ New module features accessible
- ✅ No performance degradation

## Current Progress

**Starting:** Step 7.1 - Add @nuxt/eslint module

## Notes

- All modules are already installed, so no `pnpm install` needed
- Focus on configuration and testing
- Keep commits small (one module per commit)
