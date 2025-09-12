import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('team get command', () => {
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

  it('should get team by ID', async () => {
    const mockTeam = {
      cycleEnabled: true,
      description: 'Engineering team',
      id: 'team-1',
      issueCount: 100,
      key: 'ENG',
      memberCount: 10,
      name: 'Engineering',
    }
    
    mockClient.team.mockResolvedValue(mockTeam)
    
    const TeamGet = (await import('../../../src/commands/team/get.js')).default
    const cmd = new TeamGet(['team-1'], {} as any)
    await cmd.runWithArgs('team-1', {})
    
    expect(mockClient.team).toHaveBeenCalledWith('team-1')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Engineering'))
  })

  it('should get team by key', async () => {
    const mockTeams = {
      nodes: [{
        cycleEnabled: true,
        description: 'Engineering team',
        id: 'team-1',
        issueCount: 100,
        key: 'ENG',
        memberCount: 10,
        name: 'Engineering',
      }],
    }
    
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const TeamGet = (await import('../../../src/commands/team/get.js')).default
    const cmd = new TeamGet(['ENG'], {} as any)
    await cmd.runWithArgs('ENG', {})
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENG' } },
      first: 1,
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('ENG'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Engineering'))
  })

  it('should handle JSON output', async () => {
    const mockTeam = {
      cycleEnabled: true,
      description: 'Engineering team',
      id: 'team-1',
      issueCount: 100,
      key: 'ENG',
      memberCount: 10,
      name: 'Engineering',
    }
    
    mockClient.team.mockResolvedValue(mockTeam)
    
    const TeamGet = (await import('../../../src/commands/team/get.js')).default
    const cmd = new TeamGet(['team-1'], {} as any)
    await cmd.runWithArgs('team-1', { json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toHaveProperty('id', 'team-1')
    expect(output).toHaveProperty('key', 'ENG')
    expect(output).toHaveProperty('name', 'Engineering')
  })

  it('should handle team not found', async () => {
    mockClient.team.mockResolvedValue(null)
    mockClient.teams.mockResolvedValue({ nodes: [] })
    
    const TeamGet = (await import('../../../src/commands/team/get.js')).default
    const cmd = new TeamGet(['INVALID'], {} as any)
    
    await expect(cmd.runWithArgs('INVALID', {})).rejects.toThrow(/not found/)
  })
})