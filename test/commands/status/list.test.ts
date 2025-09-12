import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('status list command', () => {
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

  it('should list workflow states for a team', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockStates = {
      nodes: [
        {
          color: '#888888',
          id: 'state-1',
          name: 'Backlog',
          position: 0,
          type: 'backlog',
        },
        {
          color: '#0000ff',
          id: 'state-2',
          name: 'Todo',
          position: 1,
          type: 'unstarted',
        },
        {
          color: '#ff8800',
          id: 'state-3',
          name: 'In Progress',
          position: 2,
          type: 'started',
        },
        {
          color: '#00ff00',
          id: 'state-4',
          name: 'Done',
          position: 3,
          type: 'completed',
        },
      ],
    }
    
    const mockTeamInstance = {
      states: vi.fn().mockResolvedValue(mockStates),
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const StatusList = (await import('../../../src/commands/status/list.js')).default
    const cmd = new StatusList([], {} as any)
    await cmd.runWithFlags({ team: 'ENG' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENG' } },
      first: 1,
    })
    expect(mockClient.team).toHaveBeenCalledWith('team-1')
    expect(mockTeamInstance.states).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Engineering'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Backlog'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Todo'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('In Progress'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Done'))
  })

  it('should handle team by name', async () => {
    const mockTeamsByKey = { nodes: [] }
    const mockTeamsByName = { nodes: [{ id: 'team-1', name: 'Engineering' }] }
    
    const mockStates = {
      nodes: [
        {
          color: '#888888',
          id: 'state-1',
          name: 'Backlog',
          type: 'backlog',
        },
      ],
    }
    
    const mockTeamInstance = {
      states: vi.fn().mockResolvedValue(mockStates),
    }
    
    mockClient.teams
      .mockResolvedValueOnce(mockTeamsByKey)
      .mockResolvedValueOnce(mockTeamsByName)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const StatusList = (await import('../../../src/commands/status/list.js')).default
    const cmd = new StatusList([], {} as any)
    await cmd.runWithFlags({ team: 'engineering' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENGINEERING' } },
      first: 1,
    })
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { name: { eqIgnoreCase: 'engineering' } },
      first: 1,
    })
    expect(mockClient.team).toHaveBeenCalledWith('team-1')
  })

  it('should handle JSON output', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', name: 'Engineering' }],
    }
    
    const mockStates = {
      nodes: [
        {
          color: '#888888',
          id: 'state-1',
          name: 'Backlog',
          position: 0,
          type: 'backlog',
        },
      ],
    }
    
    const mockTeamInstance = {
      states: vi.fn().mockResolvedValue(mockStates),
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const StatusList = (await import('../../../src/commands/status/list.js')).default
    const cmd = new StatusList([], {} as any)
    await cmd.runWithFlags({ json: true, team: 'ENG' })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        color: '#888888',
        id: 'state-1',
        name: 'Backlog',
        position: 0,
        type: 'backlog',
      },
    ])
  })

  it('should throw error if team not found', async () => {
    const mockTeamsByKey = { nodes: [] }
    const mockTeamsByName = { nodes: [] }
    
    mockClient.teams
      .mockResolvedValueOnce(mockTeamsByKey)
      .mockResolvedValueOnce(mockTeamsByName)
    
    const StatusList = (await import('../../../src/commands/status/list.js')).default
    const cmd = new StatusList([], {} as any)
    
    await expect(cmd.runWithFlags({ team: 'INVALID' })).rejects.toThrow('Team "INVALID" not found')
  })
})