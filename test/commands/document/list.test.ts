import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('document list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      documents: vi.fn(),
      team: vi.fn(),
      teams: vi.fn(),
      user: vi.fn(),
      users: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list all documents', async () => {
    const mockDocuments = {
      nodes: [
        {
          content: 'Document content...',
          createdAt: new Date().toISOString(),
          creator: { name: 'John Doe' },
          id: 'doc-1',
          project: null,
          title: 'API Documentation',
          updatedAt: new Date().toISOString(),
          url: 'https://linear.app/team/doc/doc-1',
        },
        {
          content: 'Another document...',
          createdAt: new Date().toISOString(),
          creator: { name: 'Jane Smith' },
          id: 'doc-2',
          project: { name: 'Q4 Goals' },
          title: 'Project Planning',
          updatedAt: new Date().toISOString(),
          url: 'https://linear.app/team/doc/doc-2',
        },
      ],
    }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(mockClient.documents).toHaveBeenCalledWith({
      first: 50,
      includeArchived: false,
      orderBy: 'updatedAt',
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('API Documentation'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Project Planning'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Jane Smith'))
  })

  it('should filter by project', async () => {
    const mockProjects = {
      nodes: [{ id: 'project-1', name: 'Q4 Goals' }],
    }
    const mockTeams = { nodes: [] }
    
    // Mock project search
    mockClient.teams.mockResolvedValue(mockTeams)
    
    // Create mock with projects method
    mockClient.projects = vi.fn().mockResolvedValue(mockProjects)
    
    const mockDocuments = {
      nodes: [
        {
          content: 'Project doc...',
          createdAt: new Date().toISOString(),
          creator: { name: 'John Doe' },
          id: 'doc-1',
          project: { name: 'Q4 Goals' },
          title: 'Q4 Planning',
          updatedAt: new Date().toISOString(),
          url: 'https://linear.app/team/doc/doc-1',
        },
      ],
    }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({ project: 'Q4 Goals' })
    
    expect(mockClient.documents).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { project: { name: { eqIgnoreCase: 'Q4 Goals' } } },
      }),
    )
  })

  it('should filter by creator', async () => {
    const mockUsers = {
      nodes: [{ email: 'john@example.com', id: 'user-1', name: 'John Doe' }],
    }
    mockClient.users.mockResolvedValue(mockUsers)
    
    const mockDocuments = {
      nodes: [
        {
          content: 'Doc by John...',
          createdAt: new Date().toISOString(),
          creator: { name: 'John Doe' },
          id: 'doc-1',
          project: null,
          title: 'John\'s Document',
          updatedAt: new Date().toISOString(),
          url: 'https://linear.app/team/doc/doc-1',
        },
      ],
    }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({ creator: 'John Doe' })
    
    expect(mockClient.users).toHaveBeenCalledWith({
      filter: { name: { eqIgnoreCase: 'John Doe' } },
      first: 1,
    })
    expect(mockClient.documents).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { creator: { id: { eq: 'user-1' } } },
      }),
    )
  })

  it('should handle search query', async () => {
    const mockDocuments = {
      nodes: [
        {
          content: 'Architecture doc...',
          createdAt: new Date().toISOString(),
          creator: { name: 'John Doe' },
          id: 'doc-1',
          project: null,
          title: 'System Architecture',
          updatedAt: new Date().toISOString(),
          url: 'https://linear.app/team/doc/doc-1',
        },
      ],
    }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({ query: 'architecture' })
    
    expect(mockClient.documents).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: { title: { containsIgnoreCase: 'architecture' } },
      }),
    )
  })

  it('should handle JSON output', async () => {
    const mockDoc = {
      content: 'Document content...',
      createdAt: new Date().toISOString(),
      creator: { name: 'John Doe' },
      id: 'doc-1',
      project: null,
      title: 'API Documentation',
      updatedAt: new Date().toISOString(),
      url: 'https://linear.app/team/doc/doc-1',
    }
    const mockDocuments = {
      nodes: [mockDoc],
    }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({ json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([mockDoc])
  })

  it('should handle date filters', async () => {
    const mockDocuments = { nodes: [] }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({ 
      'created-at': '-P1D',
      'updated-at': '-P1W',
    })
    
    expect(mockClient.documents).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          createdAt: { gte: '-P1D' },
          updatedAt: { gte: '-P1W' },
        },
      }),
    )
  })

  it('should handle limit and ordering', async () => {
    const mockDocuments = { nodes: [] }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({
      limit: 100,
      'order-by': 'createdAt',
    })
    
    expect(mockClient.documents).toHaveBeenCalledWith(
      expect.objectContaining({
        first: 100,
        orderBy: 'createdAt',
      }),
    )
  })

  it('should handle no documents found', async () => {
    const mockDocuments = { nodes: [] }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No documents found'))
  })

  it('should check for missing API key', async () => {
    vi.mocked(linearService.hasApiKey).mockReturnValue(false)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    
    await expect(cmd.runWithFlags({})).rejects.toThrow('No API key configured. Run "lc init" first.')
  })

  it('should include archived when specified', async () => {
    const mockDocuments = { nodes: [] }
    mockClient.documents.mockResolvedValue(mockDocuments)
    
    const DocumentList = (await import('../../../src/commands/document/list.js')).default
    const cmd = new DocumentList([], {} as any)
    await cmd.runWithFlags({ 'include-archived': true })
    
    expect(mockClient.documents).toHaveBeenCalledWith(
      expect.objectContaining({
        includeArchived: true,
      }),
    )
  })
})