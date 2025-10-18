# Quickstart: Dual Layout System Implementation

**Date**: October 14, 2025  
**Feature**: 001-layout-based-we  
**Phase**: 1 - Implementation Guide

## Prerequisites

- Node.js 18+ with pnpm package manager
- Nuxt 4 project initialized
- Basic understanding of Vue 3 Composition API
- Familiarity with Tailwind CSS utility classes

## 1. Dependencies Installation

```bash
# Install required dependencies
pnpm add @nuxt/ui@next @pinia/nuxt
pnpm add -D @nuxt/test-utils playwright vitest

# Install TypeScript types
pnpm add -D @types/node
```

## 2. Nuxt Configuration

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@pinia/nuxt"],
  css: ["~/assets/css/main.css"],
  ssr: true, // Default SSR, override per route as needed
  typescript: {
    strict: true,
    typeCheck: true,
  },
  nitro: {
    experimental: {
      wasm: true,
    },
  },
});
```

## 3. Base Styling Setup

Create `assets/css/main.css`:

```css
/* Base design system styles */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom CSS variables for design system */
:root {
  --color-primary: #3b82f6;
  --color-secondary: #64748b;
  --sidebar-width: 280px;
  --sidebar-collapsed-width: 60px;
  --header-height: 64px;
}

/* Frontend layout specific styles */
.layout-frontend {
  @apply min-h-screen flex flex-col;
}

/* Admin layout specific styles */
.layout-admin {
  @apply min-h-screen flex;
}

.admin-sidebar {
  width: var(--sidebar-width);
  transition: width 0.3s ease;
}

.admin-sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

.admin-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s ease;
}

.admin-content.sidebar-collapsed {
  margin-left: var(--sidebar-collapsed-width);
}
```

## 4. Type Definitions

Create `types/layout.ts`:

```typescript
export interface LayoutConfig {
  name: "frontend" | "admin";
  renderMode: "ssr" | "csr";
  hasHeader: boolean;
  hasFooter: boolean;
  hasSidebar: boolean;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: string;
  active?: boolean;
  external?: boolean;
}

export interface ResponsiveBreakpoint {
  name: "mobile" | "tablet" | "desktop";
  minWidth: number;
  maxWidth?: number;
}

export interface HeaderConfig {
  layoutContext: "frontend" | "admin";
  navigationItems: NavigationItem[];
  showBranding: boolean;
  userActions?: NavigationItem[];
}
```

Create `types/admin.ts`:

```typescript
export interface AdminSidebarState {
  isCollapsed: boolean;
  activeSection?: string;
  navigationItems: AdminNavigationItem[];
}

export interface AdminNavigationItem extends NavigationItem {
  section?: string;
  children?: AdminNavigationItem[];
  permission?: string;
}

export interface AdminLayoutState {
  sidebarState: AdminSidebarState;
  currentSection: string;
  breadcrumbs: NavigationItem[];
}
```

## 5. Pinia Stores

Create `stores/layout.ts`:

```typescript
export const useLayoutStore = defineStore("layout", () => {
  // State
  const currentLayout = ref<"frontend" | "admin">("frontend");
  const sidebarCollapsed = ref(false);
  const mobileMenuOpen = ref(false);

  // Actions
  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    sidebarCollapsed.value = collapsed;
  };

  const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value;
  };

  const setCurrentLayout = (layout: "frontend" | "admin") => {
    currentLayout.value = layout;
  };

  // Getters
  const isAdminLayout = computed(() => currentLayout.value === "admin");
  const isFrontendLayout = computed(() => currentLayout.value === "frontend");
  const sidebarState = computed(() =>
    sidebarCollapsed.value ? "collapsed" : "expanded"
  );

  return {
    // State
    currentLayout,
    sidebarCollapsed,
    mobileMenuOpen,
    // Actions
    toggleSidebar,
    setSidebarCollapsed,
    toggleMobileMenu,
    setCurrentLayout,
    // Getters
    isAdminLayout,
    isFrontendLayout,
    sidebarState,
  };
});
```

Create `stores/navigation.ts`:

```typescript
export const useNavigationStore = defineStore("navigation", () => {
  // State
  const currentRoute = ref("");
  const breadcrumbs = ref<NavigationItem[]>([]);

  const frontendNavigation = ref<NavigationItem[]>([
    { label: "Home", path: "/", icon: "i-heroicons-home" },
    { label: "Info", path: "/info", icon: "i-heroicons-information-circle" },
  ]);

  const adminNavigation = ref<AdminNavigationItem[]>([
    { label: "Dashboard", path: "/admin", icon: "i-heroicons-squares-2x2" },
    {
      label: "Settings",
      path: "/admin/settings",
      icon: "i-heroicons-cog-6-tooth",
    },
  ]);

  // Actions
  const setCurrentRoute = (route: string) => {
    currentRoute.value = route;
    updateActiveStates();
  };

  const updateBreadcrumbs = (items: NavigationItem[]) => {
    breadcrumbs.value = items;
  };

  const updateActiveStates = () => {
    // Update frontend navigation
    frontendNavigation.value.forEach((item) => {
      item.active = item.path === currentRoute.value;
    });

    // Update admin navigation
    adminNavigation.value.forEach((item) => {
      item.active = item.path === currentRoute.value;
    });
  };

  // Getters
  const activeNavigationItem = computed(() => {
    const layoutStore = useLayoutStore();
    const navigation = layoutStore.isAdminLayout
      ? adminNavigation.value
      : frontendNavigation.value;
    return navigation.find((item) => item.active) || null;
  });

  const contextualNavigation = computed(() => {
    const layoutStore = useLayoutStore();
    return layoutStore.isAdminLayout
      ? adminNavigation.value
      : frontendNavigation.value;
  });

  const isRouteActive = (path: string) => currentRoute.value === path;

  return {
    // State
    currentRoute,
    frontendNavigation,
    adminNavigation,
    breadcrumbs,
    // Actions
    setCurrentRoute,
    updateBreadcrumbs,
    updateActiveStates,
    // Getters
    activeNavigationItem,
    contextualNavigation,
    isRouteActive,
  };
});
```

## 6. Layout Components

Create `layouts/default.vue` (Frontend Layout):

```vue
<template>
  <div class="layout-frontend">
    <AppHeader
      layout-context="frontend"
      :navigation-items="navigationStore.frontendNavigation"
      :show-branding="true"
      @navigate="handleNavigation"
    />

    <main class="flex-1">
      <slot />
    </main>

    <AppFooter
      :links="footerLinks"
      :show-branding="true"
      :year="currentYear"
      @navigate="handleNavigation"
    />
  </div>
</template>

<script setup lang="ts">
const navigationStore = useNavigationStore();
const route = useRoute();

// Update layout context and current route
onMounted(() => {
  const layoutStore = useLayoutStore();
  layoutStore.setCurrentLayout("frontend");
  navigationStore.setCurrentRoute(route.path);
});

// Watch for route changes
watch(
  () => route.path,
  (newPath) => {
    navigationStore.setCurrentRoute(newPath);
  }
);

const currentYear = new Date().getFullYear();

const footerLinks = [
  { label: "Privacy", path: "/privacy" },
  { label: "Terms", path: "/terms" },
  { label: "Contact", path: "/contact" },
];

const handleNavigation = (item: NavigationItem) => {
  if (item.external) {
    window.open(item.path, "_blank");
  } else {
    navigateTo(item.path);
  }
};
</script>
```

Create `layouts/admin.vue` (Admin Layout):

```vue
<template>
  <div class="layout-admin">
    <AdminSidebar
      :navigation-items="navigationStore.adminNavigation"
      :is-collapsed="layoutStore.sidebarCollapsed"
      @toggle="layoutStore.toggleSidebar"
      @navigate="handleNavigation"
    />

    <div
      class="admin-content"
      :class="{ 'sidebar-collapsed': layoutStore.sidebarCollapsed }"
    >
      <AppHeader
        layout-context="admin"
        :navigation-items="[]"
        :show-branding="true"
        @navigate="handleNavigation"
      />

      <main class="p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const layoutStore = useLayoutStore();
const navigationStore = useNavigationStore();
const route = useRoute();

// Update layout context and current route
onMounted(() => {
  layoutStore.setCurrentLayout("admin");
  navigationStore.setCurrentRoute(route.path);
});

// Watch for route changes
watch(
  () => route.path,
  (newPath) => {
    navigationStore.setCurrentRoute(newPath);
  }
);

const handleNavigation = (item: NavigationItem) => {
  navigateTo(item.path);
};
</script>
```

## 7. Core Components

Create `components/layout/AppHeader.vue`:

```vue
<template>
  <header class="bg-white shadow-sm border-b" :class="headerClasses">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Branding -->
        <div v-if="showBranding" class="flex items-center">
          <NuxtLink to="/" class="text-xl font-bold text-gray-900">
            Your Site
          </NuxtLink>
        </div>

        <!-- Navigation -->
        <nav class="hidden md:flex space-x-8">
          <NuxtLink
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium"
            :class="{ 'text-gray-900 border-b-2 border-blue-500': item.active }"
            @click="$emit('navigate', item)"
          >
            <UIcon v-if="item.icon" :name="item.icon" class="w-4 h-4 mr-2" />
            {{ item.label }}
          </NuxtLink>
        </nav>

        <!-- Mobile menu button -->
        <div class="md:hidden">
          <UButton
            variant="ghost"
            size="sm"
            icon="i-heroicons-bars-3"
            @click="toggleMobileMenu"
          />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  layoutContext: "frontend" | "admin";
  navigationItems?: NavigationItem[];
  showBranding?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  navigationItems: () => [],
  showBranding: true,
});

const emit = defineEmits<{
  navigate: [item: NavigationItem];
}>();

const headerClasses = computed(() => {
  return {
    "admin-header": props.layoutContext === "admin",
    "frontend-header": props.layoutContext === "frontend",
  };
});

const toggleMobileMenu = () => {
  // Handle mobile menu toggle
  console.log("Toggle mobile menu");
};
</script>
```

## 8. Page Setup

Create `pages/index.vue` (Homepage):

```vue
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Welcome to Your Site</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Frontend Layout</h3>
        </template>
        <p class="text-gray-600">
          This page uses the default frontend layout with header, footer, and
          responsive navigation.
        </p>
        <template #footer>
          <UButton to="/info">Learn More</UButton>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">Admin Section</h3>
        </template>
        <p class="text-gray-600">
          Access the admin section with specialized layout and collapsible
          sidebar navigation.
        </p>
        <template #footer>
          <UButton to="/admin" color="gray">Go to Admin</UButton>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// This page uses the default layout (frontend)
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Home - Your Site",
  description: "Welcome to your site with dual layout system",
});
</script>
```

Create `pages/info.vue`:

```vue
<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-4xl font-bold text-gray-900 mb-8">Information Page</h1>

    <div class="prose prose-lg">
      <p>
        This is the information page demonstrating the frontend layout
        consistency across different pages in the public section of the site.
      </p>

      <h2>Layout Features</h2>
      <ul>
        <li>Consistent header with site navigation</li>
        <li>Footer with site links and branding</li>
        <li>Responsive design across all breakpoints</li>
        <li>SSR rendering for optimal SEO performance</li>
      </ul>
    </div>

    <div class="mt-8">
      <UButton to="/">Back to Home</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "default",
});

useSeoMeta({
  title: "Info - Your Site",
  description: "Information about your site layout system",
});
</script>
```

Create `pages/admin/index.vue`:

```vue
<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
        <p class="text-3xl font-bold text-blue-600">1,234</p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Total Pages</h3>
        <p class="text-3xl font-bold text-green-600">56</p>
      </div>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Admin Layout Features
        </h2>
        <ul class="space-y-2 text-gray-600">
          <li>✓ Collapsible sidebar navigation</li>
          <li>✓ Admin-specific header</li>
          <li>✓ No footer for more content space</li>
          <li>✓ CSR rendering for interactive features</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: "admin",
});

useSeoMeta({
  title: "Admin Dashboard",
  robots: "noindex", // Admin pages shouldn't be indexed
});
</script>
```

## 9. Development Commands

Add to `package.json` scripts:

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint .",
    "type-check": "nuxt typecheck"
  }
}
```

## 10. Testing Quick Start

Create `tests/components/layout/AppHeader.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import AppHeader from "~/components/layout/AppHeader.vue";

describe("AppHeader", () => {
  it("renders frontend header correctly", async () => {
    const component = await mountSuspended(AppHeader, {
      props: {
        layoutContext: "frontend",
        navigationItems: [
          { label: "Home", path: "/" },
          { label: "Info", path: "/info" },
        ],
      },
    });

    expect(component.text()).toContain("Home");
    expect(component.text()).toContain("Info");
  });
});
```

## 11. Run the Application

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Run type checking
pnpm type-check

# Build for production
pnpm build
```

## Next Steps

1. **Complete Component Implementation**: Finish AdminSidebar and AppFooter components
2. **Add Responsive Behavior**: Implement mobile-specific sidebar behavior
3. **Add Animations**: Enhance sidebar collapse/expand transitions
4. **Write Comprehensive Tests**: Add E2E tests for layout navigation
5. **Performance Optimization**: Optimize bundle size and rendering performance

## Troubleshooting

**Common Issues**:

- **Hydration mismatch**: Ensure consistent SSR/CSR rendering between layouts
- **Sidebar state persistence**: Verify Pinia store configuration
- **Navigation active states**: Check route watching implementation
- **Responsive breakpoints**: Validate Tailwind CSS configuration

**Performance Tips**:

- Use `defineAsyncComponent` for heavy admin components
- Implement route-based code splitting
- Optimize images with @nuxt/image module
- Monitor bundle size with webpack-bundle-analyzer
