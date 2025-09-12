import { confirm, password } from '@inquirer/prompts'
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { clearApiKey, hasApiKey, setApiKey, testConnection } from '../services/linear.js'

export default class Init extends Command {
  static description = 'Initialize Linear CLI with your API key'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --api-key lin_api_xxx',
  ]
static flags = {
    'api-key': Flags.string({
      char: 'k',
      description: 'Linear API key',
      env: 'LINEAR_API_KEY',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(Init)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check if API key already exists
    if (hasApiKey() && !flags['api-key']) {
      const shouldOverwrite = await confirm({
        default: false,
        message: 'An API key is already configured. Do you want to overwrite it?',
      })

      if (!shouldOverwrite) {
        console.log(chalk.yellow('Setup aborted.'))
        return
      }
    }

    // Get API key
    let apiKey = flags['api-key']
    
    if (!apiKey) {
      apiKey = await password({
        mask: '*',
        message: 'Enter your Linear API key:',
        validate(value) {
          if (!value || value.length === 0) {
            return 'API key is required'
          }

          if (!value.startsWith('lin_api_')) {
            return 'Invalid API key format. Linear API keys start with "lin_api_"'
          }

          return true
        },
      })
    }

    // Test the API key
    console.log(chalk.gray('Testing API connection...'))
    
    // Temporarily set the key for testing
    const originalKey = hasApiKey() ? undefined : null
    setApiKey(apiKey)
    
    const isValid = await testConnection()
    
    if (!isValid) {
      // Restore original key if test failed
      if (originalKey === null) {
        clearApiKey()
      }

      throw new Error('Invalid API key. Please check your key and try again.')
    }

    // Save the API key
    setApiKey(apiKey)
    
    console.log(chalk.green('✓ Linear CLI initialized successfully!'))
    console.log(chalk.gray('You can now use Linear CLI commands.'))
    console.log(chalk.gray('Try: lc issue list'))
  }
}