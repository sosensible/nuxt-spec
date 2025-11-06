import { defineVitestConfig } from '@nuxt/test-utils/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // Configure the Nuxt test environment
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom'
      }
    },
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/functional/**/*.test.ts',
      'tests/api/**/*.test.ts',
      'tests/unit/**/*.spec.ts'
    ],
    exclude: ['tests/e2e/**/*', 'node_modules/**']
  },
  // Use tsconfig paths so `~`/`@` from tsconfig are available to Vitest
  plugins: [tsconfigPaths()]
})
