import { Args, Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'
import { formatDate } from '../../utils/table-formatter.js'

export default class DocumentGet extends Command {
  static args = {
    id: Args.string({
      description: 'Document ID or slug',
      required: false,
    }),
  }

  static description = 'Get a specific document by ID or slug'
  static examples = [
    '<%= config.bin %> <%= command.id %> doc-123',
    '<%= config.bin %> <%= command.id %> my-document-slug',
    '<%= config.bin %> <%= command.id %> doc-123 --content',
    '<%= config.bin %> <%= command.id %> doc-123 --json',
  ]
  static flags = {
    content: Flags.boolean({
      char: 'c',
      default: false,
      description: 'Show full document content',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
  }

  async run(): Promise<void> {
    const { args, flags } = await this.parse(DocumentGet)
    await this.runWithArgs([args.id].filter(Boolean) as string[], flags)
  }

  async runWithArgs(args: string[], flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    // Validate input
    if (!args[0]) {
      throw new Error('Document ID or slug is required')
    }

    const client = getLinearClient()
    
    try {
      // Fetch document
      const document = await client.document(args[0])
      
      // Get creator data
      const creator = document.creator ? await document.creator : null
      const project = document.project ? await document.project : null
      
      // Output results
      if (flags.json) {
        console.log(JSON.stringify(document, null, 2))
      } else {
        console.log('')
        console.log(chalk.bold.cyan(document.title))
        console.log(chalk.gray('─'.repeat(50)))
        console.log(`ID: ${document.id}`)
        
        console.log(`Creator: ${creator?.name || 'Unknown'}`)
        
        if (project) {
          console.log(`Project: ${project.name}`)
        }
        
        console.log(`Created: ${formatDate(document.createdAt)}`)
        console.log(`Updated: ${formatDate(document.updatedAt)}`)
        console.log(`URL: ${document.url}`)
        
        console.log('')
        
        if (flags.content && document.content) {
          console.log(chalk.bold('─ Content ─'))
          console.log(document.content)
          console.log('')
        } else if (document.content) {
          // Show preview
          const preview = this.getContentPreview(document.content)
          console.log(chalk.bold('─ Preview ─'))
          console.log(preview)
          console.log('')
          console.log(chalk.gray('Use --content flag to show document content'))
        }
        
        console.log('')
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch document')
    }
  }

  private getContentPreview(content: string): string {
    const maxLength = 200
    const lines = content.split('\n')
    let preview = ''
    let totalLength = 0
    
    for (const line of lines) {
      if (totalLength + line.length > maxLength) {
        const remaining = maxLength - totalLength
        if (remaining > 10) {
          preview += line.slice(0, remaining) + '...'
        } else {
          preview += '...'
        }
        preview += chalk.gray(' (truncated)')
        break
      }
      
      preview += line + '\n'
      totalLength += line.length + 1
    }
    
    return preview.trim()
  }
}