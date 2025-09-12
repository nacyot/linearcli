import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('issue mine command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {}
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list issues assigned to current user', async () => {
    const mockIssues = {
      nodes: [
        {
          id: 'issue-1',
          identifier: 'ENG-123',
          state: { name: 'In Progress', type: 'started' },
          team: { key: 'ENG' },
          title: 'Bug fix',
        },
        {
          id: 'issue-2',
          identifier: 'ENG-124',
          state: { name: 'Todo', type: 'unstarted' },
          team: { key: 'ENG' },
          title: 'New feature',
        },
      ],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    }
    
    const mockViewer = {
      assignedIssues: vi.fn().mockResolvedValue(mockIssues),
    }
    
    mockClient.viewer = Promise.resolve(mockViewer)
    
    const IssueMine = (await import('../../../src/commands/issue/mine.js')).default
    const cmd = new IssueMine([], {} as any)
    await cmd.runWithFlags({ 'include-archived': false, limit: 50 })
    
    expect(mockViewer.assignedIssues).toHaveBeenCalledWith({
      first: 50,
      includeArchived: false,
      orderBy: 'updatedAt',
    })
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG-123'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Bug fix'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG-124'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('New feature'))
  })

  it('should filter by state', async () => {
    const mockIssues = {
      nodes: [
        {
          id: 'issue-1',
          identifier: 'ENG-123',
          state: { name: 'Done', type: 'completed' },
          team: { key: 'ENG' },
          title: 'Bug fix',
        },
      ],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    }
    
    const mockViewer = {
      assignedIssues: vi.fn().mockResolvedValue(mockIssues),
    }
    
    mockClient.viewer = Promise.resolve(mockViewer)
    
    const IssueMine = (await import('../../../src/commands/issue/mine.js')).default
    const cmd = new IssueMine([], {} as any)
    await cmd.runWithFlags({ 'include-archived': false, limit: 50, state: 'Done' })
    
    expect(mockViewer.assignedIssues).toHaveBeenCalledWith({
      filter: {
        state: { name: { eqIgnoreCase: 'Done' } },
      },
      first: 50,
      includeArchived: false,
      orderBy: 'updatedAt',
    })
  })

  it('should handle JSON output', async () => {
    const mockIssues = {
      nodes: [
        {
          id: 'issue-1',
          identifier: 'ENG-123',
          state: { name: 'In Progress', type: 'started' },
          team: { key: 'ENG' },
          title: 'Bug fix',
        },
      ],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    }
    
    const mockViewer = {
      assignedIssues: vi.fn().mockResolvedValue(mockIssues),
    }
    
    mockClient.viewer = Promise.resolve(mockViewer)
    
    const IssueMine = (await import('../../../src/commands/issue/mine.js')).default
    const cmd = new IssueMine([], {} as any)
    await cmd.runWithFlags({ json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        id: 'issue-1',
        identifier: 'ENG-123',
        state: { name: 'In Progress', type: 'started' },
        team: { key: 'ENG' },
        title: 'Bug fix',
      },
    ])
  })

  it('should handle no issues', async () => {
    const mockIssues = {
      nodes: [],
      pageInfo: {
        endCursor: null,
        hasNextPage: false,
      },
    }
    
    const mockViewer = {
      assignedIssues: vi.fn().mockResolvedValue(mockIssues),
    }
    
    mockClient.viewer = Promise.resolve(mockViewer)
    
    const IssueMine = (await import('../../../src/commands/issue/mine.js')).default
    const cmd = new IssueMine([], {} as any)
    await cmd.runWithFlags({})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No issues assigned to you'))
  })
})