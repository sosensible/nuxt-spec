// https://nuxt.com/docs/api/configuration/nuxt-config
// Phase 1.1: Minimal Working App - Testing with port 3001
export default defineNuxtConfig({
  modules: [
    '@nuxt/ui'
  ],

  devServer: {
    port: 3001
  },

  compatibilityDate: '2025-01-15'
})
