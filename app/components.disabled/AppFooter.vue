<template>
  <footer class="app-footer">
    <div class="app-footer__container">
      <!-- Main Footer Content -->
      <div class="app-footer__content">
        <!-- Brand Section -->
        <div class="app-footer__brand">
          <div class="app-footer__logo">
            <AppLogo class="app-footer__logo-icon" />
            <span class="app-footer__logo-text">Our Site</span>
          </div>
          <p class="app-footer__description">
            Building something amazing together. Join us on our journey to create better experiences.
          </p>

          <!-- Social Links -->
          <div
            v-if="showSocial"
            class="app-footer__social"
          >
            <a
              v-for="social in socialLinks"
              :key="social.name"
              :href="social.url"
              :aria-label="`Follow us on ${social.name}`"
              target="_blank"
              rel="noopener noreferrer"
              class="app-footer__social-link"
            >
              <UIcon
                :name="social.icon"
                class="app-footer__social-icon"
              />
            </a>
          </div>
        </div>

        <!-- Navigation Links -->
        <div
          v-if="showLinks"
          class="app-footer__links"
        >
          <div class="app-footer__link-group">
            <h3 class="app-footer__link-title">
              Quick Links
            </h3>
            <ul class="app-footer__link-list">
              <li
                v-for="link in quickLinks"
                :key="link.id"
                class="app-footer__link-item"
              >
                <NuxtLink
                  :to="link.path"
                  class="app-footer__link"
                >
                  {{ link.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="app-footer__link-group">
            <h3 class="app-footer__link-title">
              Company
            </h3>
            <ul class="app-footer__link-list">
              <li class="app-footer__link-item">
                <NuxtLink
                  to="/about"
                  class="app-footer__link"
                >
                  About Us
                </NuxtLink>
              </li>
              <li class="app-footer__link-item">
                <NuxtLink
                  to="/contact"
                  class="app-footer__link"
                >
                  Contact
                </NuxtLink>
              </li>
              <li class="app-footer__link-item">
                <NuxtLink
                  to="/careers"
                  class="app-footer__link"
                >
                  Careers
                </NuxtLink>
              </li>
            </ul>
          </div>

          <div class="app-footer__link-group">
            <h3 class="app-footer__link-title">
              Legal
            </h3>
            <ul class="app-footer__link-list">
              <li class="app-footer__link-item">
                <NuxtLink
                  to="/privacy"
                  class="app-footer__link"
                >
                  Privacy Policy
                </NuxtLink>
              </li>
              <li class="app-footer__link-item">
                <NuxtLink
                  to="/terms"
                  class="app-footer__link"
                >
                  Terms of Service
                </NuxtLink>
              </li>
              <li class="app-footer__link-item">
                <NuxtLink
                  to="/cookies"
                  class="app-footer__link"
                >
                  Cookie Policy
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Footer Bottom -->
      <div class="app-footer__bottom">
        <div class="app-footer__copyright">
          <p class="app-footer__copyright-text">
            {{ copyrightText }}
          </p>
        </div>

        <div class="app-footer__meta">
          <span class="app-footer__version">
            v{{ version }}
          </span>
          <span class="app-footer__separator">•</span>
          <span class="app-footer__updated">
            Updated {{ lastUpdated }}
          </span>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Props
interface Props {
  showSocial?: boolean
  showLinks?: boolean
  copyright?: string
  version?: string
}

const props = withDefaults(defineProps<Props>(), {
  showSocial: true,
  showLinks: true,
  copyright: '© 2024 Our Company. All rights reserved.',
  version: '1.0.0'
})

// Composables
const { frontendNavigation } = useLayoutState()

// Computed
const quickLinks = computed(() =>
  frontendNavigation.value.filter(item => item.isVisible !== false)
)

const copyrightText = computed(() => {
  const currentYear = new Date().getFullYear()
  return props.copyright.replace('2024', currentYear.toString())
})

const lastUpdated = computed(() => {
  const date = new Date()
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short'
  })
})

// Static data
const socialLinks = [
  {
    name: 'Twitter',
    url: 'https://twitter.com/company',
    icon: 'i-simple-icons-twitter'
  },
  {
    name: 'GitHub',
    url: 'https://github.com/company',
    icon: 'i-simple-icons-github'
  },
  {
    name: 'LinkedIn',
    url: 'https://linkedin.com/company/company',
    icon: 'i-simple-icons-linkedin'
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/company',
    icon: 'i-simple-icons-facebook'
  }
]
</script>

<style scoped>
.app-footer {
  @apply bg-gray-900 text-white;
  @apply mt-auto;
}

.app-footer__container {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8;
  @apply py-12;
}

/* Main Content */
.app-footer__content {
  @apply grid gap-8;
  @apply grid-cols-1 md:grid-cols-2 lg:grid-cols-4;
}

/* Brand Section */
.app-footer__brand {
  @apply col-span-1 lg:col-span-1;
}

.app-footer__logo {
  @apply flex items-center space-x-3 mb-4;
}

.app-footer__logo-icon {
  @apply w-8 h-8 text-blue-400;
}

.app-footer__logo-text {
  @apply text-xl font-bold;
}

.app-footer__description {
  @apply text-gray-300 text-sm leading-relaxed mb-6;
  @apply max-w-xs;
}

/* Social Links */
.app-footer__social {
  @apply flex space-x-4;
}

.app-footer__social-link {
  @apply w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center;
  @apply hover:bg-blue-600 transition-colors duration-200;
  @apply text-gray-300 hover:text-white;
}

.app-footer__social-icon {
  @apply w-5 h-5;
}

/* Navigation Links */
.app-footer__links {
  @apply col-span-1 lg:col-span-3;
  @apply grid gap-8 grid-cols-1 sm:grid-cols-3;
}

.app-footer__link-group {
  @apply space-y-4;
}

.app-footer__link-title {
  @apply text-sm font-semibold text-white uppercase tracking-wider;
}

.app-footer__link-list {
  @apply space-y-3 list-none m-0 p-0;
}

.app-footer__link-item {
  @apply block;
}

.app-footer__link {
  @apply text-gray-300 hover:text-white text-sm;
  @apply transition-colors duration-200 no-underline;
  @apply block py-1;
}

/* Footer Bottom */
.app-footer__bottom {
  @apply border-t border-gray-800 mt-12 pt-8;
  @apply flex flex-col sm:flex-row justify-between items-center;
  @apply space-y-4 sm:space-y-0;
}

.app-footer__copyright {
  @apply text-gray-400 text-sm;
}

.app-footer__copyright-text {
  @apply m-0;
}

.app-footer__meta {
  @apply flex items-center space-x-2 text-gray-500 text-xs;
}

.app-footer__version {
  @apply font-mono;
}

.app-footer__separator {
  @apply text-gray-600;
}

.app-footer__updated {
  @apply text-gray-500;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .app-footer__container {
    @apply py-8;
  }

  .app-footer__content {
    @apply gap-6;
  }

  .app-footer__brand {
    @apply text-center;
  }

  .app-footer__social {
    @apply justify-center;
  }

  .app-footer__links {
    @apply grid-cols-1 gap-6;
  }

  .app-footer__link-group {
    @apply text-center;
  }

  .app-footer__bottom {
    @apply text-center;
  }
}

/* Dark theme adjustments */
.dark .app-footer {
  @apply bg-gray-900;
}

.dark .app-footer__social-link {
  @apply bg-gray-900;
}

.dark .app-footer__bottom {
  @apply border-gray-900;
}
</style>
