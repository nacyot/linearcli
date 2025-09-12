import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class IssueMine extends Command {
  static description = 'List issues assigned to you'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --state "In Progress"',
    '<%= config.bin %> <%= command.id %> --json',
  ]
static flags = {
    'include-archived': Flags.boolean({
      default: false,
      description: 'Include archived issues',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    limit: Flags.integer({
      char: 'n',
      default: 50,
      description: 'Number of issues to fetch',
    }),
    state: Flags.string({
      char: 's',
      description: 'Filter by state name',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(IssueMine)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Build filter
      const filter: any = {}
      if (flags.state) {
        filter.state = { name: { eqIgnoreCase: flags.state } }
      }
      
      // Fetch assigned issues
      const options: any = {
        first: flags.limit,
        includeArchived: flags['include-archived'],
        orderBy: 'updatedAt',
      }
      
      if (Object.keys(filter).length > 0) {
        options.filter = filter
      }
      
      // Get the current user and their assigned issues
      const viewer = await client.viewer
      const issues = await viewer.assignedIssues(options)
      
      // Output results
      if (flags.json) {
        const output = await Promise.all(issues.nodes.map(async (issue: any) => {
          const team = await issue.team
          return {
            id: issue.id,
            identifier: issue.identifier,
            state: issue.state ? { name: issue.state.name, type: issue.state.type } : null,
            team: team ? { key: team.key } : null,
            title: issue.title,
          }
        }))
        console.log(JSON.stringify(output, null, 2))
      } else {
        if (issues.nodes.length === 0) {
          console.log(chalk.yellow('No issues assigned to you'))
          return
        }
        
        console.log(chalk.bold.cyan('\n📋 Issues assigned to you:'))
        console.log(chalk.gray('─'.repeat(80)))
        
        for (const issue of issues.nodes) {
          const {state} = issue
          const stateName = state ? this.formatState(state) : chalk.gray('Unknown')
          const team = await issue.team
          const teamKey = team?.key || ''
          
          console.log(
            `${chalk.cyan(issue.identifier.padEnd(10))} ${stateName.padEnd(20)} ${issue.title}`
          )
        }
        
        console.log('')
        
        if (issues.pageInfo.hasNextPage) {
          console.log(chalk.gray(`Showing first ${issues.nodes.length} issues. Use --limit to see more.`))
        }
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch your assigned issues')
    }
  }

  private formatState(state: any): string {
    if (!state) return chalk.gray('Unknown')
    
    const name = state.name || 'Unknown'
    const {type} = state
    
    switch (type) {
      case 'backlog': {
        return chalk.gray(name)
      }

      case 'canceled': {
        return chalk.red(name)
      }

      case 'completed': {
        return chalk.green(name)
      }

      case 'started': {
        return chalk.yellow(name)
      }

      case 'unstarted': {
        return chalk.blue(name)
      }

      default: {
        return name
      }
    }
  }
}