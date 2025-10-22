import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    // Setup file to initialize global mocks
    setupFiles: ['./tests/setup.ts'],
    // Include functional and API tests, exclude E2E tests
    include: ['tests/functional/**/*.test.ts', 'tests/api/**/*.test.ts'],
    exclude: ['tests/e2e/**/*', 'node_modules/**']
  }
})
