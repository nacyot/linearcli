import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('label list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      issueLabels: vi.fn(),
      teams: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list all labels', async () => {
    const mockLabels = {
      nodes: [
        {
          color: '#ff0000',
          description: 'Bug reports',
          id: 'label-1',
          name: 'Bug',
        },
        {
          color: '#00ff00',
          description: 'Feature requests',
          id: 'label-2',
          name: 'Feature',
        },
      ],
    }
    
    mockClient.issueLabels.mockResolvedValue(mockLabels)
    
    const LabelList = (await import('../../../src/commands/label/list.js')).default
    const cmd = new LabelList([], {} as any)
    await cmd.runWithFlags({ limit: 50 })
    
    expect(mockClient.issueLabels).toHaveBeenCalledWith({
      first: 50,
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Bug'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Feature'))
  })

  it('should filter by team', async () => {
    const mockTeam = { nodes: [{ id: 'team-1' }] }
    const mockLabels = {
      nodes: [
        {
          color: '#0000ff',
          id: 'label-1',
          name: 'Team Label',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeam)
    mockClient.issueLabels.mockResolvedValue(mockLabels)
    
    const LabelList = (await import('../../../src/commands/label/list.js')).default
    const cmd = new LabelList([], {} as any)
    await cmd.runWithFlags({ limit: 50, team: 'ENG' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENG' } },
      first: 1,
    })
    expect(mockClient.issueLabels).toHaveBeenCalledWith({
      filter: { team: { id: { eq: 'team-1' } } },
      first: 50,
    })
  })

  it('should handle JSON output', async () => {
    const mockLabels = {
      nodes: [
        {
          color: '#ff0000',
          description: 'Bug reports',
          id: 'label-1',
          name: 'Bug',
        },
      ],
    }
    
    mockClient.issueLabels.mockResolvedValue(mockLabels)
    
    const LabelList = (await import('../../../src/commands/label/list.js')).default
    const cmd = new LabelList([], {} as any)
    await cmd.runWithFlags({ json: true, limit: 50 })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        color: '#ff0000',
        description: 'Bug reports',
        id: 'label-1',
        name: 'Bug',
      },
    ])
  })

  it('should handle no labels', async () => {
    const mockLabels = {
      nodes: [],
    }
    
    mockClient.issueLabels.mockResolvedValue(mockLabels)
    
    const LabelList = (await import('../../../src/commands/label/list.js')).default
    const cmd = new LabelList([], {} as any)
    await cmd.runWithFlags({ limit: 50 })
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No labels found'))
  })
})