import { Cycle, LinearClient, WorkflowState } from '@linear/sdk'
import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'
import { UpdateIssueFlags } from '../../types/commands.js'

export default class IssueUpdate extends Command {
  static args = {
    id: Args.string({
      description: 'Issue ID (e.g., ENG-123)',
      required: true,
    }),
  }
static description = 'Update an existing Linear issue'
static examples = [
    '<%= config.bin %> <%= command.id %> ENG-123 --title "Updated title"',
    '<%= config.bin %> <%= command.id %> ENG-123 --state Done --assignee "John Doe"',
    '<%= config.bin %> <%= command.id %> ENG-123 --priority 1 --labels "bug,urgent"',
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
    delegate: Flags.string({
      description: 'Comma-separated delegate emails/names, or "none" to clear',
    }),
    description: Flags.string({
      char: 'd',
      description: 'Issue description (markdown supported)',
    }),
    'due-date': Flags.string({
      description: 'Due date (YYYY-MM-DD)',
    }),
    estimate: Flags.integer({
      char: 'e',
      description: 'Estimate value',
    }),
    labels: Flags.string({
      char: 'l',
      description: 'Comma-separated label names or IDs',
    }),
    links: Flags.string({
      description: 'Comma-separated issue IDs to link (e.g. ENG-123,ENG-124)',
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
    title: Flags.string({
      char: 't',
      description: 'Issue title',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(IssueUpdate)
    await this.runWithArgs(args.id, flags)
  }

  async runWithArgs(issueId: string, flags: UpdateIssueFlags): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Fetch the issue
      const issue = await client.issue(issueId)
      
      if (!issue) {
        throw new Error(`Issue ${issueId} not found`)
      }

      // Get the team ID for lookups
      const team = await issue.team
      const teamId = team?.id
      
      if (!teamId) {
        throw new Error(`Could not determine team for issue ${issueId}`)
      }

      // Build update input
      interface IssueUpdateInput {
        assigneeId?: null | string
        cycleId?: null | string
        description?: string
        dueDate?: null | string
        estimate?: number
        labelIds?: string[]
        parentId?: null | string
        priority?: number
        projectId?: null | string
        relatedIssueIds?: string[]
        stateId?: string
        subscriberIds?: string[]
        title?: string
      }
      
      const input: IssueUpdateInput = {}
      let hasChanges = false

      // Update title if provided
      if (flags.title !== undefined) {
        input.title = flags.title
        hasChanges = true
      }

      // Update description if provided
      if (flags.description !== undefined) {
        input.description = flags.description
        hasChanges = true
      }

      // Resolve and update assignee if provided
      if (flags.assignee !== undefined) {
        if (flags.assignee === 'none' || flags.assignee === '') {
          input.assigneeId = null
        } else {
          const assigneeId = await this.resolveUserId(client, flags.assignee)
          if (assigneeId) {
            input.assigneeId = assigneeId
          } else {
            console.log(chalk.yellow(`Warning: Assignee "${flags.assignee}" not found, skipping`))
          }
        }

        hasChanges = true
      }

      // Resolve and update state if provided
      if (flags.state !== undefined) {
        const stateId = await this.resolveStateId(client, flags.state, teamId)
        if (stateId) {
          input.stateId = stateId
          hasChanges = true
        } else {
          console.log(chalk.yellow(`Warning: State "${flags.state}" not found, skipping`))
        }
      }

      // Resolve and update labels if provided
      if (flags.labels !== undefined) {
        if (flags.labels === 'none' || flags.labels === '') {
          input.labelIds = []
        } else {
          const labelNames = flags.labels.split(',').map((l: string) => l.trim())
          const labelIds = await this.resolveLabelIds(client, labelNames)
          if (labelIds.length > 0) {
            input.labelIds = labelIds
          }

          if (labelIds.length < labelNames.length) {
            console.log(chalk.yellow(`Warning: Some labels not found`))
          }
        }

        hasChanges = true
      }

      // Update priority if provided
      if (flags.priority !== undefined) {
        input.priority = flags.priority
        hasChanges = true
      }

      // Update due date if provided
      if (flags['due-date'] !== undefined) {
        if (flags['due-date'] === 'none' || flags['due-date'] === '') {
          input.dueDate = null
        } else {
          // Validate date format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/
          if (!dateRegex.test(flags['due-date'])) {
            throw new Error('Invalid date format. Use YYYY-MM-DD')
          }

          input.dueDate = flags['due-date']
        }

        hasChanges = true
      }

      // Resolve and update project if provided
      if (flags.project !== undefined) {
        if (flags.project === 'none' || flags.project === '') {
          input.projectId = null
        } else {
          const projectId = await this.resolveProjectId(client, flags.project, teamId)
          if (projectId) {
            input.projectId = projectId
          } else {
            console.log(chalk.yellow(`Warning: Project "${flags.project}" not found, skipping`))
          }
        }

        hasChanges = true
      }

      // Resolve and update cycle if provided
      if (flags.cycle !== undefined) {
        if (flags.cycle === 'none' || flags.cycle === '') {
          input.cycleId = null
        } else {
          const cycleId = await this.resolveCycleId(client, flags.cycle, teamId)
          if (cycleId) {
            input.cycleId = cycleId
          } else {
            console.log(chalk.yellow(`Warning: Cycle "${flags.cycle}" not found, skipping`))
          }
        }

        hasChanges = true
      }

      // Update parent if provided
      if (flags.parent !== undefined) {
        input.parentId = flags.parent === 'none' || flags.parent === '' ? null : flags.parent;
        hasChanges = true
      }

      // Update estimate if provided
      if (flags.estimate !== undefined) {
        input.estimate = flags.estimate
        hasChanges = true
      }

      // Resolve and update delegates if provided
      if (flags.delegate !== undefined) {
        if (flags.delegate === 'none' || flags.delegate === '') {
          input.subscriberIds = []
        } else {
          const delegates = flags.delegate.split(',').map((d: string) => d.trim())
          
          // Resolve all delegate IDs in parallel
          const delegateResults = await Promise.all(
            delegates.map(async (delegate) => ({
              delegate,
              userId: await this.resolveUserId(client, delegate)
            }))
          )
          
          const delegateIds: string[] = []
          for (const result of delegateResults) {
            if (result.userId) {
              delegateIds.push(result.userId)
            } else {
              console.log(chalk.yellow(`Warning: Delegate "${result.delegate}" not found, skipping`))
            }
          }
          
          if (delegateIds.length > 0) {
            input.subscriberIds = delegateIds
          }
        }
        
        hasChanges = true
      }

      // Resolve and add linked issues if provided
      if (flags.links !== undefined) {
        const issueKeys = flags.links.split(',').map((k: string) => k.trim())
        
        // Fetch all linked issues in parallel
        const linkResults = await Promise.all(
          issueKeys.map(async (issueKey) => {
            try {
              const relatedIssue = await client.issue(issueKey)
              return { id: relatedIssue.id, issueKey, success: true }
            } catch {
              return { id: null, issueKey, success: false }
            }
          })
        )
        
        const relatedIssueIds: string[] = []
        for (const result of linkResults) {
          if (result.success && result.id) {
            relatedIssueIds.push(result.id)
          } else {
            console.log(chalk.yellow(`Warning: Issue "${result.issueKey}" not found, skipping`))
          }
        }
        
        if (relatedIssueIds.length > 0) {
          input.relatedIssueIds = relatedIssueIds
        }
        
        hasChanges = true
      }

      // Check if there are any changes
      if (!hasChanges) {
        console.log(chalk.yellow('No changes provided'))
        return
      }

      // Update the issue
      console.log(chalk.gray(`Updating issue ${issueId}...`))
      const result = await issue.update(input)

      if (!result.success) {
        throw new Error('Failed to update issue')
      }

      // Display success message
      console.log(chalk.green(`\n✓ Issue ${chalk.bold(issue.identifier)} updated successfully!`))
      
      // Show what was updated
      const updates = []
      if (input.title !== undefined) updates.push('title')
      if (input.description !== undefined) updates.push('description')
      if (input.assigneeId !== undefined) updates.push('assignee')
      if (input.stateId !== undefined) updates.push('state')
      if (input.labelIds !== undefined) updates.push('labels')
      if (input.priority !== undefined) updates.push('priority')
      if (input.dueDate !== undefined) updates.push('due date')
      if (input.projectId !== undefined) updates.push('project')
      if (input.cycleId !== undefined) updates.push('cycle')
      if (input.parentId !== undefined) updates.push('parent')
      if (input.estimate !== undefined) updates.push('estimate')
      if (input.subscriberIds !== undefined) updates.push('delegates')
      if (input.relatedIssueIds !== undefined) updates.push('links')
      
      if (updates.length > 0) {
        console.log(chalk.gray(`Updated: ${updates.join(', ')}`))
      }
      
      console.log('')

    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error(`Failed to update issue ${issueId}`)
    }
  }

  private async resolveCycleId(client: LinearClient, nameOrId: string, teamId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const team = await client.team(teamId)
    const cycles = await team.cycles()
    
    // Try to match by name or number
    const cycle = cycles.nodes.find((c: Cycle) => 
      c.name?.toLowerCase() === nameOrId.toLowerCase() ||
      c.number?.toString() === nameOrId
    )
    
    return cycle?.id || null
  }

  private async resolveLabelIds(client: LinearClient, names: string[]): Promise<string[]> {
    const labelIds: string[] = []
    
    // Process all label lookups in parallel
    const labelPromises = names.map(async (name) => {
      if (name.includes('-')) {
        // Looks like an ID
        return { id: name, name }
      }
 
        // Look up by name
        const labels = await client.issueLabels({
          filter: { name: { eqIgnoreCase: name } },
        })
        return { id: labels.nodes.length > 0 ? labels.nodes[0].id : null, name }
      
    })
    
    const labelResults = await Promise.all(labelPromises)
    
    for (const result of labelResults) {
      if (result.id) {
        labelIds.push(result.id)
      }
    }
    
    return labelIds
  }

  private async resolveProjectId(client: LinearClient, nameOrId: string, teamId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const projects = await client.projects({
      filter: { 
        name: { eqIgnoreCase: nameOrId },
      },
    })
    
    // Check team membership for all projects in parallel
    const projectTeamChecks = await Promise.all(
      projects.nodes.map(async (project) => {
        const teams = await project.teams()
        return {
          isTeamMember: teams.nodes.some((team) => team.id === teamId),
          project
        }
      })
    )
    
    const matchingProject = projectTeamChecks.find(({ isTeamMember }) => isTeamMember)
    return matchingProject?.project.id || null
  }

  private async resolveStateId(client: LinearClient, nameOrId: string, teamId: string): Promise<null | string> {
    if (nameOrId.includes('-')) {
      return nameOrId
    }
    
    const team = await client.team(teamId)
    const states = await team.states()
    
    const state = states.nodes.find((s: WorkflowState) => 
      s.name.toLowerCase() === nameOrId.toLowerCase()
    )
    
    return state?.id || null
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