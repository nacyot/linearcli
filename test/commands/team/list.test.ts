import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('team list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      teams: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list all teams', async () => {
    const mockTeams = {
      nodes: [
        {
          description: 'Engineering team',
          id: 'team-1',
          key: 'ENG',
          memberCount: 0,
          name: 'Engineering',
        },
        {
          description: 'Product team',
          id: 'team-2',
          key: 'PROD',
          memberCount: 5,
          name: 'Product',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(mockClient.teams).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Engineering'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('PROD'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Product'))
  })

  it('should handle JSON output', async () => {
    const mockTeams = {
      nodes: [
        {
          description: 'Engineering team',
          id: 'team-1',
          key: 'ENG',
          memberCount: 0,
          name: 'Engineering',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({ json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        description: 'Engineering team',
        id: 'team-1',
        key: 'ENG',
        memberCount: 0,
        name: 'Engineering',
      },
    ])
  })

  it('should filter by search query', async () => {
    const mockTeams = {
      nodes: [
        {
          description: 'Engineering team',
          id: 'team-1',
          key: 'ENG',
          memberCount: 0,
          name: 'Engineering',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({ 'include-archived': false, limit: 50, query: 'eng' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { name: { containsIgnoreCase: 'eng' } },
      first: 50,
      includeArchived: false,
      orderBy: 'updatedAt',
    })
  })

  it('should handle no teams', async () => {
    const mockTeams = {
      nodes: [],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No teams found'))
  })

  it('should order teams by updatedAt by default', async () => {
    const mockTeams = {
      nodes: [
        {
          description: 'Engineering team',
          id: 'team-1',
          key: 'ENG',
          memberCount: 0,
          name: 'Engineering',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      first: 50,
      includeArchived: false,
      orderBy: 'updatedAt',
    })
  })

  it('should allow ordering by different fields', async () => {
    const mockTeams = {
      nodes: [
        {
          description: 'Engineering team',
          id: 'team-1',
          key: 'ENG',
          memberCount: 0,
          name: 'Engineering',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({ 'order-by': 'createdAt' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      first: 50,
      includeArchived: false,
      orderBy: 'createdAt',
    })
  })

  it('should combine orderBy with other filters', async () => {
    const mockTeams = {
      nodes: [
        {
          description: 'Engineering team',
          id: 'team-1',
          key: 'ENG',
          memberCount: 0,
          name: 'Engineering',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamList = (await import('../../../src/commands/team/list.js')).default
    const cmd = new TeamList([], {} as any)
    await cmd.runWithFlags({ 
      limit: 100,
      'order-by': 'createdAt',
      query: 'eng'
    })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { name: { containsIgnoreCase: 'eng' } },
      first: 100,
      includeArchived: false,
      orderBy: 'createdAt',
    })
  })
})