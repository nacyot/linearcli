import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('issue list output formats', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      cycles: vi.fn(),
      issue: vi.fn(),
      issueLabels: vi.fn(),
      issues: vi.fn(),
      projects: vi.fn(),
      team: vi.fn(),
      teams: vi.fn(),
      users: vi.fn(),
      workflowStates: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  describe('JSON output', () => {
    it('should output JSON when json flag is set', async () => {
      const mockIssues = {
        nodes: [
          {
            assignee: Promise.resolve({ name: 'John Doe' }),
            identifier: 'TEST-123',
            state: Promise.resolve({ name: 'In Progress', type: 'started' }),
            title: 'Test issue 1',
          },
          {
            assignee: Promise.resolve(null),
            identifier: 'TEST-124',
            state: Promise.resolve({ name: 'Todo', type: 'unstarted' }),
            title: 'Test issue 2',
          },
        ],
      }
      
      mockClient.issues.mockResolvedValue(mockIssues)
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({ json: true })
      
      // Verify JSON output
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"identifier": "TEST-123"')
      )
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"identifier": "TEST-124"')
      )
      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('"title": "Test issue 1"')
      )
    })

    it('should output formatted table when json flag is false', async () => {
      const mockIssues = {
        nodes: [
          {
            assignee: Promise.resolve({ name: 'John Doe' }),
            identifier: 'TEST-125',
            state: Promise.resolve({ name: 'Done', type: 'completed' }),
            title: 'Completed task',
          },
        ],
      }
      
      mockClient.issues.mockResolvedValue(mockIssues)
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({ json: false })
      
      // Verify table output
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Found 1 issue'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('TEST-125'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Completed task'))
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
      
      // Should not contain JSON
      expect(logSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('"identifier"')
      )
    })
  })

  describe('Include archived', () => {
    it('should include archived issues when flag is set', async () => {
      mockClient.issues.mockResolvedValue({ nodes: [] })
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({ 'include-archived': true })
      
      // Verify includeArchived was passed to API
      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          includeArchived: true,
        })
      )
    })

    it('should exclude archived issues by default', async () => {
      mockClient.issues.mockResolvedValue({ nodes: [] })
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({})
      
      // Verify includeArchived is false by default
      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          includeArchived: false,
        })
      )
    })
  })

  describe('Empty results', () => {
    it('should show appropriate message when no issues found', async () => {
      mockClient.issues.mockResolvedValue({ nodes: [] })
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({})
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No issues found'))
    })

    it('should output empty array in JSON mode when no issues', async () => {
      mockClient.issues.mockResolvedValue({ nodes: [] })
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({ json: true })
      
      expect(logSpy).toHaveBeenCalledWith('[]')
    })
  })

  describe('Order by', () => {
    it('should order by createdAt when specified', async () => {
      mockClient.issues.mockResolvedValue({ nodes: [] })
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({ 'order-by': 'createdAt' })
      
      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: 'createdAt',
        })
      )
    })

    it('should order by updatedAt by default', async () => {
      mockClient.issues.mockResolvedValue({ nodes: [] })
      
      const IssueList = (await import('../../../src/commands/issue/list.js')).default
      const cmd = new IssueList([], {} as any)
      await cmd.runWithoutParse({})
      
      expect(mockClient.issues).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: 'updatedAt',
        })
      )
    })
  })
})