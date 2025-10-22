/**
 * Appwrite Server Utilities
 * 
 * Provides Appwrite SDK client initialization for server-side API routes.
 * Uses environment variables for configuration.
 */

import { Client, Account, Users } from 'node-appwrite'

/**
 * Create Appwrite client with admin privileges
 * Uses API key for server-side operations
 */
export function createAppwriteClient(): Client {
  const client = new Client()

  const endpoint = process.env.APPWRITE_ENDPOINT
  const projectId = process.env.APPWRITE_PROJECT_ID
  const apiKey = process.env.APPWRITE_API_KEY

  if (!endpoint || !projectId || !apiKey) {
    throw new Error('Missing Appwrite configuration. Check APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, and APPWRITE_API_KEY environment variables.')
  }

  client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

  return client
}

/**
 * Create Appwrite client with user session
 * Used for authenticated user operations
 * 
 * @param sessionSecret - Session secret from cookie
 */
export function createAppwriteSessionClient(sessionSecret: string): Client {
  const client = new Client()

  const endpoint = process.env.APPWRITE_ENDPOINT
  const projectId = process.env.APPWRITE_PROJECT_ID

  if (!endpoint || !projectId) {
    throw new Error('Missing Appwrite configuration. Check APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID environment variables.')
  }

  client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setSession(sessionSecret)

  return client
}

/**
 * Create Account service instance
 * 
 * @param client - Appwrite client (with or without session)
 */
export function createAccountService(client: Client): Account {
  return new Account(client)
}

/**
 * Create Users service instance (admin only)
 * 
 * @param client - Appwrite client with API key
 */
export function createUsersService(client: Client): Users {
  return new Users(client)
}
