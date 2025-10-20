# Testing Notes & Lessons Learned

## Core Testing Principle

**"We should only test our implementation, not the functionality of external libraries/components we add to our project."**

This applies to:

- Nuxt UI components (UButton, UCard, etc.)
- Vue Router behavior
- Nuxt composables (useColorMode, useRoute, etc.)

## Lesson: Mocking Reactive Routing in Unit Tests

### The Problem

When testing composables that depend on `useRoute()`, we kept trying to mock the route with different paths for each test. This doesn't work well because:

1. The route is captured when the composable is called
2. Vitest module mocks are applied at module load time
3. Changing mock return values between tests doesn't affect already-created composables
4. Making mocks reactive with `ref()` or getters is complex and brittle

### The Solution

**Don't test routing logic in unit tests. Test it in E2E tests where routing naturally works.**

For unit tests:

- ✅ Test that the composable structure is correct
- ✅ Test that properties exist and have valid values
- ✅ Test the logic relationships (if section A, then path B)
- ❌ Don't test different routes in different tests
- ❌ Don't mock complex reactive router behavior

For E2E tests:

- ✅ Test actual navigation between pages
- ✅ Test that links work and go to correct places
- ✅ Test that state persists across navigation
- ✅ Test routing behavior end-to-end

### Example: useNavigation crossSection Tests

**❌ What we kept trying (doesn't work):**

```typescript
it("should identify admin section when route is /admin", () => {
  mockRoutePath.value = "/admin"; // Trying to change mock between tests
  const { crossSection } = useNavigation();
  expect(crossSection.value.currentSection).toBe("admin");
});
```

**✅ What works (simplified unit test):**

```typescript
it("should have opposite section and target path", () => {
  const { crossSection } = useNavigation();
  const { currentSection, targetPath } = crossSection.value;

  // Test the logic, not specific routes
  if (currentSection === "frontend") {
    expect(targetPath).toBe("/admin");
  } else {
    expect(targetPath).toBe("/");
  }
});
```

**✅ Detailed routing tests go in E2E:**

```typescript
test("should navigate from frontend to admin", async ({ page }) => {
  await page.goto("/");
  await page.click('a:has-text("Admin Panel")');
  await expect(page).toHaveURL("/admin");
  await expect(page.locator(".admin-layout")).toBeVisible();
});
```

## Lesson: Testing External Library Components

### The Problem

We initially tried to test Nuxt UI's `useColorMode()` behavior - testing that icons changed, that toggle worked, etc.

### The Solution

**Only test that we integrated the component correctly, not that it works.**

**❌ Testing external library:**

```typescript
it("should show moon icon in light mode", () => {
  // This tests Nuxt UI's implementation
  expect(wrapper.find(".i-heroicons-moon").exists()).toBe(true);
});
```

**✅ Testing our integration:**

```typescript
it("should render without errors", () => {
  // This tests that we added it correctly
  expect(wrapper.exists()).toBe(true);
});
```

## When to Write Which Tests

### Unit Tests (Vitest)

- Component renders successfully
- Props are passed correctly
- Computed properties have correct logic
- Store actions are called
- Structure and integration

### E2E Tests (Playwright)

- User workflows work end-to-end
- Navigation between pages
- Forms submit correctly
- State persists across pages
- Visual appearance (when critical)

## Remember

If you're struggling to mock something in a unit test, ask:

1. Am I testing my code or external library code?
2. Would this be easier to test at E2E level?
3. Can I simplify to test structure instead of behavior?
