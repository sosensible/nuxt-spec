/**
 * Vitest Global Setup File
 * 
 * This file runs before all tests to set up the global test environment.
 * It provides necessary browser APIs that may not be available in the Node environment.
 */

import { vi } from 'vitest'

// Suppress unhandled promise rejections from router navigation during test teardown
// This happens when middleware triggers navigation but the test environment is cleaned up
const originalOnUnhandledRejection = process.listeners('unhandledRejection')
process.removeAllListeners('unhandledRejection')

process.on('unhandledRejection', (reason: unknown) => {
  const error = reason as Error
  // Suppress specific router/window errors that occur during test teardown
  if (
    error &&
    error.message &&
    (error.message.includes('window is not defined') ||
      error.message.includes('scrollRestoration'))
  ) {
    // Silently ignore - this is expected during test teardown when router
    // navigation is still pending but happy-dom has cleaned up window
    return
  }
  // Re-throw other unhandled rejections
  originalOnUnhandledRejection.forEach((listener) => {
    if (typeof listener === 'function') {
      listener(reason, Promise.resolve())
    }
  })
})

// Ensure window.history is available for router scroll restoration
if (typeof window !== 'undefined' && !window.history) {
  Object.defineProperty(window, 'history', {
    writable: true,
    configurable: true,
    value: {
      scrollRestoration: 'auto',
      pushState: vi.fn(),
      replaceState: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      go: vi.fn(),
      length: 0,
      state: null,
    },
  })
}

// Suppress Vue Router warnings about missing window during tests
const originalConsoleWarn = console.warn
console.warn = (message: string, ...args: unknown[]) => {
  // Filter out expected router warnings
  if (
    typeof message === 'string' &&
    (message.includes('window is not defined') ||
      message.includes('scrollRestoration'))
  ) {
    return
  }
  originalConsoleWarn(message, ...args)
}
