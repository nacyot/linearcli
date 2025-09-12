import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class TeamGet extends Command {
  static args = {
    identifier: Args.string({
      description: 'Team key, ID, or name',
      required: true,
    }),
  }
static description = 'Get details of a specific team'
static examples = [
    '<%= config.bin %> <%= command.id %> ENG',
    '<%= config.bin %> <%= command.id %> team-uuid',
    '<%= config.bin %> <%= command.id %> Engineering',
  ]
static flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(TeamGet)
    await this.runWithArgs(args.identifier, flags)
  }

  async runWithArgs(identifier: string, flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      let team: any = null
      
      // Try to get by ID if it looks like a UUID
      if (identifier.includes('-')) {
        team = await client.team(identifier)
      }
      
      // If not found or not a UUID, try by key
      if (!team) {
        const teams = await client.teams({
          filter: { key: { eq: identifier.toUpperCase() } },
          first: 1,
        })
        team = teams.nodes[0]
      }
      
      // If still not found, try by name
      if (!team) {
        const teams = await client.teams({
          filter: { name: { eqIgnoreCase: identifier } },
          first: 1,
        })
        team = teams.nodes[0]
      }
      
      if (!team) {
        throw new Error(`Team "${identifier}" not found`)
      }
      
      // Output results
      if (flags.json) {
        console.log(JSON.stringify(team, null, 2))
      } else {
        await this.displayTeam(team)
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error(`Failed to fetch team "${identifier}"`)
    }
  }

  private async displayTeam(team: any): Promise<void> {
    console.log('')
    
    // Header
    console.log(chalk.bold.cyan(team.key) + chalk.gray(' • ') + chalk.bold(team.name))
    console.log(chalk.gray('─'.repeat(80)))
    
    // Basic info
    const info = []
    
    info.push(`ID: ${team.id}`)
    
    if (team.cycleEnabled !== undefined) {
      info.push(`Cycles: ${team.cycleEnabled ? 'Enabled' : 'Disabled'}`)
    }
    
    console.log(info.join(chalk.gray(' • ')))
    
    // Description
    if (team.description) {
      console.log(chalk.gray('\n─ Description ─'))
      console.log(team.description)
    }
    
    // Workflow states
    const states = await team.states?.()
    if (states?.nodes?.length > 0) {
      console.log(chalk.gray('\n─ Workflow States ─'))
      for (const state of states.nodes) {
        const stateColor = this.getStateColor(state.type)
        console.log(`  • ${stateColor(state.name)}`)
      }
    }
    
    // Labels
    const labels = await team.labels?.()
    if (labels?.nodes?.length > 0) {
      console.log(chalk.gray('\n─ Team Labels ─'))
      const labelNames = labels.nodes.map((l: any) => chalk.magenta(l.name))
      console.log(`  ${labelNames.join(', ')}`)
    }
    
    console.log('')
  }

  private getStateColor(type: string): (text: string) => string {
    switch (type) {
      case 'backlog': {
        return chalk.gray
      }

      case 'canceled': {
        return chalk.red
      }

      case 'completed': {
        return chalk.green
      }

      case 'started': {
        return chalk.yellow
      }

      case 'unstarted': {
        return chalk.blue
      }

      default: {
        return (text: string) => text
      }
    }
  }
}