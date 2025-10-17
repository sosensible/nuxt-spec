# Test Suite Documentation

This project uses **two complementary testing strategies** to ensure quality:

1. **Functional Tests** (Vitest) - Fast component/unit tests
2. **E2E Tests** (Playwright) - Real browser automation tests

## Testing Philosophy

We test **what the application does**, not **how it does it**:

### ✅ DO TEST:

- User-visible behavior and content
- Rendered HTML output
- Public APIs (stores, composables)
- State changes that affect users
- Component visual output
- Real browser interactions (clicks, navigation, forms)

### ❌ DON'T TEST:

- Internal component methods
- Private store implementation
- Vue ref/reactive internals
- CSS class names (unless critical for functionality)
- Implementation details that could change

## Test Structure

```
tests/
├── functional/              # Fast unit tests (Vitest + happy-dom)
│   ├── navigation.test.ts   # Page content (4 tests)
│   ├── layouts.test.ts      # Layout rendering (2 tests)
│   ├── components.test.ts   # Component output (5 tests)
│   └── stores.test.ts       # Store behavior (8 tests)
└── e2e/                     # Browser automation (Playwright + Chromium)
    ├── navigation.spec.ts   # Real page navigation (10 tests)
    ├── interactions.spec.ts # User interactions (10 tests)
    ├── layouts.spec.ts      # Layout switching (11 tests)
    └── utils/
        └── helpers.ts       # Common E2E utilities
```

**Total: 19 functional tests + 31 E2E tests = 50 tests**

## Running Tests

### Functional Tests (Fast - seconds)

```bash
# Run all functional tests once (CI mode)
pnpm test

# Watch mode for development
pnpm test:watch

# Visual UI for debugging
pnpm test:ui

# With coverage report
pnpm test:coverage
```

### E2E Tests (Browser Automation - minutes)

```bash
# Run all E2E tests (headless Chromium)
pnpm e2e

# Interactive UI with time travel debugging
pnpm e2e:ui

# Run with visible browser window
pnpm e2e:headed

# Step-by-step debug mode
pnpm e2e:debug
```

## Test Types Explained

### Functional Tests (Vitest)

**Purpose:** Fast feedback during development  
**Speed:** ~8 seconds for all 19 tests  
**Environment:** Lightweight DOM simulation (happy-dom)  
**Use For:**

- Component rendering verification
- Store behavior testing
- Quick feedback loop during coding
- CI/CD validation

**Example:**

```typescript
it("should display home page content", async () => {
  const component = await mountSuspended(IndexPage);
  expect(component.html()).toContain("Hello World");
});
```

### E2E Tests (Playwright)

**Purpose:** Verify real user workflows  
**Speed:** ~30-60 seconds for all 31 tests  
**Environment:** Real Chromium browser  
**Use For:**

- Full page navigation flows
- User interaction testing (clicks, typing)
- Layout switching verification
- Visual regression testing
- Cross-browser compatibility

**Example:**

```typescript
test("should navigate to info page via header link", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Info" }).click();
  await expect(page).toHaveURL("/info");
  await expect(page.getByText("About Our Platform")).toBeVisible();
});
```

## When to Use Each Test Type

| Scenario                    | Functional | E2E |
| --------------------------- | ---------- | --- |
| Component renders correctly | ✅         | ❌  |
| Store state changes         | ✅         | ❌  |
| Quick feedback during dev   | ✅         | ❌  |
| Full page navigation        | ❌         | ✅  |
| Button clicks work          | ❌         | ✅  |
| Layout switching            | ❌         | ✅  |
| Real browser behavior       | ❌         | ✅  |
| CI/CD (both run)            | ✅         | ✅  |

## What We Test

### Pages (`navigation.test.ts`)

- ✅ Content is visible to users
- ✅ Key elements are present
- ❌ No implementation details

**Example:**

```typescript
it("should display home page content", async () => {
  const component = await mountSuspended("pages/index.vue");
  expect(component.html()).toContain("Hello World");
});
```

### Layouts (`layouts.test.ts`)

- ✅ Headers and footers render
- ✅ Navigation elements appear
- ✅ Content slots work
- ❌ No internal state testing

### Components (`components.test.ts`)

- ✅ Visual output matches expectations
- ✅ Required elements are present
- ❌ No testing of private methods

### Stores (`stores.test.ts`)

- ✅ Public API behavior
- ✅ State changes work correctly
- ✅ Computed properties return expected values
- ❌ No testing of internal implementation

## Adding New Tests

When adding features:

1. **Ask:** "What does this feature DO for users?"
2. **Write tests** that verify that behavior
3. **Don't test** implementation details (refs, methods, etc.)
4. **Focus** on regression prevention

### Example - Good vs Bad Tests

**❌ BAD (Implementation-focused):**

```typescript
it("should call updateTitle method", () => {
  const component = wrapper.vm;
  component.updateTitle("test");
  expect(component.title).toBe("test");
});
```

**✅ GOOD (Behavior-focused):**

```typescript
it("should display updated title to users", async () => {
  const component = await mountSuspended("MyComponent.vue");
  // Interact as user would
  await component.find("input").setValue("test");
  // Verify what user sees
  expect(component.html()).toContain("test");
});
```

## CI Integration

Tests run automatically on:

- Every push to repository
- Pull requests
- Before deployment

CI Pipeline Order:

1. **Lint** - Code style
2. **Typecheck** - Type safety
3. **Test** - Functional behavior ← NEW!
4. **Build** - Production readiness

## Benefits

### Regression Prevention

- Catches breaking changes before deployment
- Validates that features continue to work
- No false positives from implementation changes

### Refactoring Safety

- Can refactor internal code without breaking tests
- Tests only fail when actual behavior changes
- Encourages better architecture

### Living Documentation

- Tests serve as documentation of how features work
- New developers can understand behavior quickly
- Shows expected user interactions

## Test Coverage

Current coverage:

- ✅ All 4 pages tested
- ✅ Both layouts tested
- ✅ All 5 components tested
- ✅ Both stores tested
- ✅ 19 total behavioral tests

**Note:** We focus on **behavioral coverage** (does it work for users?) rather than **code coverage** (are all lines executed?).

## Troubleshooting

### Tests failing locally but pass in CI

- Clear `.nuxt` folder: `rm -rf .nuxt`
- Reinstall dependencies: `pnpm install`
- Run `pnpm prepare` to regenerate Nuxt files

### Tests timing out

- Increase timeout in `vitest.config.ts`
- Check for infinite loops in components
- Verify async operations complete

### Snapshot mismatches

- We don't use snapshots (too brittle)
- Use specific content assertions instead
- Test user-visible behavior, not exact HTML structure

## Framework Details

- **Functional Test Runner:** Vitest 3.x
- **Functional Test Utils:** @nuxt/test-utils
- **DOM Environment:** happy-dom
- **Component Testing:** @vue/test-utils
- **E2E Test Runner:** Playwright 1.56.x
- **E2E Browser:** Chromium (Chrome)

---

**Last Updated:** October 2025  
**Functional Tests:** 19/19 ✅  
**E2E Tests:** 31/31 ✅  
**Total:** 50 tests
