// Module shims for path aliases not resolved by TS in some CI environments
declare module '~/types/auth' {
  export * from '../types/auth'
}

// Allow importing these module paths in tests and server code
declare module '#app' {
  // keep empty - helps TS resolve Nuxt's runtime types in some CI setups
}
