import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('cycle list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      team: vi.fn(),
      teams: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list all cycles for a team', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockCycles = {
      nodes: [
        {
          completedScopeHistory: [5],
          endsAt: '2025-01-14T00:00:00Z',
          id: 'cycle-1',
          name: 'Sprint 1',
          number: 1,
          progress: 0.5,
          scopeHistory: [10],
          startsAt: '2025-01-01T00:00:00Z',
        },
        {
          completedScopeHistory: [2],
          endsAt: '2025-01-28T00:00:00Z',
          id: 'cycle-2',
          name: 'Sprint 2',
          number: 2,
          progress: 0.2,
          scopeHistory: [8],
          startsAt: '2025-01-15T00:00:00Z',
        },
      ],
    }
    
    const mockTeamInstance = {
      cycles: vi.fn().mockResolvedValue(mockCycles),
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const CycleList = (await import('../../../src/commands/cycle/list.js')).default
    const cmd = new CycleList([], {} as any)
    await cmd.runWithFlags({ limit: 50, team: 'ENG', type: 'all' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENG' } },
      first: 1,
    })
    expect(mockClient.team).toHaveBeenCalledWith('team-1')
    expect(mockTeamInstance.cycles).toHaveBeenCalledWith({
      first: 50,
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Sprint 1'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Sprint 2'))
  })

  it('should get current cycle', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockActiveCycle = {
      endsAt: '2025-01-14T00:00:00Z',
      id: 'cycle-current',
      name: 'Current Sprint',
      number: 5,
      progress: 0.7,
      startsAt: '2025-01-01T00:00:00Z',
    }
    
    const mockTeamInstance = {
      activeCycle: mockActiveCycle,
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const CycleList = (await import('../../../src/commands/cycle/list.js')).default
    const cmd = new CycleList([], {} as any)
    await cmd.runWithFlags({ limit: 50, team: 'ENG', type: 'current' })
    
    expect(mockClient.team).toHaveBeenCalledWith('team-1')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Current Sprint'))
  })

  it('should get previous cycles', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockCycles = {
      nodes: [
        {
          endsAt: '2024-12-14T00:00:00Z',
          id: 'cycle-prev',
          name: 'Past Sprint',
          number: 3,
          progress: 1,
          startsAt: '2024-12-01T00:00:00Z',
        },
      ],
    }
    
    const mockTeamInstance = {
      cycles: vi.fn().mockResolvedValue(mockCycles),
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const CycleList = (await import('../../../src/commands/cycle/list.js')).default
    const cmd = new CycleList([], {} as any)
    await cmd.runWithFlags({ limit: 50, team: 'ENG', type: 'previous' })
    
    expect(mockTeamInstance.cycles).toHaveBeenCalledWith({
      filter: { endsAt: { lt: expect.any(String) } },
      first: 50,
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Past Sprint'))
  })

  it('should handle JSON output', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockCycles = {
      nodes: [
        {
          completedScopeHistory: [5],
          endsAt: '2025-01-14T00:00:00Z',
          id: 'cycle-1',
          name: 'Sprint 1',
          number: 1,
          progress: 0.5,
          scopeHistory: [10],
          startsAt: '2025-01-01T00:00:00Z',
        },
      ],
    }
    
    const mockTeamInstance = {
      cycles: vi.fn().mockResolvedValue(mockCycles),
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const CycleList = (await import('../../../src/commands/cycle/list.js')).default
    const cmd = new CycleList([], {} as any)
    await cmd.runWithFlags({ json: true, limit: 50, team: 'ENG', type: 'all' })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        completedScopeHistory: [5],
        endsAt: '2025-01-14T00:00:00Z',
        id: 'cycle-1',
        name: 'Sprint 1',
        number: 1,
        progress: 0.5,
        scopeHistory: [10],
        startsAt: '2025-01-01T00:00:00Z',
      },
    ])
  })

  it('should handle no cycles', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockCycles = {
      nodes: [],
    }
    
    const mockTeamInstance = {
      cycles: vi.fn().mockResolvedValue(mockCycles),
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const CycleList = (await import('../../../src/commands/cycle/list.js')).default
    const cmd = new CycleList([], {} as any)
    await cmd.runWithFlags({ limit: 50, team: 'ENG', type: 'all' })
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No cycles found'))
  })

  it('should throw error if team not found', async () => {
    const mockTeamsByKey = { nodes: [] }
    const mockTeamsByName = { nodes: [] }
    
    mockClient.teams
      .mockResolvedValueOnce(mockTeamsByKey)
      .mockResolvedValueOnce(mockTeamsByName)
    
    const CycleList = (await import('../../../src/commands/cycle/list.js')).default
    const cmd = new CycleList([], {} as any)
    
    await expect(cmd.runWithFlags({ limit: 50, team: 'INVALID', type: 'all' })).rejects.toThrow('Team "INVALID" not found')
  })
})