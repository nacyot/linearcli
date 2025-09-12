import { LinearDocument } from '@linear/sdk'
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class IssueList extends Command {
  static description = 'List Linear issues'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --team Engineering',
    '<%= config.bin %> <%= command.id %> --assignee "John Doe"',
    '<%= config.bin %> <%= command.id %> --state "In Progress"',
    '<%= config.bin %> <%= command.id %> --limit 100',
  ]
static flags = {
    assignee: Flags.string({
      char: 'a',
      description: 'Filter by assignee name or ID',
    }),
    cycle: Flags.string({
      char: 'c',
      description: 'Filter by cycle name or ID',
    }),
    'include-archived': Flags.boolean({
      default: false,
      description: 'Include archived issues',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    label: Flags.string({
      char: 'l',
      description: 'Filter by label name or ID',
    }),
    limit: Flags.integer({
      default: 50,
      description: 'Number of issues to fetch (max 250)',
    }),
    'order-by': Flags.string({
      default: 'updatedAt',
      description: 'Order by field',
      options: ['createdAt', 'updatedAt'],
    }),
    project: Flags.string({
      char: 'p',
      description: 'Filter by project name or ID',
    }),
    state: Flags.string({
      char: 's',
      description: 'Filter by state name or ID',
    }),
    team: Flags.string({
      char: 't',
      description: 'Filter by team name or ID',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(IssueList)
    await this.runWithoutParse(flags)
  }

  async runWithoutParse(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Build filter
      const filter: LinearDocument.IssueFilter = {}
      
      // Team filter
      if (flags.team) {
        const teamId = await this.resolveTeamId(client, flags.team)
        if (teamId) {
          filter.team = { id: { eq: teamId } }
        }
      }
      
      // Assignee filter
      if (flags.assignee) {
        const userId = await this.resolveUserId(client, flags.assignee)
        if (userId) {
          filter.assignee = { id: { eq: userId } }
        }
      }
      
      // State filter
      if (flags.state) {
        const stateId = await this.resolveStateId(client, flags.state)
        if (stateId) {
          filter.state = { id: { eq: stateId } }
        }
      }
      
      // Label filter
      if (flags.label) {
        const labelId = await this.resolveLabelId(client, flags.label)
        if (labelId) {
          filter.labels = { id: { in: [labelId] } }
        }
      }
      
      // Prepare query variables
      const variables: any = {
        first: Math.min(flags.limit || 50, 250),
        includeArchived: flags['include-archived'] || false,
        orderBy: flags['order-by'] === 'createdAt' 
          ? LinearDocument.PaginationOrderBy.CreatedAt 
          : LinearDocument.PaginationOrderBy.UpdatedAt,
      }
      
      // Add filter if not empty
      if (Object.keys(filter).length > 0) {
        variables.filter = filter
      }
      
      // Fetch issues
      const issues = await client.issues(variables)
      
      // Output results
      if (flags.json) {
        console.log(JSON.stringify(issues.nodes, null, 2))
      } else {
        this.displayIssues(issues.nodes)
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch issues')
    }
  }

  private displayIssues(issues: any[]): void {
    if (issues.length === 0) {
      console.log(chalk.yellow('No issues found'))
      return
    }
    
    console.log(chalk.bold(`\nFound ${issues.length} issue${issues.length === 1 ? '' : 's'}:\n`))
    
    // Table header
    console.log(
      chalk.gray('ID'.padEnd(10)) +
      chalk.gray('Title'.padEnd(50)) +
      chalk.gray('State'.padEnd(15)) +
      chalk.gray('Assignee'.padEnd(20))
    )
    console.log(chalk.gray('-'.repeat(95)))
    
    // Table rows
    for (const issue of issues) {
      const id = chalk.cyan(issue.identifier.padEnd(10))
      const title = this.truncate(issue.title, 48).padEnd(50)
      const state = this.formatState(issue.state).padEnd(15)
      const assignee = (issue.assignee?.name || chalk.gray('Unassigned')).padEnd(20)
      
      console.log(id + title + state + assignee)
    }
    
    console.log('')
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

  private async resolveLabelId(client: any, nameOrId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const labels = await client.issueLabels({
      filter: { name: { eqIgnoreCase: nameOrId } },
    })
    
    return labels.nodes[0]?.id || null
  }

  private async resolveStateId(client: any, nameOrId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const states = await client.workflowStates({
      filter: { name: { eqIgnoreCase: nameOrId } },
    })
    
    return states.nodes[0]?.id || null
  }

  private async resolveTeamId(client: any, nameOrId: string): Promise<null | string> {
    // If it looks like an ID, return as is
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    // Otherwise, look up by name or key
    const teams = await client.teams({
      filter: { name: { eqIgnoreCase: nameOrId } },
      first: 1,
    })
    
    if (teams.nodes.length === 0) {
      // Try by key
      const teamsByKey = await client.teams({
        filter: { key: { eq: nameOrId.toUpperCase() } },
        first: 1,
      })
      return teamsByKey.nodes[0]?.id || null
    }
    
    return teams.nodes[0]?.id || null
  }

  private async resolveUserId(client: any, nameOrId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const users = await client.users({
      filter: { name: { eqIgnoreCase: nameOrId } },
    })
    
    if (users.nodes.length === 0) {
      // Try by email
      const usersByEmail = await client.users({
        filter: { email: { eq: nameOrId } },
      })
      return usersByEmail.nodes[0]?.id || null
    }
    
    return users.nodes[0]?.id || null
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, Math.max(0, maxLength - 3)) + '...'
  }
}