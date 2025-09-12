import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class TeamList extends Command {
  static description = 'List all teams in your Linear workspace'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --query "eng"',
    '<%= config.bin %> <%= command.id %> --json',
  ]
static flags = {
    'include-archived': Flags.boolean({
      default: false,
      description: 'Include archived teams',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    limit: Flags.integer({
      char: 'n',
      default: 50,
      description: 'Number of teams to fetch',
    }),
    query: Flags.string({
      char: 'q',
      description: 'Search teams by name',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(TeamList)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Build options
      const options: any = {
        first: flags.limit,
        includeArchived: flags['include-archived'],
      }
      
      // Add filter if query provided
      if (flags.query) {
        options.filter = {
          name: { containsIgnoreCase: flags.query },
        }
      }
      
      // Fetch teams
      const teams = await client.teams(options)
      
      // Output results
      if (flags.json) {
        const output = teams.nodes.map((team: any) => ({
          description: team.description,
          id: team.id,
          key: team.key,
          memberCount: team.memberCount,
          name: team.name,
        }))
        console.log(JSON.stringify(output, null, 2))
      } else {
        if (teams.nodes.length === 0) {
          console.log(chalk.yellow('No teams found'))
          return
        }
        
        console.log(chalk.bold.cyan('\n👥 Teams in your workspace:'))
        console.log(chalk.gray('─'.repeat(80)))
        
        // Table header
        console.log(
          chalk.bold('Key'.padEnd(10)) +
          chalk.bold('Name'.padEnd(35)) +
          chalk.bold('Description')
        )
        console.log(chalk.gray('-'.repeat(80)))
        
        for (const team of teams.nodes) {
          const key = team.key || '-'
          const name = team.name || '-'
          const description = team.description || ''
          
          console.log(
            chalk.cyan(key.padEnd(10)) +
            name.padEnd(35) +
            chalk.gray(description.slice(0, 45))
          )
        }
        
        console.log('')
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch teams')
    }
  }
}