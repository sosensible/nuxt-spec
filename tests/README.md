# Test Suite Documentation

This project uses **functional/behavioral testing** focused on regression testing without being tied to implementation details.

## Testing Philosophy

We test **what the application does**, not **how it does it**:

### ✅ DO TEST:

- User-visible behavior and content
- Rendered HTML output
- Public APIs (stores, composables)
- State changes that affect users
- Component visual output

### ❌ DON'T TEST:

- Internal component methods
- Private store implementation
- Vue ref/reactive internals
- CSS class names (unless critical for functionality)
- Implementation details that could change

## Test Structure

```
tests/
└── functional/
    ├── navigation.test.ts    # Page content and routing (4 tests)
    ├── layouts.test.ts        # Layout rendering (2 tests)
    ├── components.test.ts     # Component output (5 tests)
    └── stores.test.ts         # Store behavior (8 tests)
```

**Total: 19 functional tests**

## Running Tests

```bash
# Run all tests once (CI mode)
pnpm test

# Watch mode for development
pnpm test:watch

# Visual UI for debugging
pnpm test:ui

# With coverage report
pnpm test:coverage
```

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

- **Test Runner:** Vitest 3.x
- **Test Utils:** @nuxt/test-utils
- **DOM Environment:** happy-dom
- **Component Testing:** @vue/test-utils
- **E2E Capability:** Playwright (available but not currently used)

---

**Last Updated:** January 2025  
**Tests Passing:** 19/19 ✅  
**Maintainers:** Development Team
