// https://nuxt.com/docs/api/configuration/nuxt-config
// Phase 2.1: Adding Pinia for state management
// Phase 7: Adding additional modules
// Phase 8.2: Adding route rules for optimal performance
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/scripts'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  devServer: {
    // Allow CI / concurrent runs to override the port via environment.
    // Prefer standard PORT, then NUXT_PORT, otherwise fall back to 3000.
    port: Number(process.env.PORT || process.env.NUXT_PORT || 3000)
  },

  // Route rules for performance optimization
  routeRules: {
    // Static pages - prerender for fast delivery
    '/': { prerender: true },
    '/info': { prerender: true },

    // Admin routes - client-side only for dynamic content
    '/admin/**': { ssr: false }
  },

  compatibilityDate: '2025-01-15',

  // Avoid native sharp dependency in CI / Windows environments by using the
  // JS-based squoosh provider. This removes the need for platform-specific
  // prebuilt sharp binaries and the related build warnings.
  image: {
    provider: 'squoosh'
  },

  // Enable Nuxt DevTools during development to inspect components, state and overlays
  // Set to `true` for local development. For CI / production builds this should be false.
  devtools: {
    // Only enable devtools in development environment
    enabled: process.env.NODE_ENV === 'development'
  },

  // Runtime config for password reset emails
  runtimeConfig: {
    public: {
      // Keep runtime public app URL in sync with the chosen port. This
      // prefers an explicit NUXT_PUBLIC_APP_URL, then derives from the
      // environment port if set, otherwise defaults to localhost:3000.
      appUrl:
        process.env.NUXT_PUBLIC_APP_URL ||
        `http://localhost:${process.env.PORT || process.env.NUXT_PORT || 3000}`
    }
  }
})