// Ambient types for Vite's import.meta.glob used in the project
declare global {
  interface ImportMeta {
    /**
     * Vite's import.meta.glob helper. T is the module type for each matched file.
     */
    glob<T = Record<string, unknown>>(pattern: string, options?: { eager?: boolean }): Record<string, T>
  }
}

export {}
