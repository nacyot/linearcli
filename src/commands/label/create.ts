import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'

export default class LabelCreate extends Command {
  static description = 'Create a new issue label'
  static examples = [
    '<%= config.bin %> <%= command.id %> --name "bug" --color "#FF0000" --team ENG',
    '<%= config.bin %> <%= command.id %> --name "feature" --color "#00FF00" --description "New features"',
    '<%= config.bin %> <%= command.id %> --name "global-label" --color "#0000FF" # Creates workspace label',
  ]
  static flags = {
    color: Flags.string({
      char: 'c',
      description: 'Label color in hex format (#RRGGBB)',
      required: true,
    }),
    description: Flags.string({
      char: 'd',
      description: 'Label description',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    name: Flags.string({
      char: 'n',
      description: 'Label name',
      required: true,
    }),
    team: Flags.string({
      char: 't',
      description: 'Team key or name (optional, creates workspace label if not specified)',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(LabelCreate)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    // Validate color format
    if (!this.isValidHexColor(flags.color)) {
      throw new Error('Invalid color format. Please use hex format like #FF0000')
    }

    const client = getLinearClient()
    
    try {
      // Build label input
      const input: any = {
        color: flags.color,
        name: flags.name,
      }
      
      if (flags.description) {
        input.description = flags.description
      }
      
      // Resolve team ID if provided
      if (flags.team) {
        let teamId: string | undefined
        
        // Try by key first
        const teams = await client.teams({
          filter: { key: { eq: flags.team.toUpperCase() } },
          first: 1,
        })
        
        if (teams.nodes.length > 0) {
          teamId = teams.nodes[0].id
        } else {
          // Try by name
          const teamsByName = await client.teams({
            filter: { name: { eqIgnoreCase: flags.team } },
            first: 1,
          })
          
          if (teamsByName.nodes.length > 0) {
            teamId = teamsByName.nodes[0].id
          }
        }
        
        if (!teamId) {
          throw new Error(`Team "${flags.team}" not found`)
        }
        
        input.teamId = teamId
      }
      
      // Create the label
      const payload = await client.createIssueLabel(input)
      
      if (!payload.success || !payload.issueLabel) {
        throw new Error('Failed to create label')
      }
      
      // Output results
      if (flags.json) {
        console.log(JSON.stringify(payload.issueLabel, null, 2))
      } else {
        console.log(chalk.green('✓ Label created successfully!'))
        console.log('')
        console.log(chalk.bold('Label Details:'))
        console.log(`  Name: ${payload.issueLabel.name}`)
        console.log(`  Color: ${chalk.hex(payload.issueLabel.color)('●')} ${payload.issueLabel.color}`)
        
        if (payload.issueLabel.description) {
          console.log(`  Description: ${payload.issueLabel.description}`)
        }
        
        if (flags.team) {
          console.log(`  Team: ${flags.team}`)
        } else {
          console.log(`  Scope: workspace`)
        }
        
        console.log('')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to create label')
    }
  }

  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color)
  }
}