#!/usr/bin/env node
import fs from 'fs'
import path from 'path'

const repoRoot = process.cwd()
const configPath = path.join(repoRoot, 'nuxt.config.ts')

if (!fs.existsSync(configPath)) {
  console.log('nuxt.config.ts not found — skipping devtools check')
  process.exit(0)
}

const src = fs.readFileSync(configPath, 'utf8')

// Heuristics to detect unconditional devtools enabled
const patterns = [
  /devtools\s*:\s*true/,
  /devtools\s*:\s*\{[^}]*enabled\s*:\s*true[^}]*\}/s
]

const matches = patterns.some(re => re.test(src))

if (!matches) {
  console.log('devtools check: OK — no unconditional devtools enabled in nuxt.config.ts')
  process.exit(0)
}

console.error('\nERROR: devtools appears to be enabled unconditionally in nuxt.config.ts')
console.error('This CI job runs with NODE_ENV=production and must fail if devtools is enabled outside development.')
console.error('\nPlease ensure `devtools` is only enabled in development, for example:')
console.error(`
export default defineNuxtConfig({
  devtools: { enabled: process.env.NODE_ENV === 'development' }
})
`)
process.exit(2)
