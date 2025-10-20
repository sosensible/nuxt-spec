# Quickstart: Basic Usability Enhancements - Dark Mode & Cross-Section Navigation

**Feature**: `002-basic-usability-i`  
**Date**: October 20, 2025  
**Branch**: `002-basic-usability-i`

## Prerequisites

- Node.js 18+ installed
- pnpm package manager installed
- Git repository cloned
- Checked out to branch `002-basic-usability-i`

## Setup Development Environment

### 1. Install Dependencies

```powershell
# From repository root
pnpm install
```

### 2. Start Development Server

```powershell
# Run in DEDICATED terminal (DO NOT CLOSE)
pnpm dev
```

**Important**: Keep this terminal open. Run all other commands in a separate terminal.

### 3. Verify Existing Setup

Open browser to `http://localhost:3000`:

- ✅ Homepage loads (frontend layout)
- ✅ Navigate to `/admin` (admin layout)
- ✅ Tailwind CSS is working
- ✅ Nuxt UI components render

## Implementation Workflow (TDD)

### Phase RED: Write Failing Tests First

**1. Create Type Definitions**

```powershell
# Create types/theme.ts
New-Item -ItemType File -Path "types\theme.ts"
```

Add type definitions from contracts/components.md (ThemeMode, ActiveTheme, ThemeState)

**2. Write Theme Store Tests (Failing)**

```powershell
# Create test file
New-Item -ItemType File -Path "tests\functional\stores\theme.test.ts" -Force
```

Write tests for:

- Initial state
- `toggle()` action
- `set()` action
- `detectSystemPreference()` action
- Getters (isDark, hasExplicitPreference, toggleIcon)

**Run tests** (should fail - no store exists yet):

```powershell
pnpm test tests/functional/stores/theme.test.ts
```

**3. Write useTheme Composable Tests (Failing)**

```powershell
# Create test file
New-Item -ItemType File -Path "tests\functional\composables\useTheme.test.ts" -Force
```

Write tests for composable return values and reactivity.

**Run tests** (should fail):

```powershell
pnpm test tests/functional/composables/useTheme.test.ts
```

**4. Write ThemeToggle Component Tests (Failing)**

```powershell
# Create test file
New-Item -ItemType File -Path "tests\functional\components\ThemeToggle.test.ts" -Force
```

Write tests for:

- Renders button with correct icon
- Calls toggle on click
- ARIA attributes correct
- Keyboard accessible

**Run tests** (should fail):

```powershell
pnpm test tests/functional/components/ThemeToggle.test.ts
```

**5. Write E2E Tests (Failing)**

```powershell
# Create test file
New-Item -ItemType File -Path "tests\e2e\theme.spec.ts" -Force
```

Write tests for all acceptance scenarios from spec.md.

**Run tests** (should fail):

```powershell
pnpm test:e2e tests/e2e/theme.spec.ts
```

**✅ RED Phase Complete**: All tests are written and failing.

---

### Phase GREEN: Implement to Pass Tests

**6. Implement Theme Store**

```powershell
# Create store file
New-Item -ItemType File -Path "app\stores\theme.ts"
```

Implement according to contracts/components.md:

- State: mode, current, isTransitioning
- Getters: isDark, hasExplicitPreference, toggleIcon
- Actions: toggle, set, detectSystemPreference, initialize, persist, apply

**Run tests** (should start passing):

```powershell
pnpm test tests/functional/stores/theme.test.ts
```

**7. Implement useTheme Composable**

```powershell
# Create composable file
New-Item -ItemType File -Path "app\composables\useTheme.ts"
```

Implement wrapper around useThemeStore per contract.

**Run tests** (should pass):

```powershell
pnpm test tests/functional/composables/useTheme.test.ts
```

**8. Implement Theme Plugin**

```powershell
# Create plugin file
New-Item -ItemType File -Path "app\plugins\theme-init.client.ts"
```

Implement pre-hydration theme initialization per contract.

**9. Implement ThemeToggle Component**

```powershell
# Create component file
New-Item -ItemType File -Path "app\components\ThemeToggle.vue"
```

Implement using Nuxt UI v4 UButton per contract.

**Run tests** (should pass):

```powershell
pnpm test tests/functional/components/ThemeToggle.test.ts
```

**10. Update Tailwind Config**

Verify `tailwind.config.js` has `darkMode: 'class'`.

**11. Add CSS Transitions**

Update `app/assets/css/main.css` with smooth transitions per contract.

**12. Modify AppHeader Component**

Add ThemeToggle and admin navigation link.

**13. Modify AdminHeader Component**

Add ThemeToggle and frontend navigation link.

**14. Extend useNavigation Composable**

Add crossSection computed property.

**15. Test Manually**

Visit `http://localhost:3000`:

- ✅ Theme toggle button appears in header
- ✅ Clicking toggle changes theme
- ✅ Theme persists after page reload
- ✅ Admin link appears in frontend header
- ✅ Navigate to admin, see frontend link
- ✅ Theme persists across navigation

**16. Run All Tests**

```powershell
# Unit and component tests
pnpm test

# E2E tests
pnpm test:e2e
```

**All tests should pass.**

**✅ GREEN Phase Complete**: All tests passing, feature works.

---

### Phase REFACTOR: Improve Code Quality

**17. Review Code Quality**

- Remove console.log statements
- Add JSDoc comments to all public functions
- Ensure consistent naming conventions
- Optimize performance (if needed)
- Check for code duplication

**18. Run Tests Again**

```powershell
pnpm test
pnpm test:e2e
```

**All tests must still pass after refactoring.**

**19. Run Linter**

```powershell
pnpm lint
```

Fix any linting errors.

**20. Verify Performance**

Check E2E tests confirm:

- ✅ Theme toggle <50ms (PV-001)
- ✅ Navigation <500ms (PV-002)
- ✅ No FOUC (PV-003)
- ✅ Storage <10ms (PV-004)

**✅ REFACTOR Phase Complete**: Code is clean, tests still passing.

---

## Testing Commands

### Run All Unit Tests

```powershell
pnpm test
```

### Run Specific Test File

```powershell
pnpm test tests/functional/stores/theme.test.ts
```

### Run Tests in Watch Mode

```powershell
pnpm test --watch
```

### Run E2E Tests

```powershell
# Run all E2E tests
pnpm test:e2e

# Run specific E2E test
pnpm test:e2e tests/e2e/theme.spec.ts

# Run E2E tests in UI mode (interactive)
pnpm test:e2e --ui
```

### Run Tests with Coverage

```powershell
pnpm test --coverage
```

Coverage should be:

- ✅ Theme store: 100%
- ✅ useTheme composable: 100%
- ✅ ThemeToggle component: 100%

## Manual Testing Checklist

### Theme Toggle Testing

- [ ] **System Preference Detection**:

  - Set OS to dark mode
  - Visit site in incognito (no saved preference)
  - Verify dark theme is applied

- [ ] **Toggle Functionality**:

  - Click theme toggle button
  - Verify theme changes immediately (<1s)
  - Verify all components update (header, footer, main content)
  - No page reload occurs

- [ ] **Persistence**:

  - Toggle to dark mode
  - Close browser
  - Reopen browser to same URL
  - Verify dark theme is still active

- [ ] **Cross-Section Consistency**:

  - Set dark mode on frontend
  - Navigate to admin section
  - Verify dark mode persists
  - Navigate back to frontend
  - Verify dark mode still active

- [ ] **Accessibility**:

  - Use Tab key to focus theme toggle
  - Press Enter or Space to activate
  - Verify theme changes
  - Use screen reader (NVDA/JAWS)
  - Verify button is announced correctly

- [ ] **Visual Quality**:
  - Verify smooth transition (no jarring flash)
  - Verify all text is readable in both themes
  - Verify all UI elements have sufficient contrast
  - Check mobile, tablet, desktop viewports

### Cross-Section Navigation Testing

- [ ] **Frontend to Admin**:

  - Visit frontend homepage
  - Locate "Admin Panel" link in header
  - Click link
  - Verify navigation to `/admin`
  - Verify admin layout is applied

- [ ] **Admin to Frontend**:

  - Visit admin section
  - Locate "View Site" link in admin header
  - Click link
  - Verify navigation to `/`
  - Verify default layout is applied

- [ ] **Performance**:

  - Navigation completes in <2 seconds
  - No full page reload (client-side routing)

- [ ] **Theme Consistency**:
  - Set dark mode in frontend
  - Navigate to admin
  - Verify dark mode persists
  - Navigate back to frontend
  - Verify dark mode persists

## Troubleshooting

### Theme Toggle Doesn't Work

**Symptom**: Clicking toggle does nothing

**Checks**:

- [ ] Verify `darkMode: 'class'` in tailwind.config.js
- [ ] Check browser console for errors
- [ ] Verify theme store is initialized in plugin
- [ ] Verify ThemeToggle component calls toggle() function

**Fix**: Review store implementation and plugin setup

---

### Theme Flashes Wrong Color on Load

**Symptom**: Light theme shows briefly before dark theme applies

**Checks**:

- [ ] Verify theme-init.client.ts plugin has `enforce: 'pre'`
- [ ] Verify plugin calls initialize() synchronously
- [ ] Check if localStorage has saved preference

**Fix**: Ensure plugin runs before hydration, consider inline script in app.html

---

### Theme Doesn't Persist

**Symptom**: Theme resets to light mode after page reload

**Checks**:

- [ ] Check browser console for localStorage errors
- [ ] Verify persist() is called after toggle()
- [ ] Check if browser allows localStorage (not in private mode)

**Fix**: Ensure persist() writes to correct key, handle errors gracefully

---

### Navigation Links Don't Appear

**Symptom**: Admin/frontend links missing from headers

**Checks**:

- [ ] Verify useNavigation() composable returns crossSection
- [ ] Verify v-if condition in header components
- [ ] Check current route path in browser

**Fix**: Review useNavigation implementation and header component templates

---

### Tests Failing

**Symptom**: Tests fail even though feature works manually

**Checks**:

- [ ] Verify test mocks for localStorage
- [ ] Verify test mocks for matchMedia
- [ ] Check if tests use proper async/await
- [ ] Verify Nuxt Test Utils are properly configured

**Fix**: Review test setup, add necessary mocks, check async handling

---

## Performance Verification

### Measure Theme Toggle Performance

**Manual Test**:

1. Open browser DevTools → Performance tab
2. Start recording
3. Click theme toggle
4. Stop recording after theme change
5. Analyze timeline: Should be <50ms from click to render

**Automated Test** (in E2E):

```typescript
const start = performance.now();
await page.click('[data-testid="theme-toggle"]');
const end = performance.now();
expect(end - start).toBeLessThan(50);
```

### Measure Navigation Performance

**Manual Test**:

1. Open browser DevTools → Network tab
2. Click cross-section navigation link
3. Check waterfall: Should have no network requests (client-side routing)
4. Check time: Should complete in <500ms

**Automated Test** (in E2E):

```typescript
const start = performance.now();
await page.click('a[href="/admin"]');
await page.waitForLoadState("domcontentloaded");
const end = performance.now();
expect(end - start).toBeLessThan(500);
```

## Accessibility Verification

### Automated Checks

```powershell
# Install axe-core if not already installed
pnpm add -D @axe-core/playwright

# Run accessibility tests
pnpm test:e2e tests/e2e/accessibility.spec.ts
```

### Manual Checks

**Keyboard Navigation**:

- [ ] Tab to theme toggle button
- [ ] Visible focus indicator appears
- [ ] Enter or Space activates toggle
- [ ] Tab to admin/frontend link
- [ ] Enter navigates to link

**Screen Reader** (NVDA on Windows):

- [ ] Theme toggle announced as "Switch to [dark|light] mode, button"
- [ ] Current state announced ("checked" for dark, "not checked" for light)
- [ ] Navigation links announced with correct text

**Contrast** (use browser DevTools or online tool):

- [ ] All text meets 4.5:1 ratio in light mode
- [ ] All text meets 4.5:1 ratio in dark mode
- [ ] UI elements (borders, icons) meet 3:1 ratio

## Final Checklist

Before marking feature as complete:

- [ ] All unit tests passing (60+ tests)
- [ ] All component tests passing
- [ ] All E2E tests passing
- [ ] Manual testing checklist complete
- [ ] Performance targets met (<50ms toggle, <500ms nav)
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Code reviewed and refactored
- [ ] No console errors in browser
- [ ] Linter passing (no errors)
- [ ] Documentation updated (JSDoc comments)
- [ ] Git commit messages follow conventions
- [ ] Feature ready for PR review

## Next Steps

After implementation is complete:

1. **Run Full Test Suite**:

   ```powershell
   pnpm test && pnpm test:e2e
   ```

2. **Create PR**:

   ```powershell
   git add .
   git commit -m "feat: add dark mode toggle and cross-section navigation"
   git push origin 002-basic-usability-i
   ```

3. **Review Checklist**:
   - [ ] All acceptance scenarios from spec.md are tested
   - [ ] All success criteria from spec.md are met
   - [ ] TDD cycle (RED-GREEN-REFACTOR) was followed
   - [ ] Constitution principles are satisfied
   - [ ] Development standards are satisfied

**Feature Status**: Ready for review ✅
