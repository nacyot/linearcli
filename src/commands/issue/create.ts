import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class IssueCreate extends Command {
  static description = 'Create a new Linear issue'
static examples = [
    '<%= config.bin %> <%= command.id %> --title "Fix login bug" --team Engineering',
    '<%= config.bin %> <%= command.id %> --title "New feature" --team ENG --description "Add dark mode" --assignee "John Doe"',
    '<%= config.bin %> <%= command.id %> --title "Bug" --team ENG --labels "bug,high" --priority 2',
  ]
static flags = {
    assignee: Flags.string({
      char: 'a',
      description: 'Assignee name or ID',
    }),
    cycle: Flags.string({
      char: 'c',
      description: 'Cycle name or ID',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Issue description (markdown supported)',
    }),
    'due-date': Flags.string({
      description: 'Due date (YYYY-MM-DD)',
    }),
    labels: Flags.string({
      char: 'l',
      description: 'Comma-separated label names or IDs',
    }),
    parent: Flags.string({
      description: 'Parent issue ID',
    }),
    priority: Flags.integer({
      char: 'p',
      description: 'Priority (0=None, 1=Urgent, 2=High, 3=Normal, 4=Low)',
    }),
    project: Flags.string({
      description: 'Project name or ID',
    }),
    state: Flags.string({
      char: 's',
      description: 'State name or ID',
    }),
    team: Flags.string({
      description: 'Team name, key, or ID',
      required: true,
    }),
    title: Flags.string({
      char: 't',
      description: 'Issue title',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(IssueCreate)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    // Validate required fields
    if (!flags.team) {
      throw new Error('Team is required. Use --team flag.')
    }

    const client = getLinearClient()
    
    try {
      // Resolve team ID
      const teamId = await this.resolveTeamId(client, flags.team)
      if (!teamId) {
        throw new Error(`Team "${flags.team}" not found`)
      }

      // Build issue create input
      const input: any = {
        teamId,
        title: flags.title,
      }

      // Add description if provided
      if (flags.description) {
        input.description = flags.description
      }

      // Resolve and add assignee if provided
      if (flags.assignee) {
        const assigneeId = await this.resolveUserId(client, flags.assignee)
        if (assigneeId) {
          input.assigneeId = assigneeId
        } else {
          console.log(chalk.yellow(`Warning: Assignee "${flags.assignee}" not found, skipping`))
        }
      }

      // Resolve and add state if provided
      if (flags.state) {
        const stateId = await this.resolveStateId(client, flags.state, teamId)
        if (stateId) {
          input.stateId = stateId
        } else {
          console.log(chalk.yellow(`Warning: State "${flags.state}" not found, skipping`))
        }
      }

      // Resolve and add labels if provided
      if (flags.labels) {
        const labelNames = flags.labels.split(',').map((l: string) => l.trim())
        const labelIds = await this.resolveLabelIds(client, labelNames)
        if (labelIds.length > 0) {
          input.labelIds = labelIds
        }

        if (labelIds.length < labelNames.length) {
          console.log(chalk.yellow(`Warning: Some labels not found`))
        }
      }

      // Add priority if provided
      if (flags.priority !== undefined) {
        input.priority = flags.priority
      }

      // Add due date if provided
      if (flags['due-date']) {
        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/
        if (!dateRegex.test(flags['due-date'])) {
          throw new Error('Invalid date format. Use YYYY-MM-DD')
        }

        input.dueDate = flags['due-date']
      }

      // Resolve and add project if provided
      if (flags.project) {
        const projectId = await this.resolveProjectId(client, flags.project, teamId)
        if (projectId) {
          input.projectId = projectId
        } else {
          console.log(chalk.yellow(`Warning: Project "${flags.project}" not found, skipping`))
        }
      }

      // Resolve and add cycle if provided
      if (flags.cycle) {
        const cycleId = await this.resolveCycleId(client, flags.cycle, teamId)
        if (cycleId) {
          input.cycleId = cycleId
        } else {
          console.log(chalk.yellow(`Warning: Cycle "${flags.cycle}" not found, skipping`))
        }
      }

      // Add parent if provided (direct ID)
      if (flags.parent) {
        input.parentId = flags.parent
      }

      // Create the issue
      console.log(chalk.gray('Creating issue...'))
      const payload = await client.createIssue(input)

      if (!payload.success || !payload.issue) {
        throw new Error('Failed to create issue')
      }

      const issue = await payload.issue

      // Display success message
      console.log(chalk.green(`\n✓ Issue ${chalk.bold(issue.identifier)} created successfully!`))
      console.log(chalk.gray(`Title: ${issue.title}`))
      if (issue.url) {
        console.log(chalk.blue(`View: ${issue.url}`))
      }

      console.log('')

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to create issue')
    }
  }

  private async resolveCycleId(client: any, nameOrId: string, teamId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const team = await client.team(teamId)
    const cycles = await team.cycles()
    
    // Try to match by name or number
    const cycle = cycles.nodes.find((c: any) => 
      c.name?.toLowerCase() === nameOrId.toLowerCase() ||
      c.number?.toString() === nameOrId
    )
    
    return cycle?.id || null
  }

  private async resolveLabelIds(client: any, names: string[]): Promise<string[]> {
    const labelIds: string[] = []
    
    for (const name of names) {
      if (name.includes('-')) {
        // Looks like an ID
        labelIds.push(name)
      } else {
        // Look up by name
        const labels = await client.issueLabels({
          filter: { name: { eqIgnoreCase: name } },
        })
        if (labels.nodes.length > 0) {
          labelIds.push(labels.nodes[0].id)
        }
      }
    }
    
    return labelIds
  }

  private async resolveProjectId(client: any, nameOrId: string, teamId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const projects = await client.projects({
      filter: { 
        name: { eqIgnoreCase: nameOrId },
        teams: { some: { id: { eq: teamId } } },
      },
    })
    
    return projects.nodes[0]?.id || null
  }

  private async resolveStateId(client: any, nameOrId: string, teamId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const team = await client.team(teamId)
    const states = await team.states()
    
    const state = states.nodes.find((s: any) => 
      s.name.toLowerCase() === nameOrId.toLowerCase()
    )
    
    return state?.id || null
  }

  private async resolveTeamId(client: any, nameOrId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    // Try by name
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
}