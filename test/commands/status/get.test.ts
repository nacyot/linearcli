import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('status get command', () => {
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
      workflowState: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()  
  })

  it('should get workflow state by ID', async () => {
    const mockState = {
      color: '#00ff00',
      description: 'Work is in progress',
      id: 'state-123',
      name: 'In Progress',
      position: 3,
      team: { key: 'ENG', name: 'Engineering' },
      type: 'started',
    }
    mockClient.workflowState.mockResolvedValue(mockState)
    
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    await cmd.runWithArgs(['state-123'], {})
    
    expect(mockClient.workflowState).toHaveBeenCalledWith('state-123')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('In Progress'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('In Progress'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG'))
  })

  it('should handle JSON output', async () => {
    const mockState = {
      color: '#00ff00',
      description: 'Work is in progress',
      id: 'state-123',
      name: 'In Progress',
      position: 3,
      team: { key: 'ENG', name: 'Engineering' },
      type: 'started',
    }
    mockClient.workflowState.mockResolvedValue(mockState)
    
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet(['state-123'], {} as any)
    await cmd.runWithArgs(['state-123'], { json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual(mockState)
  })

  it('should handle state by name and team', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', key: 'ENG', name: 'Engineering' }],
    }
    mockClient.teams.mockResolvedValue(mockTeams)
    
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
          color: '#00ff00',
          description: 'Work is in progress',
          id: 'state-123',
          name: 'In Progress',
          position: 3,
          team: { key: 'ENG', name: 'Engineering' },
          type: 'started',
        },
      ],
    }
    
    const mockTeamInstance = {
      states: vi.fn().mockResolvedValue(mockStates),
    }
    mockClient.team.mockResolvedValue(mockTeamInstance)
    
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    await cmd.runWithArgs([], { name: 'In Progress', team: 'ENG' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENG' } },
      first: 1,
    })
    expect(mockClient.team).toHaveBeenCalledWith('team-1')
    expect(mockTeamInstance.states).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('In Progress'))
  })

  it('should handle state not found', async () => {
    mockClient.workflowState.mockRejectedValue(new Error('Entity not found'))
    
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    
    await expect(cmd.runWithArgs(['invalid-id'], {})).rejects.toThrow('Entity not found')
  })

  it('should require either ID or name+team', async () => {
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    
    await expect(cmd.runWithArgs([], {})).rejects.toThrow('Either provide state ID as argument or use --name and --team flags')
  })

  it('should require team when using name', async () => {
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    
    await expect(cmd.runWithArgs([], { name: 'In Progress' })).rejects.toThrow('Team is required when searching by name')
  })

  it('should check for missing API key', async () => {
    vi.mocked(linearService.hasApiKey).mockReturnValue(false)
    
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    
    await expect(cmd.runWithArgs(['state-123'], {})).rejects.toThrow('No API key configured. Run "lc init" first.')
  })

  it('should display state details properly', async () => {
    const mockState = {
      color: '#ff0000',
      description: 'Task is blocked',
      id: 'state-456',
      name: 'Blocked',
      position: 4,
      team: { key: 'PROJ', name: 'project' },
      type: 'blocked',
    }
    mockClient.workflowState.mockResolvedValue(mockState)
    
    const StatusGet = (await import('../../../src/commands/status/get.js')).default
    const cmd = new StatusGet([], {} as any)
    await cmd.runWithArgs(['state-456'], {})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Blocked'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('blocked'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('#ff0000'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Task is blocked'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('PROJ'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('project'))
  })
})