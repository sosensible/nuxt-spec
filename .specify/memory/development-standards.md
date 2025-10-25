# Nuxt Spec Development Standards

**Version**: 1.0.0 | **Last Updated**: 2025-10-18

> This document defines mandatory development standards that complement the [Constitution](./constitution.md). All standards here are constitutional requirements and MUST be followed for every spec cycle.

## Table of Contents

1. [State Management Patterns](#1-state-management-patterns)
2. [Component Communication](#2-component-communication)
3. [Route-Based Data Loading](#3-route-based-data-loading)
4. [Accessibility Requirements](#4-accessibility-requirements)
5. [Configuration Management](#5-configuration-management)
6. [Naming Conventions](#6-naming-conventions)
7. [Component Complexity Limits](#7-component-complexity-limits)
8. [CSS & Styling Standards](#8-css--styling-standards)
9. [Error Handling Patterns](#9-error-handling-patterns)
10. [Documentation Requirements](#10-documentation-requirements)
11. [Dependency Management](#11-dependency-management)
12. [Feature Rollout Patterns](#12-feature-rollout-patterns)

---

## 1. State Management Patterns

### When to Use What

**Use Pinia Stores when**:

- State needs to be shared across multiple unrelated components
- State needs to persist across route changes
- State requires complex computed values or getters
- State mutations need to be tracked/logged

**Use Composables when**:

- State is feature-specific and localized
- Logic needs to be reused but state doesn't need persistence
- You need lifecycle-aware reactive state

**Use Props/Events when**:

- Parent-child communication is sufficient
- State is ephemeral (form inputs, toggles)
- Component is meant to be truly reusable/portable

### Store Access Pattern (MANDATORY)

```typescript
// ❌ WRONG - Direct store import in components
import { useLayoutStore } from "~/stores/layout";
const store = useLayoutStore();

// ✅ CORRECT - Composable wrapper
// composables/useLayoutState.ts
export function useLayoutState() {
  const store = useLayoutStore();
  return {
    sidebarCollapsed: computed(() => store.sidebarCollapsed),
    currentLayout: computed(() => store.currentLayout),
    toggleSidebar: store.toggleSidebar,
    setSidebarCollapsed: store.setSidebarCollapsed,
  };
}

// In component
const { sidebarCollapsed, toggleSidebar } = useLayoutState();
```

### Store Structure Standard

```typescript
// stores/example.ts
export const useExampleStore = defineStore("example", () => {
  // State - use ref() for primitives, reactive() for objects
  const items = ref<Item[]>([]);
  const loading = ref(false);
  const error = ref<Error | null>(null);

  // Getters - use computed()
  const activeItems = computed(() => items.value.filter((i) => i.active));
  const itemCount = computed(() => items.value.length);

  // Actions - regular functions
  async function loadItems() {
    loading.value = true;
    error.value = null;
    try {
      const data = await $fetch("/api/items");
      items.value = data;
    } catch (e) {
      error.value = e as Error;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function addItem(item: Item) {
    items.value.push(item);
  }

  function removeItem(id: string) {
    items.value = items.value.filter((i) => i.id !== id);
  }

  return {
    // State
    items: readonly(items),
    loading: readonly(loading),
    error: readonly(error),
    // Getters
    activeItems,
    itemCount,
    // Actions
    loadItems,
    addItem,
    removeItem,
  };
});
```

---

## 2. Component Communication

### Decision Tree

```
Is it parent-child relationship?
├─ Yes → Use props down, events up
└─ No → Is state needed across routes?
    ├─ Yes → Use Pinia store (via composable)
    └─ No → Use composable or provide/inject
```

### Props Standards

- **Maximum 10 props** per component (split if exceeded)
- **Use TypeScript interfaces** for complex prop types
- **Required props first**, optional props after
- **Provide defaults** for optional props
- **Use `withDefaults`** for cleaner syntax

```typescript
// ✅ CORRECT
interface Props {
  // Required props
  workspaceId: string;
  title: string;
  // Optional props with defaults
  collapsible?: boolean;
  icon?: string;
  variant?: "default" | "compact" | "minimal";
}

const props = withDefaults(defineProps<Props>(), {
  collapsible: false,
  icon: "heroicons:folder",
  variant: "default",
});
```

### Event Standards

- **Use kebab-case** for event names: `@workspace-selected`, not `@workspaceSelected`
- **Emit typed events** with clear payload interfaces
- **Prefix boolean toggle events** with verbs: `@sidebar-toggled`, `@panel-collapsed`
- **Use past tense** for completed actions: `@item-selected`, `@file-uploaded`

```typescript
// ✅ CORRECT
const emit = defineEmits<{
  "workspace-selected": [workspaceId: string];
  "sidebar-toggled": [collapsed: boolean];
  "item-deleted": [itemId: string];
  "form-submitted": [data: FormData];
}>();

// Usage
emit("workspace-selected", workspace.id);
emit("sidebar-toggled", true);
```

### Provide/Inject Pattern

Use for deeply nested component trees:

```typescript
// Parent component
const layoutContext = {
  theme: computed(() => theme.value),
  sidebarCollapsed: computed(() => collapsed.value),
  toggleSidebar: () => toggleSidebar(),
};
provide("layout", layoutContext);

// Child component (any level deep)
const layout = inject<LayoutContext>("layout");
if (!layout) throw new Error("Layout context not provided");
```

---

## 3. Route-Based Data Loading

### Loading Hierarchy (MANDATORY)

1. **Page Level**: Primary data using `useAsyncData`
2. **Layout Level**: Shared data (user, config) using `useAsyncData` with `getCachedData`
3. **Component Level**: Dynamic/user-triggered data using `useFetch` or manual fetch

### Page Data Pattern

```typescript
// pages/workspace/[id].vue
<script setup lang="ts">
const route = useRoute()
const workspaceId = computed(() => route.params.id as string)

// ✅ CORRECT - Page-level data loading with proper key
const { data: workspace, error, refresh, pending } = await useAsyncData(
  `workspace-${workspaceId.value}`,
  () => $fetch(`/api/workspaces/${workspaceId.value}`),
  {
    watch: [workspaceId],
    immediate: true
  }
)

// Handle errors at page level
if (error.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Workspace not found',
    message: `Could not find workspace with ID: ${workspaceId.value}`
  })
}
</script>
```

### Layout Data Pattern

```typescript
// layouts/default.vue
<script setup lang="ts">
// ✅ CORRECT - Layout-level shared data with caching
const { data: user } = await useAsyncData(
  'current-user',
  () => $fetch('/api/auth/me'),
  {
    getCachedData: (key) => useNuxtApp().static.data[key]
  }
)
</script>
```

### Component Dynamic Data Pattern

```typescript
// components/WorkspaceMembers.vue
<script setup lang="ts">
const props = defineProps<{ workspaceId: string }>()

// ✅ CORRECT - Component-level reactive data loading
const { data: members, refresh } = useFetch(
  () => `/api/workspaces/${props.workspaceId}/members`,
  {
    watch: [() => props.workspaceId]
  }
)

// Manual refetch on user action
async function inviteMember(email: string) {
  await $fetch(`/api/workspaces/${props.workspaceId}/members`, {
    method: 'POST',
    body: { email }
  })
  await refresh() // Refresh the list
}
</script>
```

### Loading States (MANDATORY)

Every data fetch MUST handle three states:

```vue
<template>
  <!-- Loading state -->
  <div v-if="pending" class="animate-pulse">
    <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div class="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>

  <!-- Error state -->
  <UAlert
    v-else-if="error"
    color="red"
    variant="subtle"
    title="Failed to load data"
    :description="error.message"
  >
    <template #actions>
      <UButton @click="refresh" label="Retry" />
    </template>
  </UAlert>

  <!-- Success state -->
  <div v-else-if="data">
    <!-- Render data -->
  </div>
</template>
```

---

## 4. Accessibility Requirements

### WCAG 2.1 AA Compliance (MANDATORY)

All features MUST meet WCAG 2.1 Level AA standards.

### Semantic HTML (MANDATORY)

```vue
<!-- ✅ CORRECT - Semantic HTML -->
<nav aria-label="Main navigation">
  <ul role="list">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main id="main-content">
  <h1>Page Title</h1>
  <article>
    <h2>Section Title</h2>
    <p>Content...</p>
  </article>
</main>

<aside aria-label="Sidebar navigation">
  <!-- Sidebar content -->
</aside>

<footer>
  <!-- Footer content -->
</footer>

<!-- ❌ WRONG - Div soup -->
<div class="nav">
  <div @click="navigate">Home</div>
  <div @click="navigate">About</div>
</div>

<div class="content">
  <div class="title">Page Title</div>
</div>
```

### Interactive Elements

```vue
<!-- ✅ CORRECT - Accessible buttons -->
<button type="button" aria-label="Close dialog">
  <UIcon name="heroicons:x-mark" />
</button>

<button type="button" aria-expanded="false" aria-controls="menu">
  Menu
</button>

<!-- ✅ CORRECT - Form accessibility -->
<form @submit.prevent="handleSubmit">
  <label for="email">Email Address</label>
  <input 
    id="email" 
    v-model="email"
    type="email" 
    required
    aria-required="true"
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert" v-if="emailError">
    {{ emailError }}
  </span>
</form>

<!-- ❌ WRONG - Inaccessible -->
<div @click="close">
  <UIcon name="heroicons:x-mark" />
</div>
```

### Keyboard Navigation (MANDATORY)

All interactive elements MUST be keyboard accessible:

```typescript
// ✅ CORRECT - Full keyboard support
function handleKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case "Enter":
    case " ": // Space
      event.preventDefault();
      toggleSidebar();
      break;
    case "Escape":
      closeSidebar();
      break;
    case "Tab":
      // Let natural tab behavior work
      break;
  }
}
```

### Focus Management

```vue
<script setup lang="ts">
// ✅ CORRECT - Focus trap in modal
const modalRef = ref<HTMLElement>();
const firstFocusable = ref<HTMLElement>();
const lastFocusable = ref<HTMLElement>();

onMounted(() => {
  // Get all focusable elements
  const focusable = modalRef.value?.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  if (focusable && focusable.length > 0) {
    firstFocusable.value = focusable[0] as HTMLElement;
    lastFocusable.value = focusable[focusable.length - 1] as HTMLElement;
    firstFocusable.value?.focus();
  }
});

function trapFocus(event: KeyboardEvent) {
  if (event.key !== "Tab") return;

  if (event.shiftKey && document.activeElement === firstFocusable.value) {
    event.preventDefault();
    lastFocusable.value?.focus();
  } else if (
    !event.shiftKey &&
    document.activeElement === lastFocusable.value
  ) {
    event.preventDefault();
    firstFocusable.value?.focus();
  }
}
</script>

<template>
  <div ref="modalRef" @keydown="trapFocus" role="dialog" aria-modal="true">
    <!-- Modal content -->
  </div>
</template>
```

### Screen Reader Support

```vue
<!-- ✅ CORRECT - Screen reader announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only">
  {{ statusMessage }}
</div>

<!-- Loading indicator -->
<div v-if="loading" role="status" aria-live="polite">
  <span class="sr-only">Loading...</span>
  <UIcon name="heroicons:arrow-path" class="animate-spin" />
</div>

<!-- Dynamic content updates -->
<div aria-live="assertive" role="alert" v-if="errorMessage">
  {{ errorMessage }}
</div>
```

### Testing Requirements

- **Automated**: MUST pass axe-core accessibility tests (run in E2E tests)
- **Keyboard**: MUST be manually tested with keyboard only (no mouse)
- **Screen Reader**: SHOULD be tested with NVDA (Windows) or VoiceOver (Mac)
- **Color Contrast**: MUST meet 4.5:1 ratio for normal text, 3:1 for large text

---

## 5. Configuration Management

### Configuration Structure

```typescript
// types/config.ts
export interface AppConfig {
  name: string;
  version: string;
  theme: {
    mode: "light" | "dark" | "system";
    primary: string;
    secondary: string;
  };
  features: {
    analytics: boolean;
    aiAssistant: boolean;
    collaboration: boolean;
  };
  limits: {
    maxWorkspaces: number;
    maxFileSize: number;
    maxMembers: number;
  };
}

// app.config.ts
export default defineAppConfig({
  name: "Nuxt Spec",
  version: "1.0.0",
  theme: {
    mode: "system",
    primary: "#3B82F6",
    secondary: "#6366F1",
  },
  features: {
    analytics: true,
    aiAssistant: false,
    collaboration: true,
  },
  limits: {
    maxWorkspaces: 10,
    maxFileSize: 10485760, // 10MB
    maxMembers: 50,
  },
});
```

### Runtime Configuration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    // Server-only (private)
    databaseUrl: process.env.DATABASE_URL,
    apiSecret: process.env.API_SECRET,

    // Public (exposed to client)
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api",
      features: {
        newUI: process.env.FEATURE_NEW_UI === "true",
        betaFeatures: process.env.FEATURE_BETA === "true",
      },
    },
  },
});

// Usage in component
const config = useRuntimeConfig();
const apiUrl = `${config.public.apiBase}/workspaces`;

// Usage in server route
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const dbUrl = config.databaseUrl; // Server-only, not exposed
});
```

### Validation Pattern

```typescript
// composables/useConfig.ts
import { z } from "zod";

const WorkspaceConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]),
    sidebarCollapsed: z.boolean(),
    defaultView: z.enum(["list", "grid"]),
  }),
});

export function useWorkspaceConfig(workspaceId: string) {
  const config = ref<WorkspaceConfig>(getDefaultConfig(workspaceId));

  // Validation
  function validateConfig(c: unknown): c is WorkspaceConfig {
    try {
      WorkspaceConfigSchema.parse(c);
      return true;
    } catch (error) {
      console.error("Invalid configuration:", error);
      return false;
    }
  }

  // Load with validation
  async function loadConfig() {
    const data = await $fetch(`/api/workspaces/${workspaceId}/config`);
    if (validateConfig(data)) {
      config.value = data;
    } else {
      throw new Error("Invalid configuration received from server");
    }
  }

  // Save with validation
  async function saveConfig() {
    if (!validateConfig(config.value)) {
      throw new Error("Cannot save invalid configuration");
    }
    await $fetch(`/api/workspaces/${workspaceId}/config`, {
      method: "PUT",
      body: config.value,
    });
  }

  return { config, loadConfig, saveConfig };
}
```

---

## 6. Naming Conventions

### File Naming

| Type        | Convention                     | Example                                       |
| ----------- | ------------------------------ | --------------------------------------------- |
| Components  | PascalCase.vue                 | `WorkspaceCard.vue`, `AdminSidebar.vue`       |
| Composables | camelCase.ts with `use` prefix | `useWorkspace.ts`, `useLayoutState.ts`        |
| Stores      | camelCase.ts                   | `layout.ts`, `navigation.ts`                  |
| Pages       | kebab-case.vue or [...].vue    | `index.vue`, `[id].vue`, `admin-settings.vue` |
| Layouts     | kebab-case.vue                 | `default.vue`, `admin.vue`                    |
| API Routes  | kebab-case.[method].ts         | `workspaces.get.ts`, `[id].put.ts`            |
| Types       | PascalCase.ts                  | `Workspace.ts`, `User.ts`                     |
| Utils       | camelCase.ts                   | `formatDate.ts`, `validateEmail.ts`           |
| Middleware  | kebab-case.ts                  | `auth.ts`, `admin-only.ts`                    |

### Variable Naming

```typescript
// Components: PascalCase
const WorkspaceCard = defineComponent({})
const AdminHeader = defineComponent({})

// Composables: camelCase with 'use' prefix
const useWorkspace = () => {}
const useLayoutState = () => {}

// Stores: camelCase (or use[Name]Store pattern)
const useLayoutStore = defineStore('layout', {})
const useNavigationStore = defineStore('navigation', {})

// Constants: SCREAMING_SNAKE_CASE
const MAX_WORKSPACES = 10
const API_TIMEOUT = 5000
const DEFAULT_PAGE_SIZE = 20

// Types/Interfaces: PascalCase
interface WorkspaceConfig {}
type NavigationItem = {}

// Boolean variables: isX, hasX, canX, shouldX
const isActive = ref(true)
const hasPermission = computed(() => user.value?.role === 'admin')
const canEdit = computed(() => isOwner.value || hasPermission.value)
const shouldShowWelcome = ref(false)

// Arrays: plural nouns
const workspaces = ref<Workspace[]>([])
const users = ref<User[]>([])
const items = computed(() => [...])

// Single objects: singular nouns
const workspace = ref<Workspace>()
const currentUser = ref<User>()
```

### Function Naming

```typescript
// Event handlers: handle[Action] or on[Event]
function handleSubmit() {}
function handleWorkspaceSelect(id: string) {}
function onSidebarToggle() {}

// Async functions: use async/await, name describes action
async function loadWorkspace(id: string) {}
async function saveSettings() {}
async function deleteItem(id: string) {}

// Boolean returns: isX, hasX, canX, shouldX
function isValidEmail(email: string): boolean {}
function hasPermission(user: User, action: string): boolean {}
function canEditWorkspace(workspace: Workspace): boolean {}

// Get/Set pairs
function getWorkspace(id: string): Workspace {}
function setWorkspace(workspace: Workspace): void {}

// Transform functions: describe transformation
function formatDate(date: Date): string {}
function parseWorkspaceData(data: unknown): Workspace {}
function mapUserToProfile(user: User): UserProfile {}
```

---

## 7. Component Complexity Limits

### Hard Limits (MANDATORY)

- **Maximum 300 lines** per component (template + script + style combined)
- **Maximum 10 props** per component
- **Maximum 5 event emitters** per component
- **Maximum 3 levels** of nested template logic (`v-if` inside `v-for` inside `v-if`)
- **Maximum 5 composables** used per component
- **Maximum 50 lines** per function/method

### When to Split Components

Split when ANY of these conditions are met:

1. Component exceeds 300 lines
2. Template has more than 3 levels of nesting
3. More than 10 props are needed
4. Component has multiple distinct responsibilities
5. Logic block exceeds 50 lines
6. Template logic is duplicated

### Component Composition Pattern

```typescript
// ✅ CORRECT - Focused component with composables
<script setup lang="ts">
// Each composable handles one concern
const { workspace, loadWorkspace, saveWorkspace } = useWorkspace()
const { permissions, checkPermission } = usePermissions()
const { collapsed, toggleSidebar } = useLayoutState()

// Minimal component-specific logic
const canEdit = computed(() => checkPermission('edit'))

const handleSave = async () => {
  if (!canEdit.value) return
  await saveWorkspace(workspace.value)
}
</script>

<template>
  <!-- Simple, focused template -->
  <div class="workspace-editor">
    <WorkspaceHeader :workspace="workspace" />
    <WorkspaceForm
      v-if="canEdit"
      :workspace="workspace"
      @save="handleSave"
    />
    <WorkspacePreview v-else :workspace="workspace" />
  </div>
</template>
```

### Splitting Example

```typescript
// ❌ WRONG - Monolithic component
<template>
  <div class="workspace">
    <header>
      <div class="logo">...</div>
      <nav>...</nav>
      <div class="user-menu">...</div>
    </header>
    <aside>
      <div class="sidebar-header">...</div>
      <nav class="sidebar-nav">...</nav>
      <div class="sidebar-footer">...</div>
    </aside>
    <main>
      <div class="toolbar">...</div>
      <div class="content">...</div>
      <div class="status-bar">...</div>
    </main>
  </div>
</template>

// ✅ CORRECT - Split into focused components
<template>
  <div class="workspace">
    <WorkspaceHeader
      :user="currentUser"
      @navigate="handleNavigate"
    />
    <WorkspaceSidebar
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />
    <WorkspaceMain
      :content="activeContent"
      @action="handleAction"
    />
  </div>
</template>
```

---

## 8. CSS & Styling Standards

### Tailwind-First Approach (MANDATORY)

```vue
<!-- ✅ CORRECT - Tailwind utilities -->
<div
  class="flex items-center justify-between gap-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
>
  <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
    Workspace Settings
  </h2>
  <UButton 
    icon="heroicons:cog" 
    variant="ghost"
    @click="openSettings"
  />
</div>

<!-- ❌ WRONG - Custom CSS classes -->
<div class="custom-card">
  <h2 class="custom-title">Workspace Settings</h2>
  <button class="custom-button">Settings</button>
</div>

<style scoped>
.custom-card {
  display: flex;
  padding: 1.5rem;
  background: white;
  border-radius: 0.5rem;
}
</style>
```

### When Custom CSS is Allowed

Custom CSS is ONLY permitted when:

1. **Complex animations** not achievable with Tailwind
2. **Global utility classes** for the entire project
3. **Third-party component overrides** that can't be configured

Custom CSS MUST:

- Be documented with reason for use
- Be placed in `assets/css/` directory
- Use BEM naming if using classes: `block__element--modifier`

```css
/* assets/css/animations.css */

/* Allowed: Complex keyframe animation */
@keyframes slide-in-with-fade {
  0% {
    opacity: 0;
    transform: translateX(-100%) scale(0.9);
  }
  100% {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.slide-in-animation {
  animation: slide-in-with-fade 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Allowed: Global utility for print */
@media print {
  .print-hidden {
    display: none !important;
  }
}
```

### Responsive Design (MANDATORY)

- **Mobile-first**: Start with mobile styles, add `md:`, `lg:`, `xl:` for larger screens
- **Standard breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- **Test on three sizes**: Mobile (375px), Tablet (768px), Desktop (1920px)

```vue
<!-- ✅ CORRECT - Mobile-first responsive -->
<div
  class="
  flex flex-col gap-2 p-4
  md:flex-row md:gap-4 md:p-6
  lg:gap-6 lg:p-8
  xl:max-w-7xl xl:mx-auto
"
>
  <aside class="w-full md:w-64 lg:w-80">
    <Sidebar />
  </aside>
  <main class="flex-1 min-w-0">
    <Content />
  </main>
</div>
```

### Dark Mode (MANDATORY)

All components MUST support dark mode:

```vue
<template>
  <div class="bg-white dark:bg-gray-900">
    <h1 class="text-gray-900 dark:text-white">Title</h1>
    <p class="text-gray-600 dark:text-gray-400">Description</p>
    <button
      class="
      bg-blue-500 hover:bg-blue-600 
      dark:bg-blue-600 dark:hover:bg-blue-700
      text-white
    "
    >
      Action
    </button>
  </div>
</template>
```

### Spacing System

Use Tailwind's 8px-based spacing scale:

```vue
<!-- Consistent spacing: 4px increments (0.5, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32) -->
<div class="space-y-4">  <!-- 16px vertical spacing -->
  <div class="p-6">      <!-- 24px padding -->
    <div class="mb-2">   <!-- 8px margin bottom -->
      <span class="mr-1"><!-- 4px margin right -->
```

---

## 9. Error Handling Patterns

### Client-Side Error Handling

```typescript
// ✅ CORRECT - Comprehensive error handling
async function loadWorkspace(id: string) {
  const loading = ref(true);
  const error = ref<Error | null>(null);

  try {
    const data = await $fetch(`/api/workspaces/${id}`);
    return data;
  } catch (e) {
    error.value = e as Error;

    // Log to console for debugging
    console.error("Failed to load workspace:", e);

    // Show user-friendly toast notification
    const toast = useToast();
    toast.add({
      title: "Failed to load workspace",
      description: "Please try again or contact support",
      color: "red",
      timeout: 5000,
    });

    // Optionally rethrow for parent handling
    throw e;
  } finally {
    loading.value = false;
  }
}
```

### Server-Side Error Handling

```typescript
// server/api/workspaces/[id].get.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // Validation
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Bad Request",
      message: "Workspace ID is required",
    });
  }

  try {
    // Business logic
    const workspace = await db.workspace.findUnique({
      where: { id },
    });

    if (!workspace) {
      throw createError({
        statusCode: 404,
        statusMessage: "Not Found",
        message: "Workspace not found",
      });
    }

    // Authorization check
    const user = event.context.user;
    if (!canAccessWorkspace(user, workspace)) {
      throw createError({
        statusCode: 403,
        statusMessage: "Forbidden",
        message: "You do not have permission to access this workspace",
      });
    }

    return workspace;
  } catch (error) {
    // Log detailed error server-side
    console.error("Database error:", error);

    // Don't expose internal errors to client
    if (!isH3Error(error)) {
      throw createError({
        statusCode: 500,
        statusMessage: "Internal Server Error",
        message: "Failed to load workspace",
      });
    }

    throw error;
  }
});
```

### Error Boundaries

```vue
<!-- layouts/default.vue -->
<template>
  <NuxtErrorBoundary>
    <NuxtPage />

    <template #error="{ error, clearError }">
      <div class="min-h-screen flex items-center justify-center p-8">
        <UCard class="max-w-md">
          <template #header>
            <h2 class="text-xl font-bold text-red-600">Something went wrong</h2>
          </template>

          <p class="text-gray-600 dark:text-gray-400 mb-4">
            {{ error.message }}
          </p>

          <UButton label="Try Again" @click="clearError()" block />
        </UCard>
      </div>
    </template>
  </NuxtErrorBoundary>
</template>
```

### Validation Errors

```typescript
// composables/useFormValidation.ts
export function useFormValidation<T>(schema: ZodSchema<T>) {
  const errors = ref<Record<string, string>>({});

  function validate(data: unknown): data is T {
    errors.value = {};

    try {
      schema.parse(data);
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        error.errors.forEach((err) => {
          const field = err.path.join(".");
          errors.value[field] = err.message;
        });
      }
      return false;
    }
  }

  function clearError(field: string) {
    delete errors.value[field];
  }

  function clearAllErrors() {
    errors.value = {};
  }

  return { errors: readonly(errors), validate, clearError, clearAllErrors };
}
```

---

## 10. Documentation Requirements

### Component Documentation (MANDATORY)

````vue
<script setup lang="ts">
/**
 * WorkspaceCard - Displays a workspace with title, description, and actions
 *
 * @component
 * @example
 * ```vue
 * <WorkspaceCard
 *   :workspace="workspace"
 *   :selected="isSelected"
 *   @select="handleSelect"
 *   @delete="handleDelete"
 * />
 * ```
 */

interface Props {
  /** The workspace object to display */
  workspace: Workspace;
  /** Whether this workspace is currently selected */
  selected?: boolean;
  /** Show delete action button */
  showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
  showDelete: true,
});

/**
 * Emitted when workspace is selected
 * @event select
 * @param {string} workspaceId - The ID of the selected workspace
 */
const emit = defineEmits<{
  select: [workspaceId: string];
  delete: [workspaceId: string];
}>();
</script>
````

### Composable Documentation

````typescript
/**
 * useWorkspace - Manages workspace state and operations
 *
 * Provides reactive access to current workspace, workspace list,
 * and workspace-related operations like create, update, delete.
 *
 * @composable
 * @example
 * ```ts
 * const {
 *   currentWorkspace,
 *   workspaces,
 *   loadWorkspace,
 *   createWorkspace
 * } = useWorkspace()
 *
 * await loadWorkspace('workspace-id')
 * console.log(currentWorkspace.value)
 * ```
 *
 * @returns {UseWorkspaceReturn} Workspace state and operations
 */
export function useWorkspace() {
  const store = useWorkspaceStore();

  /**
   * Loads a workspace by ID
   * @param {string} id - Workspace UUID
   * @throws {Error} If workspace not found or user lacks permission
   */
  async function loadWorkspace(id: string) {
    // ...
  }

  return {
    currentWorkspace: computed(() => store.currentWorkspace),
    workspaces: computed(() => store.workspaces),
    loadWorkspace,
    // ...
  };
}
````

### API Route Documentation

````typescript
/**
 * GET /api/workspaces/[id]
 *
 * Retrieves a workspace by ID with full details including
 * members, settings, and recent activity.
 *
 * @route
 * @param {string} id - Workspace UUID
 * @returns {Workspace} Workspace object with relations
 * @throws {400} If ID is missing or invalid
 * @throws {404} If workspace not found
 * @throws {403} If user lacks permission to access workspace
 *
 * @example
 * ```ts
 * const workspace = await $fetch('/api/workspaces/123e4567-e89b-12d3-a456-426614174000')
 * ```
 */
export default defineEventHandler(async (event) => {
  // ...
});
````

### README Requirements

When adding a feature, UPDATE the README with:

````markdown
## Features

- ✅ Dual Layout System (Frontend & Admin)
  - Frontend layout with header, navigation, and footer
  - Admin layout with collapsible sidebar
  - Responsive design across all breakpoints
- 🆕 Workspace Management (NEW)
  - Create, read, update, delete workspaces
  - Multi-user collaboration
  - Role-based permissions

## Architecture

### New Components

- `WorkspaceCard.vue` - Displays workspace summary
- `WorkspaceEditor.vue` - Full workspace editing interface
- `WorkspaceMembers.vue` - Member management

### New API Routes

- `GET /api/workspaces` - List all workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/[id]` - Get workspace details
- `PUT /api/workspaces/[id]` - Update workspace
- `DELETE /api/workspaces/[id]` - Delete workspace

### Environment Variables

```env
# Workspace Settings
WORKSPACE_MAX_SIZE=100  # Maximum workspace size in MB
WORKSPACE_MAX_MEMBERS=50  # Maximum members per workspace
```
````

````

---

## 11. Dependency Management

### Approval Process

New dependencies MUST be approved if they:

- Add > 100KB to bundle size
- Duplicate existing functionality
- Have known security vulnerabilities (check `npm audit`)
 - Have known security vulnerabilities (perform a vulnerability scan)
- Lack TypeScript definitions
- Haven't been updated in 2+ years
- Have < 10k weekly downloads (indicates low adoption)

### Version Management Strategy

```json
// package.json
{
  "dependencies": {
    "nuxt": "^4.0.0",              // ✅ Caret: Allow minor/patch updates
    "@nuxt/ui": "4.0.0",            // ✅ Exact: Lock major version during transition
    "vue": "~3.4.0",                // ✅ Tilde: Allow patch updates only
    "pinia": "^2.1.0"               // ✅ Caret: Safe for stable libraries
  },
  "devDependencies": {
    "typescript": "^5.3.0",         // ✅ Caret: Dev tools can be more flexible
    "vitest": "^1.0.0",
    "playwright": "^1.40.0"
  }
}
````

### Update Schedule

- **Security updates**: Immediate (same day)
- **Patch updates**: Weekly review and update
- **Minor updates**: Monthly review, test in staging
- **Major updates**: Quarterly review, require migration plan

### Vulnerability scanning process

```bash
# Run weekly vulnerability scans (run a vulnerability scanner such as `pnpm audit`)
# Address vulnerabilities by severity:
# CRITICAL/HIGH: Fix within 24 hours
# MODERATE: Fix within 1 week
# LOW: Fix within 1 month

# If no fix available, document risk in SECURITY.md and add to exceptions
```

### Pre-Installation Checklist

Before adding a new package:

- [ ] Check bundle size impact: `npx bundlephobia <package-name>`
- [ ] Verify TypeScript support: Check for `@types/` or native types
- [ ] Review security: Check Snyk or GitHub Security Advisory
- [ ] Confirm maintenance: Last publish date, open issues, GitHub activity
- [ ] Evaluate alternatives: Is there a Nuxt-native solution?
- [ ] Check license compatibility: MIT, Apache 2.0, ISC preferred

---

## 12. Feature Rollout Patterns

### Feature Flags

Use runtime config for feature toggles:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      features: {
        // Feature flags from environment
        newWorkspaceUI: process.env.FEATURE_NEW_WORKSPACE_UI === 'true',
        aiAssistant: process.env.FEATURE_AI_ASSISTANT === 'true',
        collaboration: process.env.FEATURE_COLLABORATION === 'true',
        betaFeatures: process.env.FEATURE_BETA === 'true'
      }
    }
  }
})

// composables/useFeatureFlags.ts
export function useFeatureFlags() {
  const config = useRuntimeConfig()
  const features = config.public.features

  function isEnabled(feature: keyof typeof features): boolean {
    return features[feature] === true
  }

  return { features, isEnabled }
}

// In component
<script setup lang="ts">
const { isEnabled } = useFeatureFlags()
const showNewUI = isEnabled('newWorkspaceUI')
</script>

<template>
  <WorkspaceCardNew v-if="showNewUI" />
  <WorkspaceCardOld v-else />
</template>
```

### Progressive Enhancement

Build features to work without JavaScript:

```vue
<template>
  <!-- Works without JS - form submits to server -->
  <form method="POST" action="/api/workspace/create">
    <input name="name" required placeholder="Workspace Name" />
    <input name="description" placeholder="Description" />
    <button type="submit">Create Workspace</button>
  </form>

  <!-- Enhanced with JS - prevents reload, shows loading state -->
  <form v-if="jsEnabled" @submit.prevent="handleSubmit">
    <UInput v-model="name" placeholder="Workspace Name" />
    <UTextarea v-model="description" placeholder="Description" />
    <UButton type="submit" :loading="submitting" label="Create Workspace" />
  </form>
</template>

<script setup lang="ts">
const jsEnabled = ref(false);

onMounted(() => {
  jsEnabled.value = true;
});
</script>
```

### Gradual Rollout Strategy

1. **Development**: Feature flag OFF by default
2. **Staging**: Feature flag ON for testing
3. **Production (10%)**: Enable for 10% of users via A/B test
4. **Production (50%)**: Expand to 50% if metrics good
5. **Production (100%)**: Full rollout
6. **Cleanup**: Remove feature flag after 2 weeks stable

### Deprecation Process

When deprecating a feature:

```typescript
/**
 * @deprecated Use `useWorkspace()` instead.
 * This function will be removed in v2.0.0
 *
 * @see useWorkspace
 */
export function getWorkspace(id: string) {
  console.warn(
    "getWorkspace() is deprecated and will be removed in v2.0.0. " +
      "Use useWorkspace() instead."
  );
  const { loadWorkspace } = useWorkspace();
  return loadWorkspace(id);
}
```

**Deprecation Timeline**:

1. Mark as deprecated with warning (v1.5.0)
2. Update documentation with migration guide
3. Maintain for 2 minor versions (v1.5.0, v1.6.0)
4. Remove in next major version (v2.0.0)

### A/B Testing Pattern

```typescript
// composables/useABTest.ts
export function useABTest(testName: string, variants: string[]) {
  const userId = useCookie("user-id");

  // Deterministic variant assignment based on user ID
  const variantIndex = hashCode(userId.value + testName) % variants.length;
  const variant = variants[variantIndex];

  // Track exposure
  onMounted(() => {
    $fetch("/api/analytics/ab-test", {
      method: "POST",
      body: { testName, variant, userId: userId.value },
    });
  });

  return { variant };
}

// In component
const { variant } = useABTest("workspace-card-redesign", [
  "control",
  "variant-a",
  "variant-b",
]);
```

---

## Enforcement

These standards are enforced through:

1. **ESLint/Prettier**: Automated code style enforcement
2. **TypeScript**: Type safety and interface compliance
3. **Pre-commit hooks**: Run linters and formatters before commit
4. **PR Reviews**: Manual verification of standards compliance
5. **Automated Tests**: Unit/E2E tests validate behavior
6. **CI/CD Pipeline**: Build and test on every PR
7. **Constitutional Requirement**: Non-compliance blocks merge

### Verification Checklist

Before merging any PR, verify:

- [ ] All new components have JSDoc documentation
- [ ] All props and events are typed
- [ ] Accessibility requirements met (semantic HTML, ARIA labels, keyboard nav)
- [ ] Responsive design tested at 3 breakpoints
- [ ] Dark mode support included
- [ ] Error handling for all async operations
- [ ] Loading/error/success states implemented
- [ ] Tests written BEFORE implementation (TDD)
- [ ] No ESLint or TypeScript errors
- [ ] Bundle size impact assessed
- [ ] README updated if needed

---

## Version History

- **1.0.0** (2025-10-18): Initial standards extracted from spec 001-layout-based-we

---

_This document is part of the Nuxt Spec Constitution and must be followed for all development._
