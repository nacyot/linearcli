import { LinearClient } from '@linear/sdk'
import Conf from 'conf'
import * as os from 'node:os'
import path from 'node:path'

// Config store for API keys and other settings
const config = new Conf({
  configName: 'config',
  cwd: path.join(os.homedir(), '.linearcmd'),
  projectName: 'linearcmd',
})

// Singleton client instance
let linearClient: LinearClient | null = null

/**
 * Get or create a Linear API client
 */
export function getLinearClient(): LinearClient {
  const apiKey = getApiKey()
  
  if (!apiKey) {
    throw new Error('No API key found. Run "lc init" to set up your Linear API key.')
  }

  // Return existing client if API key hasn't changed
  const currentKey = config.get('currentKey') as string | undefined
  if (linearClient && currentKey === apiKey) {
    return linearClient
  }

  // Create new client
  linearClient = new LinearClient({ apiKey })
  config.set('currentKey', apiKey)
  
  return linearClient
}

/**
 * Get API key from environment or config
 */
export function getApiKey(): string | undefined {
  // Priority: Environment variable > Stored config
  const envKey = process.env.LINEAR_API_KEY || process.env.LINEAR_CLI_KEY
  if (envKey) {
    return envKey
  }

  return config.get('apiKey') as string | undefined
}

/**
 * Store API key in config
 */
export function setApiKey(apiKey: string): void {
  config.set('apiKey', apiKey)
}

/**
 * Clear stored API key
 */
export function clearApiKey(): void {
  config.delete('apiKey')
  config.delete('currentKey')
  linearClient = null
}

/**
 * Check if API key is configured
 */
export function hasApiKey(): boolean {
  return Boolean(getApiKey())
}

/**
 * Test the API connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    const client = getLinearClient()
    const viewer = await client.viewer
    return Boolean(viewer.id)
  } catch {
    return false
  }
}