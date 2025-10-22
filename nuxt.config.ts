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
    port: 3000
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

  devtools: {
    enabled: false
  }
})
