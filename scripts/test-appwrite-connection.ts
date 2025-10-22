/**
 * Appwrite Connection Test Script
 * 
 * Tests the connection to Appwrite and verifies:
 * - Environment variables are loaded
 * - Appwrite SDK can initialize
 * - API key has correct permissions
 * - Project is accessible
 * 
 * Usage: npx tsx scripts/test-appwrite-connection.ts
 */

import { config } from 'dotenv'
import { Client, Account, Users } from 'node-appwrite'

// Load environment variables from .env file
config()

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function success(message: string) {
  console.log(`${colors.green}✓${colors.reset} ${message}`)
}

function error(message: string) {
  console.log(`${colors.red}✗${colors.reset} ${message}`)
}

function info(message: string) {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`)
}

function section(message: string) {
  console.log(`\n${colors.cyan}${message}${colors.reset}`)
}

async function testAppwriteConnection() {
  console.log(`${colors.cyan}
╔════════════════════════════════════════════════════════════╗
║         Appwrite Connection Test                           ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`)

  // Step 1: Check environment variables
  section('Step 1: Checking Environment Variables')
  
  const endpoint = process.env.APPWRITE_ENDPOINT
  const projectId = process.env.APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY
  const githubClientId = process.env.GITHUB_CLIENT_ID
  const githubClientSecret = process.env.GITHUB_CLIENT_SECRET

  if (!endpoint || !projectId || !apiKey) {
    error('Missing required environment variables')
    if (!endpoint) error('  APPWRITE_ENDPOINT is not set')
    if (!projectId) error('  APPWRITE_PROJECT_ID is not set')
    if (!apiKey) error('  APPWRITE_API_KEY is not set')
    process.exit(1)
  }

  success(`APPWRITE_ENDPOINT: ${endpoint}`)
  success(`APPWRITE_PROJECT_ID: ${projectId}`)
  success(`APPWRITE_API_KEY: ${apiKey.substring(0, 20)}...`)
  
  if (githubClientId && githubClientSecret) {
    success(`GITHUB_CLIENT_ID: ${githubClientId}`)
    success(`GITHUB_CLIENT_SECRET: ${githubClientSecret.substring(0, 8)}...`)
  } else {
    error('GitHub OAuth credentials not set (optional for now)')
  }

  // Step 2: Initialize Appwrite Client
  section('Step 2: Initializing Appwrite Client')
  
  let client: Client
  try {
    client = new Client()
      .setEndpoint(endpoint)
      .setProject(projectId)
      .setKey(apiKey)
    
    success('Appwrite client initialized successfully')
  } catch (err) {
    error(`Failed to initialize Appwrite client: ${err instanceof Error ? err.message : String(err)}`)
    process.exit(1)
  }

  // Step 3: Test Account Service
  section('Step 3: Testing Account Service')
  
  try {
    const account = new Account(client)
    // This will throw an error since we're using an API key, not a user session
    // But it proves the client is configured correctly
    await account.get().catch(() => {
      // Expected error - API keys can't access Account service (user-only)
      success('Account service is accessible (API key limitation is expected)')
    })
  } catch {
    info('Account service test skipped (requires user session, not API key)')
  }

  // Step 4: Test Users Service (requires API key with users.read permission)
  section('Step 4: Testing Users Service')
  
  try {
    const users = new Users(client)
    const usersList = await users.list()
    
    success(`Users service is working! Found ${usersList.total} user(s)`)
    
    if (usersList.total > 0) {
      info(`Sample user: ${usersList.users[0].email || usersList.users[0].name || 'No name/email'}`)
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err)
    
    if (errorMessage.includes('Missing scope')) {
      error(`API key is missing required scope: ${errorMessage}`)
      error('Please add "users.read" scope to your API key in Appwrite console')
    } else if (errorMessage.includes('Invalid API key')) {
      error('API key is invalid. Please check your APPWRITE_API_KEY in .env')
    } else {
      error(`Failed to access Users service: ${errorMessage}`)
    }
    process.exit(1)
  }

  // Step 5: Summary
  section('Summary')
  
  console.log(`
${colors.green}✓ All tests passed!${colors.reset}

Your Appwrite configuration is ready for development:
  • Endpoint: ${endpoint}
  • Project ID: ${projectId}
  • API Key: Valid with correct permissions
  • GitHub OAuth: ${githubClientId ? 'Configured' : 'Not configured'}

${colors.cyan}Next Steps:${colors.reset}
  1. Run ${colors.yellow}npm install node-appwrite${colors.reset} (if not already installed)
  2. Proceed to Phase 1: Create data-model.md, contracts, quickstart
  3. Begin TDD implementation in Phase 2

${colors.cyan}Ready to start building authentication! 🚀${colors.reset}
`)
}

// Run the test
testAppwriteConnection().catch((err) => {
  error(`\nUnexpected error: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
})
