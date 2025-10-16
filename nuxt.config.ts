// https://nuxt.com/docs/api/configuration/nuxt-config
// Phase 2.1: Adding Pinia for state management
// Phase 7: Adding additional modules
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
    port: 3001
  },

  compatibilityDate: '2025-01-15'
})
