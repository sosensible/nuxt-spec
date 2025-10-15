// https://nuxt.com/docs/api/configuration/nuxt-config
// Phase 2.1: Adding Pinia for state management
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  css: [
    '~/assets/css/main.css'
  ],

  experimental: {
    inlineSSRStyles: false
  },

  devServer: {
    port: 3001
  },

  compatibilityDate: '2025-01-15'
})
