import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'
import { formatState, formatTable } from '../../utils/table-formatter.js'

export default class StatusList extends Command {
  static description = 'List workflow states for a team'
static examples = [
    '<%= config.bin %> <%= command.id %> --team ENG',
    '<%= config.bin %> <%= command.id %> --team ENG --json',
  ]
static flags = {
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    team: Flags.string({
      char: 't',
      description: 'Team key or name (required)',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(StatusList)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Resolve team
      let team: any = null
      
      // Try by key first
      const teams = await client.teams({
        filter: { key: { eq: flags.team.toUpperCase() } },
        first: 1,
      })
      
      if (teams.nodes.length > 0) {
        team = teams.nodes[0]
      } else {
        // Try by name
        const teamsByName = await client.teams({
          filter: { name: { eqIgnoreCase: flags.team } },
          first: 1,
        })
        team = teamsByName.nodes[0]
      }
      
      if (!team) {
        throw new Error(`Team "${flags.team}" not found`)
      }
      
      // Get states for the team
      const teamInstance = await client.team(team.id)
      const states = await teamInstance.states()
      
      // Output results
      if (flags.json) {
        const output = states.nodes.map((state: any) => ({
          color: state.color,
          id: state.id,
          name: state.name,
          position: state.position,
          type: state.type,
        }))
        console.log(JSON.stringify(output, null, 2))
      } else {
        console.log(chalk.bold.cyan(`\n🔄 Workflow States for ${team.name}:`))
        
        const headers = ['State', 'Type']
        const rows = states.nodes.map((state: any) => {
          const color = state.color || '#888'
          const colorBox = chalk.hex(color)('●')
          const name = `${colorBox} ${state.name}`
          const type = this.formatType(state.type)
          return [name, formatState(state)]
        })
        
        console.log(formatTable({ headers, rows }))
      }
      
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error(`Failed to fetch states for team "${flags.team}"`)
    }
  }

  private formatType(type: string): string {
    switch (type) {
      case 'backlog': {
        return 'Backlog'
      }

      case 'canceled': {
        return 'Canceled'
      }

      case 'completed': {
        return 'Done'
      }

      case 'started': {
        return 'In Progress'
      }

      case 'unstarted': {
        return 'To Do'
      }

      default: {
        return type
      }
    }
  }
}