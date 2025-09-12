import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('label create command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      createIssueLabel: vi.fn(),
      teams: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should create a label successfully', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', key: 'ENG', name: 'Engineering' }],
    }
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const mockLabelPayload = {
      issueLabel: {
        color: '#FF0000',
        description: null,
        id: 'label-1',
        name: 'bug',
      },
      success: true,
    }
    mockClient.createIssueLabel.mockResolvedValue(mockLabelPayload)
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    await cmd.runWithFlags({
      color: '#FF0000',
      name: 'bug',
      team: 'ENG',
    })
    
    expect(mockClient.createIssueLabel).toHaveBeenCalledWith({
      color: '#FF0000',
      name: 'bug',
      teamId: 'team-1',
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('✓ Label created successfully!'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('bug'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('#FF0000'))
  })

  it('should create a label with description', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', key: 'ENG', name: 'Engineering' }],
    }
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const mockLabelPayload = {
      issueLabel: {
        color: '#00FF00',
        description: 'Feature label',
        id: 'label-2',
        name: 'feature',
      },
      success: true,
    }
    mockClient.createIssueLabel.mockResolvedValue(mockLabelPayload)
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    await cmd.runWithFlags({
      color: '#00FF00',
      description: 'Feature label',
      name: 'feature',
      team: 'ENG',
    })
    
    expect(mockClient.createIssueLabel).toHaveBeenCalledWith({
      color: '#00FF00',
      description: 'Feature label',
      name: 'feature',
      teamId: 'team-1',
    })
  })

  it('should create a workspace label when no team specified', async () => {
    const mockLabelPayload = {
      issueLabel: {
        color: '#0000FF',
        description: null,
        id: 'label-3',
        name: 'global',
      },
      success: true,
    }
    mockClient.createIssueLabel.mockResolvedValue(mockLabelPayload)
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    await cmd.runWithFlags({
      color: '#0000FF',
      name: 'global',
    })
    
    expect(mockClient.createIssueLabel).toHaveBeenCalledWith({
      color: '#0000FF',
      name: 'global',
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('workspace'))
  })

  it('should handle JSON output', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', key: 'ENG', name: 'Engineering' }],
    }
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const mockLabel = {
      color: '#FF0000',
      description: null,
      id: 'label-1',
      name: 'bug',
    }
    const mockLabelPayload = {
      issueLabel: mockLabel,
      success: true,
    }
    mockClient.createIssueLabel.mockResolvedValue(mockLabelPayload)
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    await cmd.runWithFlags({
      color: '#FF0000',
      json: true,
      name: 'bug',
      team: 'ENG',
    })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual(mockLabel)
  })

  it('should validate hex color format', async () => {
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    
    await expect(cmd.runWithFlags({
      color: 'red',
      name: 'test',
      team: 'ENG',
    })).rejects.toThrow('Invalid color format')
    
    await expect(cmd.runWithFlags({
      color: '#GG0000',
      name: 'test',
      team: 'ENG',
    })).rejects.toThrow('Invalid color format')
    
    await expect(cmd.runWithFlags({
      color: '#FF00',
      name: 'test',
      team: 'ENG',
    })).rejects.toThrow('Invalid color format')
  })

  it('should handle team not found', async () => {
    mockClient.teams.mockResolvedValue({ nodes: [] })
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    
    await expect(cmd.runWithFlags({
      color: '#FF0000',
      name: 'test',
      team: 'INVALID',
    })).rejects.toThrow('Team "INVALID" not found')
  })

  it('should handle label creation failure', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', key: 'ENG', name: 'Engineering' }],
    }
    mockClient.teams.mockResolvedValue(mockTeams)
    
    const mockLabelPayload = {
      issueLabel: null,
      success: false,
    }
    mockClient.createIssueLabel.mockResolvedValue(mockLabelPayload)
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    
    await expect(cmd.runWithFlags({
      color: '#FF0000',
      name: 'test',
      team: 'ENG',
    })).rejects.toThrow('Failed to create label')
  })

  it('should handle API errors', async () => {
    const mockTeams = {
      nodes: [{ id: 'team-1', key: 'ENG', name: 'Engineering' }],
    }
    mockClient.teams.mockResolvedValue(mockTeams)
    mockClient.createIssueLabel.mockRejectedValue(new Error('API error'))
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    
    await expect(cmd.runWithFlags({
      color: '#FF0000',
      name: 'test',
      team: 'ENG',
    })).rejects.toThrow('API error')
  })

  it('should check for missing API key', async () => {
    vi.mocked(linearService.hasApiKey).mockReturnValue(false)
    
    const LabelCreate = (await import('../../../src/commands/label/create.js')).default
    const cmd = new LabelCreate([], {} as any)
    
    await expect(cmd.runWithFlags({
      color: '#FF0000',
      name: 'test',
      team: 'ENG',
    })).rejects.toThrow('No API key configured. Run "lc init" first.')
  })
})