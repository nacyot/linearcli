import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class StatusList extends Command {
  static description = 'List workflow states for a team'
static examples = [
    '<%= config.bin %> <%= command.id %> --team ENG',
    '<%= config.bin %> <%= command.id %> --team Engineering --json',
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
        console.log(chalk.gray('─'.repeat(80)))
        
        // Group states by type
        const statesByType: any = {}
        for (const state of states.nodes) {
          if (!statesByType[state.type]) {
            statesByType[state.type] = []
          }

          statesByType[state.type].push(state)
        }
        
        // Display states by type
        const typeOrder = ['backlog', 'unstarted', 'started', 'completed', 'canceled']
        for (const type of typeOrder) {
          if (statesByType[type]) {
            console.log(`\n${chalk.bold(this.formatType(type))}:`)
            for (const state of statesByType[type]) {
              const color = state.color || '#888'
              const colorBox = chalk.hex(color)('●')
              console.log(`  ${colorBox} ${state.name}`)
            }
          }
        }
        
        console.log('')
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