<template>
  <header
    class="app-header"
    :class="headerClasses"
  >
    <div class="app-header__container">
      <!-- Logo/Brand -->
      <div class="app-header__brand">
        <NuxtLink
          to="/"
          class="app-header__logo"
          @click="closeMobileMenu"
        >
          <AppLogo class="app-header__logo-icon" />
          <span class="app-header__logo-text">Our Site</span>
        </NuxtLink>
      </div>

      <!-- Desktop Navigation -->
      <nav
        class="app-header__nav app-header__nav--desktop"
        aria-label="Main navigation"
      >
        <ul class="app-header__nav-list">
          <li
            v-for="item in visibleNavigation"
            :key="item.id"
            class="app-header__nav-item"
          >
            <NuxtLink
              :to="item.path"
              class="app-header__nav-link"
              :class="{ 'app-header__nav-link--active': item.isActive }"
              @click="handleNavigationClick(item)"
            >
              <UIcon
                v-if="item.icon"
                :name="item.icon"
                class="app-header__nav-icon"
              />
              {{ item.label }}
              <UBadge
                v-if="item.badge"
                class="app-header__nav-badge"
                size="xs"
                variant="solid"
                color="primary"
              >
                {{ item.badge }}
              </UBadge>
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <!-- Header Actions -->
      <div class="app-header__actions">
        <!-- CTA Button -->
        <UButton
          v-if="showCta"
          :to="ctaLink"
          variant="solid"
          color="primary"
          size="sm"
          class="app-header__cta"
        >
          {{ ctaText }}
        </UButton>

        <!-- Mobile Menu Toggle -->
        <UButton
          variant="ghost"
          size="sm"
          class="app-header__mobile-toggle"
          :class="{ 'app-header__mobile-toggle--active': isMobileMenuOpen }"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="mobile-navigation"
          aria-label="Toggle navigation menu"
          @click="toggleMobileMenu"
        >
          <UIcon
            :name="isMobileMenuOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
            class="app-header__mobile-toggle-icon"
          />
        </UButton>
      </div>
    </div>

    <!-- Mobile Navigation Overlay -->
    <Teleport to="body">
      <div
        v-if="isMobileMenuOpen"
        class="app-header__mobile-overlay"
        @click="closeMobileMenu"
      >
        <nav
          id="mobile-navigation"
          class="app-header__nav app-header__nav--mobile"
          aria-label="Mobile navigation"
          @click.stop
        >
          <div class="app-header__mobile-header">
            <div class="app-header__mobile-brand">
              <AppLogo class="app-header__mobile-logo" />
              <span class="app-header__mobile-title">Our Site</span>
            </div>
            <UButton
              variant="ghost"
              size="sm"
              aria-label="Close navigation menu"
              @click="closeMobileMenu"
            >
              <UIcon name="i-heroicons-x-mark" />
            </UButton>
          </div>

          <ul class="app-header__mobile-nav-list">
            <li
              v-for="item in visibleNavigation"
              :key="item.id"
              class="app-header__mobile-nav-item"
            >
              <NuxtLink
                :to="item.path"
                class="app-header__mobile-nav-link"
                :class="{ 'app-header__mobile-nav-link--active': item.isActive }"
                @click="handleMobileNavigationClick(item)"
              >
                <div class="app-header__mobile-nav-content">
                  <div class="app-header__mobile-nav-main">
                    <UIcon
                      v-if="item.icon"
                      :name="item.icon"
                      class="app-header__mobile-nav-icon"
                    />
                    <span class="app-header__mobile-nav-label">{{ item.label }}</span>
                  </div>
                  <UBadge
                    v-if="item.badge"
                    class="app-header__mobile-nav-badge"
                    size="xs"
                    variant="solid"
                    color="primary"
                  >
                    {{ item.badge }}
                  </UBadge>
                </div>
              </NuxtLink>
            </li>
          </ul>

          <!-- Mobile CTA -->
          <div
            v-if="showCta"
            class="app-header__mobile-cta"
          >
            <UButton
              :to="ctaLink"
              variant="solid"
              color="primary"
              size="lg"
              block
              @click="closeMobileMenu"
            >
              {{ ctaText }}
            </UButton>
          </div>
        </nav>
      </div>
    </Teleport>
  </header>
</template>

<script setup lang="ts">
import type { NavigationItem } from '~/types/layout'

// Props
interface Props {
  sticky?: boolean
  transparent?: boolean
  showCta?: boolean
  ctaText?: string
  ctaLink?: string
}

const props = withDefaults(defineProps<Props>(), {
  sticky: true,
  transparent: false,
  showCta: true,
  ctaText: 'Get Started',
  ctaLink: '/info'
})

// Composables
const { currentNavigation, navigateToItem, setNavigationActive } = useNavigation()
const { isMobile, pageTitle } = useLayoutState()

// State
const isMobileMenuOpen = ref(false)

// Computed
const visibleNavigation = computed(() =>
  currentNavigation.value.filter(item => item.isVisible !== false)
)

const headerClasses = computed(() => ({
  'app-header--sticky': props.sticky,
  'app-header--transparent': props.transparent,
  'app-header--mobile-open': isMobileMenuOpen.value,
  'app-header--mobile': isMobile.value
}))

// Methods
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value

  // Prevent body scroll when mobile menu is open
  if (import.meta.client) {
    document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : ''
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false

  // Restore body scroll
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
}

const handleNavigationClick = (item: NavigationItem) => {
  setNavigationActive(item.id)
}

const handleMobileNavigationClick = (item: NavigationItem) => {
  setNavigationActive(item.id)
  closeMobileMenu()
}

// Watch for route changes to close mobile menu
watch(() => navigateToItem, () => {
  closeMobileMenu()
})

// Watch for mobile breakpoint changes
watch(isMobile, (newIsMobile) => {
  if (!newIsMobile && isMobileMenuOpen.value) {
    closeMobileMenu()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})

// SEO
useHead({
  title: computed(() => pageTitle.value || 'Our Site'),
  meta: [
    {
      name: 'description',
      content: 'Welcome to our site - building something amazing together'
    }
  ]
})
</script>

<style scoped>
.app-header {
  @apply relative z-40 bg-white shadow-sm border-b border-gray-200;
  height: var(--frontend-header-height, 64px);
}

.app-header--sticky {
  @apply sticky top-0;
}

.app-header--transparent {
  @apply bg-transparent shadow-none border-transparent;
}

.app-header--mobile-open {
  @apply relative;
}

.app-header__container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  @apply h-full flex items-center justify-between;
}

/* Brand/Logo */
.app-header__brand {
  @apply flex-shrink-0;
}

.app-header__logo {
  @apply flex items-center space-x-3 text-gray-900 hover:text-blue-600 transition-colors;
  @apply no-underline;
}

.app-header__logo-icon {
  @apply w-8 h-8 flex-shrink-0;
}

.app-header__logo-text {
  @apply text-xl font-bold;
}

/* Desktop Navigation */
.app-header__nav--desktop {
  @apply hidden md:flex;
}

.app-header__nav-list {
  @apply flex space-x-8 list-none m-0 p-0;
}

.app-header__nav-item {
  @apply relative;
}

.app-header__nav-link {
  @apply flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700;
  @apply hover:text-blue-600 hover:bg-gray-50 transition-all duration-200;
  @apply no-underline font-medium;
}

.app-header__nav-link--active {
  @apply text-blue-600 bg-blue-50;
}

.app-header__nav-icon {
  @apply w-4 h-4;
}

.app-header__nav-badge {
  @apply ml-1;
}

/* Header Actions */
.app-header__actions {
  @apply flex items-center space-x-4;
}

.app-header__cta {
  @apply hidden sm:inline-flex;
}

/* Mobile Toggle */
.app-header__mobile-toggle {
  @apply md:hidden;
}

.app-header__mobile-toggle-icon {
  @apply w-6 h-6;
}

/* Mobile Navigation Overlay */
.app-header__mobile-overlay {
  @apply fixed inset-0 z-50 bg-black bg-opacity-50;
  @apply md:hidden;
}

.app-header__nav--mobile {
  @apply fixed top-0 right-0 h-full w-80 max-w-full bg-white shadow-xl;
  @apply flex flex-col;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.app-header__mobile-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.app-header__mobile-brand {
  @apply flex items-center space-x-3;
}

.app-header__mobile-logo {
  @apply w-6 h-6;
}

.app-header__mobile-title {
  @apply text-lg font-bold text-gray-900;
}

.app-header__mobile-nav-list {
  @apply flex-1 overflow-y-auto py-4 list-none m-0 p-0;
}

.app-header__mobile-nav-item {
  @apply border-b border-gray-100 last:border-b-0;
}

.app-header__mobile-nav-link {
  @apply block px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors;
  @apply no-underline;
}

.app-header__mobile-nav-link--active {
  @apply text-blue-600 bg-blue-50;
}

.app-header__mobile-nav-content {
  @apply flex items-center justify-between;
}

.app-header__mobile-nav-main {
  @apply flex items-center space-x-3;
}

.app-header__mobile-nav-icon {
  @apply w-5 h-5;
}

.app-header__mobile-nav-label {
  @apply font-medium;
}

.app-header__mobile-nav-badge {
  @apply flex-shrink-0;
}

/* Mobile CTA */
.app-header__mobile-cta {
  @apply p-4 border-t border-gray-200;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .app-header__container {
    @apply px-4;
  }

  .app-header__logo-text {
    @apply text-lg;
  }
}
</style>
