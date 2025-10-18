import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    // Only include functional tests, exclude E2E tests
    include: ['tests/functional/**/*.test.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**']
  }
})
