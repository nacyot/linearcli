import { Command, Flags } from '@oclif/core'
import chalk from 'chalk'

import { getLinearClient, hasApiKey } from '../../services/linear.js'
import { formatTable, truncateText, formatDate } from '../../utils/table-formatter.js'

export default class DocumentList extends Command {
  static description = 'List documents in your Linear workspace'
  static examples = [
    '<%= config.bin %> <%= command.id %>',
    '<%= config.bin %> <%= command.id %> --project "Q4 Goals"',
    '<%= config.bin %> <%= command.id %> --creator "John Doe"',
    '<%= config.bin %> <%= command.id %> --query "architecture"',
    '<%= config.bin %> <%= command.id %> --created-at "-P1D" --json',
  ]
  static flags = {
    'created-at': Flags.string({
      description: 'Filter by creation date (ISO-8601 or duration like -P1D)',
    }),
    creator: Flags.string({
      description: 'Filter by creator name or ID',
    }),
    'include-archived': Flags.boolean({
      default: false,
      description: 'Include archived documents',
    }),
    json: Flags.boolean({
      default: false,
      description: 'Output as JSON',
    }),
    limit: Flags.integer({
      default: 50,
      description: 'Number of documents to fetch (max 250)',
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
    query: Flags.string({
      char: 'q',
      description: 'Search query',
    }),
    'updated-at': Flags.string({
      description: 'Filter by update date (ISO-8601 or duration like -P1W)',
    }),
  }

  async run(): Promise<void> {
    const { flags } = await this.parse(DocumentList)
    await this.runWithFlags(flags)
  }

  async runWithFlags(flags: any): Promise<void> {
    // Check API key
    if (!hasApiKey()) {
      throw new Error('No API key configured. Run "lc init" first.')
    }

    const client = getLinearClient()
    
    try {
      // Build filters
      const filter: any = {}
      
      if (flags.project) {
        // Try to resolve project - for now just use name filter
        filter.project = { name: { eqIgnoreCase: flags.project } }
      }
      
      if (flags.creator) {
        // Resolve creator ID
        let creatorId: string | undefined
        
        // Try by email
        if (flags.creator.includes('@')) {
          const users = await client.users({
            filter: { email: { eq: flags.creator } },
            first: 1,
          })
          
          if (users.nodes.length > 0) {
            creatorId = users.nodes[0].id
          }
        }
        
        // Try by name
        if (!creatorId) {
          const users = await client.users({
            filter: { name: { eqIgnoreCase: flags.creator } },
            first: 1,
          })
          
          if (users.nodes.length > 0) {
            creatorId = users.nodes[0].id
          }
        }
        
        // Try as ID
        if (!creatorId && flags.creator.includes('-')) {
          creatorId = flags.creator
        }
        
        if (creatorId) {
          filter.creator = { id: { eq: creatorId } }
        } else {
          console.log(chalk.yellow(`Warning: Creator "${flags.creator}" not found, skipping filter`))
        }
      }
      
      if (flags.query) {
        filter.title = { containsIgnoreCase: flags.query }
      }
      
      if (flags['created-at']) {
        filter.createdAt = { gte: flags['created-at'] }
      }
      
      if (flags['updated-at']) {
        filter.updatedAt = { gte: flags['updated-at'] }
      }
      
      // Build query variables
      const variables: any = {
        first: Math.min(flags.limit || 50, 250),
        includeArchived: flags['include-archived'] || false,
        orderBy: flags['order-by'] || 'updatedAt',
      }
      
      if (Object.keys(filter).length > 0) {
        variables.filter = filter
      }
      
      // Fetch documents
      const documents = await client.documents(variables)
      
      // Ensure we have all required data
      const docsWithData = documents.nodes.map((doc: any) => ({
        ...doc,
        creator: doc.creator || { name: 'Unknown' },
        project: doc.project || null,
      }))
      
      // Output results
      if (flags.json) {
        console.log(JSON.stringify(docsWithData, null, 2))
      } else if (docsWithData.length === 0) {
        console.log(chalk.yellow('No documents found'))
        console.log(chalk.gray('\nPossible reasons:'))
        console.log(chalk.gray('  • Your API token may lack "read:documents" permission'))
        console.log(chalk.gray('  • The Docs feature may be disabled for your organization'))
        console.log(chalk.gray('  • All documents may be archived (try --include-archived)'))
        console.log(chalk.gray('  • No documents match your filter criteria'))
      } else {
        console.log(chalk.cyan(`\nFound ${docsWithData.length} document${docsWithData.length === 1 ? '' : 's'}:`))
        
        const headers = ['Title', 'Creator', 'Project', 'Updated']
        const rows = docsWithData.map((doc: any) => [
          truncateText(doc.title, 40),
          doc.creator.name || 'Unknown',
          doc.project ? truncateText(doc.project.name, 20) : '-',
          formatDate(doc.updatedAt),
        ])
        
        console.log(formatTable({ headers, rows }))
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }

      throw new Error('Failed to fetch documents')
    }
  }
}