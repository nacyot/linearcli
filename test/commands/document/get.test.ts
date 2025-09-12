import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('document get command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      document: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should get document by ID', async () => {
    const mockDocument = {
      content: '# API Documentation\n\nThis is the content of the document with **markdown**.',
      createdAt: '2025-01-15T10:00:00Z',
      creator: { name: 'John Doe' },
      id: 'doc-123',
      project: { name: 'Q4 Goals' },
      title: 'API Documentation',
      updatedAt: '2025-01-20T15:30:00Z',
      url: 'https://linear.app/team/doc/api-docs-abc123',
    }
    mockClient.document.mockResolvedValue(mockDocument)
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    await cmd.runWithArgs(['doc-123'], {})
    
    expect(mockClient.document).toHaveBeenCalledWith('doc-123')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('API Documentation'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Q4 Goals'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('# API Documentation'))
  })

  it('should get document by slug', async () => {
    const mockDocument = {
      content: 'Document content here',
      createdAt: '2025-01-15T10:00:00Z',
      creator: { name: 'Jane Smith' },
      id: 'doc-456',
      project: null,
      slug: 'my-awesome-doc',
      title: 'My Awesome Document',
      updatedAt: '2025-01-20T15:30:00Z',
      url: 'https://linear.app/team/doc/my-awesome-doc',
    }
    mockClient.document.mockResolvedValue(mockDocument)
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    await cmd.runWithArgs(['my-awesome-doc'], {})
    
    expect(mockClient.document).toHaveBeenCalledWith('my-awesome-doc')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('My Awesome Document'))
  })

  it('should handle JSON output', async () => {
    const mockDocument = {
      content: '# Test Document\n\nContent here.',
      createdAt: '2025-01-15T10:00:00Z',
      creator: { name: 'John Doe' },
      id: 'doc-789',
      project: null,
      title: 'Test Document',
      updatedAt: '2025-01-20T15:30:00Z',
      url: 'https://linear.app/team/doc/test-doc',
    }
    mockClient.document.mockResolvedValue(mockDocument)
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    await cmd.runWithArgs(['doc-789'], { json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual(mockDocument)
  })

  it('should display document without project', async () => {
    const mockDocument = {
      content: 'Standalone document content',
      createdAt: '2025-01-15T10:00:00Z',
      creator: { name: 'Alice Brown' },
      id: 'doc-999',
      project: null,
      title: 'Standalone Document',
      updatedAt: '2025-01-20T15:30:00Z',
      url: 'https://linear.app/team/doc/standalone',
    }
    mockClient.document.mockResolvedValue(mockDocument)
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    await cmd.runWithArgs(['doc-999'], {})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Standalone Document'))
    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('Project:'))
  })

  it('should handle document not found', async () => {
    mockClient.document.mockRejectedValue(new Error('Document not found'))
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    
    await expect(cmd.runWithArgs(['invalid-id'], {})).rejects.toThrow('Document not found')
  })

  it('should require document ID', async () => {
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    
    await expect(cmd.runWithArgs([], {})).rejects.toThrow('Document ID or slug is required')
  })

  it('should check for missing API key', async () => {
    vi.mocked(linearService.hasApiKey).mockReturnValue(false)
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    
    await expect(cmd.runWithArgs(['doc-123'], {})).rejects.toThrow('No API key configured. Run "lc init" first.')
  })

  it('should show content only when requested', async () => {
    const mockDocument = {
      content: '# Long Document\n\nThis is a very long document content that should not be displayed by default.',
      createdAt: '2025-01-15T10:00:00Z',
      creator: { name: 'John Doe' },
      id: 'doc-long',
      project: null,
      title: 'Long Document',
      updatedAt: '2025-01-20T15:30:00Z',
      url: 'https://linear.app/team/doc/long-doc',
    }
    mockClient.document.mockResolvedValue(mockDocument)
    
    // Without --content flag
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    await cmd.runWithArgs(['doc-long'], {})
    
    // Should show preview but not the specific text that identifies it as "very long"
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('─ Preview ─'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Use --content flag to show document content'))
    
    // Clear logs
    logSpy.mockClear()
    
    // With --content flag
    await cmd.runWithArgs(['doc-long'], { content: true })
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('This is a very long document'))
  })

  it('should truncate long content preview', async () => {
    const longContent = 'A'.repeat(500)
    const mockDocument = {
      content: longContent,
      createdAt: '2025-01-15T10:00:00Z',
      creator: { name: 'John Doe' },
      id: 'doc-huge',
      project: null,
      title: 'Huge Document',
      updatedAt: '2025-01-20T15:30:00Z',
      url: 'https://linear.app/team/doc/huge-doc',
    }
    mockClient.document.mockResolvedValue(mockDocument)
    
    const DocumentGet = (await import('../../../src/commands/document/get.js')).default
    const cmd = new DocumentGet([], {} as any)
    await cmd.runWithArgs(['doc-huge'], {})
    
    // Should show truncated preview
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('...'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('(truncated)'))
  })
})