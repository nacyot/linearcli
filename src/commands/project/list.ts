import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class ProjectList extends Command {
  static description = 'List projects in your Linear workspace'
static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --team ENG',
    '<%= config.bin %> <%= command.id %> --state started',
    '<%= config.bin %> <%= command.id %> --json',
  ]
static flags = {
    'include-archived': Flags.boolean({
      default: false,
      description: 'Include archived projects',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    limit: Flags.integer({
      char: 'n',
      default: 50,
      description: 'Number of projects to fetch',
    }),
    query: Flags.string({
      char: 'q',
      description: 'Search projects by name',
    }),
    state: Flags.string({
      char: 's',
      description: 'Filter by state (planned, started, completed, canceled)',
    }),
    team: Flags.string({
      char: 't',
      description: 'Filter by team key or name',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(ProjectList)
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
      
      // Build filter
      const filter: any = {}
      
      // Filter by team if provided
      // Note: Project filtering by team is not directly supported,
      // we'll need to filter the results after fetching
      let teamFilter: string | undefined
      if (flags.team) {
        // Resolve team ID
        const teams = await client.teams({
          filter: { key: { eq: flags.team.toUpperCase() } },
          first: 1,
        })
        
        if (teams.nodes.length === 0) {
          // Try by name
          const teamsByName = await client.teams({
            filter: { name: { eqIgnoreCase: flags.team } },
            first: 1,
          })
          
          if (teamsByName.nodes.length > 0) {
            teamFilter = teamsByName.nodes[0].id
          } else {
            console.log(chalk.yellow(`Warning: Team "${flags.team}" not found`))
          }
        } else {
          teamFilter = teams.nodes[0].id
        }
      }
      
      // Filter by state if provided
      if (flags.state) {
        filter.state = { eq: flags.state }
      }
      
      // Filter by query if provided
      if (flags.query) {
        filter.name = { containsIgnoreCase: flags.query }
      }
      
      if (Object.keys(filter).length > 0) {
        options.filter = filter
      }
      
      // Fetch projects
      const projects = await client.projects(options)
      
      // Filter by team if needed (post-fetch filtering)
      let filteredProjects = projects.nodes
      if (teamFilter) {
        const teamChecks = await Promise.all(
          projects.nodes.map(async (project) => {
            const teams = await project.teams?.()
            return teams?.nodes?.some((t: any) => t.id === teamFilter) ? project : null
          })
        )
        
        filteredProjects = teamChecks.filter((p): p is any => p !== null)
      }
      
      // Output results
      if (flags.json) {
        const output = filteredProjects.map((project: any) => ({
          description: project.description,
          id: project.id,
          name: project.name,
          progress: project.progress,
          state: project.state,
          targetDate: project.targetDate,
        }))
        console.log(JSON.stringify(output, null, 2))
      } else {
        if (filteredProjects.length === 0) {
          console.log(chalk.yellow('No projects found'))
          return
        }
        
        console.log(chalk.bold.cyan('\n📁 Projects:'))
        console.log(chalk.gray('─'.repeat(80)))
        
        // Table header
        console.log(
          chalk.bold('Name'.padEnd(30)) +
          chalk.bold('State'.padEnd(15)) +
          chalk.bold('Progress'.padEnd(10)) +
          chalk.bold('Target Date')
        )
        console.log(chalk.gray('-'.repeat(80)))
        
        for (const project of filteredProjects) {
          const name = project.name || '-'
          const state = this.formatState(project.state)
          const progress = project.progress ? `${Math.round(project.progress * 100)}%` : '0%'
          const targetDate = project.targetDate 
            ? new Date(project.targetDate).toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'short',
                year: 'numeric',
              })
            : '-'
          
          console.log(
            name.padEnd(30) +
            state.padEnd(23) +
            progress.padEnd(10) +
            targetDate
          )
        }
        
        console.log('')
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch projects')
    }
  }

  private formatState(state: string): string {
    switch (state) {
      case 'canceled': {
        return chalk.red('Canceled')
      }

      case 'completed': {
        return chalk.green('Completed')
      }

      case 'planned': {
        return chalk.blue('Planned')
      }

      case 'started': {
        return chalk.yellow('Started')
      }

      default: {
        return state || 'Unknown'
      }
    }
  }
}