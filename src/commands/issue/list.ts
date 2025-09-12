import { Issue, LinearClient, LinearDocument } from '@linear/sdk'
import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'
import { ListFlags } from '../../types/commands.js'
import { formatState, formatTable, truncateText } from '../../utils/table-formatter.js'

// Type for issues with resolved assignee and state
interface EnrichedIssue {
  assignee?: null | { name?: string }
  identifier: string
  state?: { name?: string, type?: string }
  title: string
}

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

  async runWithoutParse(flags: ListFlags): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Build filter
      const filter: LinearDocument.IssueFilter = {}
      
      // Team filter - resolve first as it's needed for state resolution
      let teamId: null | string = null
      if (flags.team) {
        teamId = await this.resolveTeamId(client, flags.team)
        if (teamId) {
          filter.team = { id: { eq: teamId } }
        } else {
          // Team not found - return empty results
          console.log(chalk.yellow(`Team "${flags.team}" not found`))
          return
        }
      }
      
      // Assignee filter
      if (flags.assignee) {
        const userId = await this.resolveUserId(client, flags.assignee)
        if (userId) {
          filter.assignee = { id: { eq: userId } }
        } else {
          // Assignee not found - return empty results
          console.log(chalk.yellow(`Assignee "${flags.assignee}" not found`))
          return
        }
      }
      
      // State filter - pass teamId for context
      if (flags.state) {
        const stateId = await this.resolveStateId(client, flags.state, teamId)
        if (stateId) {
          filter.state = { id: { eq: stateId } }
        } else {
          // State not found - return empty results
          console.log(chalk.yellow(`State "${flags.state}" not found${teamId ? ' in team' : ''}`))
          return
        }
      }
      
      // Label filter
      if (flags.label) {
        const labelId = await this.resolveLabelId(client, flags.label)
        if (labelId) {
          filter.labels = { id: { in: [labelId] } }
        } else {
          // Label not found - return empty results
          console.log(chalk.yellow(`Label "${flags.label}" not found`))
          return
        }
      }
      
      // Project filter
      if (flags.project) {
        const projectId = await this.resolveProjectId(client, flags.project)
        if (projectId) {
          filter.project = { id: { eq: projectId } }
        } else {
          // Project not found - return empty results
          console.log(chalk.yellow(`Project "${flags.project}" not found`))
          return
        }
      }
      
      // Cycle filter
      if (flags.cycle) {
        const cycleId = await this.resolveCycleId(client, flags.cycle, teamId)
        if (cycleId) {
          filter.cycle = { id: { eq: cycleId } }
        } else {
          // Cycle not found - return empty results
          console.log(chalk.yellow(`Cycle "${flags.cycle}" not found${teamId ? ' in team' : ''}`))
          return
        }
      }
      
      // Prepare query variables
      const variables: {
        filter?: LinearDocument.IssueFilter
        first?: number
        includeArchived?: boolean
        orderBy?: LinearDocument.PaginationOrderBy
      } = {
        first: Math.min(flags.limit && flags.limit > 0 ? flags.limit : 50, 250),
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
      
      // Fetch state for each issue
      const issuesWithState = await Promise.all(
        issues.nodes.map(async (issue: Issue) => ({
          ...issue,
          assignee: await issue.assignee,
          state: await issue.state
        }))
      )
      
      // Output results
      if (flags.json) {
        console.log(JSON.stringify(issuesWithState, null, 2))
      } else {
        this.displayIssues(issuesWithState)
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch issues')
    }
  }

  private displayIssues(issues: EnrichedIssue[]): void {
    if (issues.length === 0) {
      console.log(chalk.yellow('No issues found'))
      return
    }
    
    console.log(chalk.bold(`\nFound ${issues.length} issue${issues.length === 1 ? '' : 's'}:`))
    
    // Prepare table data
    const headers = ['ID', 'Title', 'State', 'Assignee']
    const rows = issues.map(issue => [
      chalk.cyan(issue.identifier),
      truncateText(issue.title, 50),
      formatState(issue.state),
      issue.assignee?.name || chalk.gray('Unassigned')
    ])
    
    // Display table
    console.log(formatTable({ headers, rows }))
  }

  private async resolveCycleId(client: LinearClient, nameOrNumber: string, teamId: null | string = null): Promise<null | string> {
    // If it looks like an ID, return as is
    if (nameOrNumber.includes('-')) {
      return nameOrNumber
    }
    
    // If we have a teamId, get cycles for that specific team
    if (teamId) {
      const team = await client.team(teamId)
      const cycles = await team.cycles()
      
      // Try to match by name or number
      const matchingCycle = cycles.nodes.find(
        (cycle) => {
          const nameMatch = cycle.name?.toLowerCase() === nameOrNumber.toLowerCase()
          const numberMatch = cycle.number?.toString() === nameOrNumber
          return nameMatch || numberMatch
        }
      )
      return matchingCycle?.id || null
    }
    
    // Otherwise search all cycles
    const cycles = await client.cycles({
      filter: { name: { containsIgnoreCase: nameOrNumber } },
      first: 1,
    })
    
    return cycles.nodes[0]?.id || null
  }

  private async resolveLabelId(client: LinearClient, nameOrId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const labels = await client.issueLabels({
      filter: { name: { eqIgnoreCase: nameOrId } },
    })
    
    return labels.nodes[0]?.id || null
  }

  private async resolveProjectId(client: LinearClient, nameOrId: string): Promise<null | string> {
    // If it looks like an ID, return as is
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    // Otherwise, look up by name
    const projects = await client.projects({
      filter: { name: { containsIgnoreCase: nameOrId } },
      first: 1,
    })
    
    return projects.nodes[0]?.id || null
  }

  private async resolveStateId(client: LinearClient, nameOrId: string, teamId: null | string = null): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    // If we have a teamId, get states for that specific team
    if (teamId) {
      const team = await client.team(teamId)
      const states = await team.states()
      const matchingState = states.nodes.find(
        (state) => state.name.toLowerCase() === nameOrId.toLowerCase()
      )
      return matchingState?.id || null
    }
    
    // Otherwise search all workflow states
    const states = await client.workflowStates({
      filter: { name: { eqIgnoreCase: nameOrId } },
    })
    
    return states.nodes[0]?.id || null
  }
  
  private async resolveTeamId(client: LinearClient, nameOrId: string): Promise<null | string> {
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
  
  private async resolveUserId(client: LinearClient, nameOrId: string): Promise<null | string> {
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
}