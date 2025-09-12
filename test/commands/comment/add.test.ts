import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('comment add command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      createComment: vi.fn(),
      issue: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should add a comment to an issue', async () => {
    const mockIssue = {
      id: 'issue-1',
      identifier: 'ENG-123',
      title: 'Test issue',
    }
    
    const mockComment = {
      body: 'This is a new comment',
      createdAt: '2024-01-01T12:00:00Z',
      id: 'comment-new',
    }
    
    const mockPayload = {
      comment: mockComment,
      success: true,
    }
    
    mockClient.issue.mockResolvedValue(mockIssue)
    mockClient.createComment.mockResolvedValue(mockPayload)
    
    const CommentAdd = (await import('../../../src/commands/comment/add.js')).default
    const cmd = new CommentAdd([], {} as any)
    await cmd.runWithArgs('ENG-123', { body: 'This is a new comment' })
    
    expect(mockClient.issue).toHaveBeenCalledWith('ENG-123')
    expect(mockClient.createComment).toHaveBeenCalledWith({
      body: 'This is a new comment',
      issueId: 'issue-1',
    })
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Comment added successfully'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG-123'))
  })

  it('should add a reply to an existing comment', async () => {
    const mockIssue = {
      id: 'issue-1',
      identifier: 'ENG-123',
      title: 'Test issue',
    }
    
    const mockComment = {
      body: 'This is a reply',
      createdAt: '2024-01-01T13:00:00Z',
      id: 'comment-reply',
    }
    
    const mockPayload = {
      comment: mockComment,
      success: true,
    }
    
    mockClient.issue.mockResolvedValue(mockIssue)
    mockClient.createComment.mockResolvedValue(mockPayload)
    
    const CommentAdd = (await import('../../../src/commands/comment/add.js')).default
    const cmd = new CommentAdd([], {} as any)
    await cmd.runWithArgs('ENG-123', { 
      body: 'This is a reply',
      parent: 'comment-1',
    })
    
    expect(mockClient.createComment).toHaveBeenCalledWith({
      body: 'This is a reply',
      issueId: 'issue-1',
      parentId: 'comment-1',
    })
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Comment added successfully'))
  })

  it('should handle issue not found', async () => {
    mockClient.issue.mockResolvedValue(null)
    
    const CommentAdd = (await import('../../../src/commands/comment/add.js')).default
    const cmd = new CommentAdd([], {} as any)
    
    await expect(cmd.runWithArgs('INVALID-999', { body: 'Test' })).rejects.toThrow(/not found/)
  })

  it('should handle comment creation failure', async () => {
    const mockIssue = {
      id: 'issue-1',
      identifier: 'ENG-123',
      title: 'Test issue',
    }
    
    const mockPayload = {
      success: false,
    }
    
    mockClient.issue.mockResolvedValue(mockIssue)
    mockClient.createComment.mockResolvedValue(mockPayload)
    
    const CommentAdd = (await import('../../../src/commands/comment/add.js')).default
    const cmd = new CommentAdd([], {} as any)
    
    await expect(cmd.runWithArgs('ENG-123', { body: 'Test' })).rejects.toThrow(/Failed to add comment/)
  })

  it('should require body', async () => {
    const CommentAdd = (await import('../../../src/commands/comment/add.js')).default
    const cmd = new CommentAdd([], {} as any)
    
    await expect(cmd.runWithArgs('ENG-123', {})).rejects.toThrow(/Comment body is required/)
  })
})