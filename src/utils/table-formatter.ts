import chalk from 'chalk'
import stringWidth from 'string-width'
import { getBorderCharacters, table } from 'table'

export interface TableOptions {
  headers: string[]
  rows: string[][]
  showHeader?: boolean
  compact?: boolean
}

/**
 * Format data as a GitHub-style table with proper Unicode/CJK support
 */
export function formatTable(options: TableOptions): string {
  const { headers, rows, showHeader = true, compact = false } = options
  
  // Prepare data with optional header
  const data = showHeader 
    ? [headers.map(h => chalk.bold(h)), ...rows]
    : rows
  
  // GitHub-style configuration (no borders, minimal padding)
  const config = {
    border: getBorderCharacters('void'),
    columnDefault: {
      paddingLeft: 0,
      paddingRight: compact ? 1 : 2,
    },
    drawHorizontalLine: (lineIndex: number, rowCount: number) => {
      // Only draw line after header if showHeader is true
      return showHeader && lineIndex === 1
    },
    singleLine: true,
    columns: headers.map(() => ({
      truncate: 100,
      wrapWord: false,
    })),
  }
  
  // Generate table with proper width calculation
  const output = table(data, config)
  
  // If we want a header separator line (GitHub style), add it manually
  if (showHeader && rows.length > 0) {
    const lines = output.split('\n').filter(line => line.trim())
    const headerLine = lines[0]
    const separatorLine = chalk.gray('─'.repeat(stringWidth(headerLine)))
    
    return [
      lines[0],  // Header
      separatorLine,
      ...lines.slice(1)
    ].join('\n')
  }
  
  return output
}

/**
 * Truncate text to fit within maxWidth, accounting for Unicode width
 */
export function truncateText(text: string, maxWidth: number): string {
  if (stringWidth(text) <= maxWidth) {
    return text
  }
  
  let truncated = ''
  let width = 0
  const ellipsis = '...'
  const ellipsisWidth = 3
  const targetWidth = maxWidth - ellipsisWidth
  
  for (const char of text) {
    const charWidth = stringWidth(char)
    if (width + charWidth > targetWidth) {
      break
    }
    truncated += char
    width += charWidth
  }
  
  return truncated + ellipsis
}

/**
 * Format state with appropriate color
 */
export function formatState(state: any): string {
  if (!state) return chalk.gray('Unknown')
  
  const name = state.name || 'Unknown'
  const type = state.type
  
  // If type is available, use it for coloring
  if (type) {
    switch (type) {
      case 'backlog':
        return chalk.gray(name)
      case 'canceled':
        return chalk.red(name)
      case 'completed':
        return chalk.green(name)
      case 'started':
        return chalk.yellow(name)
      case 'unstarted':
        return chalk.blue(name)
      default:
        return name
    }
  }
  
  // Fallback: color based on common state names
  const lowerName = name.toLowerCase()
  if (lowerName.includes('done') || lowerName.includes('completed') || lowerName.includes('closed')) {
    return chalk.green(name)
  } else if (lowerName.includes('progress') || lowerName.includes('started') || lowerName.includes('active')) {
    return chalk.yellow(name)
  } else if (lowerName.includes('cancel') || lowerName.includes('rejected')) {
    return chalk.red(name)
  } else if (lowerName.includes('todo') || lowerName.includes('backlog') || lowerName.includes('triage')) {
    return chalk.gray(name)
  } else if (lowerName.includes('review') || lowerName.includes('waiting')) {
    return chalk.blue(name)
  }
  
  // Default: no color
  return name
}

/**
 * Format date in a consistent way
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return chalk.gray('-')
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return chalk.gray('-')
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format percentage
 */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return chalk.gray('0%')
  return `${Math.round(value * 100)}%`
}