import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('comment list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      issue: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list comments for an issue', async () => {
    const mockComments = {
      nodes: [
        {
          body: 'This is the first comment',
          createdAt: '2024-01-01T10:00:00Z',
          id: 'comment-1',
          user: { name: 'John Doe' },
        },
        {
          body: 'This is a reply',
          createdAt: '2024-01-01T11:00:00Z',
          id: 'comment-2',
          user: { name: 'Jane Smith' },
        },
      ],
    }
    
    const mockIssue = {
      comments: vi.fn().mockResolvedValue(mockComments),
      id: 'issue-1',
      identifier: 'ENG-123',
      title: 'Test issue',
    }
    
    mockClient.issue.mockResolvedValue(mockIssue)
    
    const CommentList = (await import('../../../src/commands/comment/list.js')).default
    const cmd = new CommentList([], {} as any)
    await cmd.runWithArgs('ENG-123', {})
    
    expect(mockClient.issue).toHaveBeenCalledWith('ENG-123')
    expect(mockIssue.comments).toHaveBeenCalled()
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG-123'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('This is the first comment'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Jane Smith'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('This is a reply'))
  })

  it('should handle JSON output', async () => {
    const mockComments = {
      nodes: [
        {
          body: 'Test comment',
          createdAt: '2024-01-01T10:00:00Z',
          id: 'comment-1',
          user: { name: 'John Doe' },
        },
      ],
    }
    
    const mockIssue = {
      comments: vi.fn().mockResolvedValue(mockComments),
      id: 'issue-1',
      identifier: 'ENG-123',
      title: 'Test issue',
    }
    
    mockClient.issue.mockResolvedValue(mockIssue)
    
    const CommentList = (await import('../../../src/commands/comment/list.js')).default
    const cmd = new CommentList([], {} as any)
    await cmd.runWithArgs('ENG-123', { json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        body: 'Test comment',
        createdAt: '2024-01-01T10:00:00Z',
        id: 'comment-1',
        user: { name: 'John Doe' },
      },
    ])
  })

  it('should handle no comments', async () => {
    const mockComments = {
      nodes: [],
    }
    
    const mockIssue = {
      comments: vi.fn().mockResolvedValue(mockComments),
      id: 'issue-1',
      identifier: 'ENG-123',
      title: 'Test issue',
    }
    
    mockClient.issue.mockResolvedValue(mockIssue)
    
    const CommentList = (await import('../../../src/commands/comment/list.js')).default
    const cmd = new CommentList([], {} as any)
    await cmd.runWithArgs('ENG-123', {})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No comments found'))
  })

  it('should handle issue not found', async () => {
    mockClient.issue.mockResolvedValue(null)
    
    const CommentList = (await import('../../../src/commands/comment/list.js')).default
    const cmd = new CommentList([], {} as any)
    
    await expect(cmd.runWithArgs('INVALID-999', {})).rejects.toThrow(/not found/)
  })
})