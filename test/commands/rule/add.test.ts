import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import RuleAdd from '../../../src/commands/rule/add.js'

vi.mock('node:fs/promises')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

describe('rule add', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should copy LINEAR_CLI_GUIDE.md to specified path', async () => {
    const targetPath = '.rules/linear-cli.md'
    const projectRoot = process.cwd()
    const sourcePath = path.join(__dirname, '../../../docs/LINEAR_CLI_GUIDE.md')
    const destinationPath = path.join(projectRoot, targetPath)
    const mockContent = '# Linear CLI Guide Content'
    
    vi.mocked(fs.readFile).mockResolvedValue(mockContent)
    vi.mocked(fs.mkdir).mockResolvedValue()
    vi.mocked(fs.writeFile).mockResolvedValue()
    
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    await RuleAdd.run([targetPath])
    
    expect(fs.readFile).toHaveBeenCalledWith(sourcePath, 'utf8')
    expect(fs.mkdir).toHaveBeenCalledWith(path.dirname(destinationPath), { recursive: true })
    expect(fs.writeFile).toHaveBeenCalledWith(destinationPath, mockContent)
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('successfully copied'))
    
    consoleLogSpy.mockRestore()
  })

  it('should handle errors when source file not found', async () => {
    const targetPath = '.rules/linear-cli.md'
    
    vi.mocked(fs.readFile).mockRejectedValue(new Error('File not found'))
    
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    await expect(RuleAdd.run([targetPath])).rejects.toThrow('File not found')
    
    consoleErrorSpy.mockRestore()
  })

  it('should require a path argument', async () => {
    await expect(RuleAdd.run([])).rejects.toThrow()
  })
})