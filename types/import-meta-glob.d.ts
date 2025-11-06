// Lightweight declaration for Vite's import.meta.glob helpers used in the
// codebase. This avoids TypeScript errors during CI/typecheck when the
// `vite` types aren't picked up by the TS config.
declare interface ImportMeta {
  // Non-eager dynamic glob that returns async module loaders.
  glob: (pattern: string, options?: any) => Record<string, () => Promise<any>>

  // Eager glob (synchronously imported modules)
  globEager?: (pattern: string, options?: any) => Record<string, any>
}

export {}
