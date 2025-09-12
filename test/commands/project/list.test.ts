import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('project list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      projects: vi.fn(),
      teams: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list all projects', async () => {
    const mockProjects = {
      nodes: [
        {
          description: 'Goals for Q1',
          id: 'project-1',
          name: 'Q1 Goals',
          progress: 0.5,
          state: 'started',
          targetDate: '2025-03-31',
        },
        {
          description: 'New product launch',
          id: 'project-2',
          name: 'Product Launch',
          progress: 0,
          state: 'planned',
          targetDate: '2025-06-30',
        },
      ],
    }
    
    mockClient.projects.mockResolvedValue(mockProjects)
    
    const ProjectList = (await import('../../../src/commands/project/list.js')).default
    const cmd = new ProjectList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(mockClient.projects).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Q1 Goals'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Product Launch'))
  })

  it('should filter by team', async () => {
    const mockTeam = { nodes: [{ id: 'team-1' }] }
    const mockProjects = {
      nodes: [
        {
          description: 'Team specific project',
          id: 'project-1',
          name: 'Team Project',
          progress: 0.3,
          state: 'started',
        },
      ],
    }
    
    mockClient.teams.mockResolvedValue(mockTeam)
    mockClient.projects.mockResolvedValue(mockProjects)
    
    const ProjectList = (await import('../../../src/commands/project/list.js')).default
    const cmd = new ProjectList([], {} as any)
    await cmd.runWithFlags({ 'include-archived': false, limit: 50, team: 'ENG' })
    
    expect(mockClient.teams).toHaveBeenCalledWith({
      filter: { key: { eq: 'ENG' } },
      first: 1,
    })
    expect(mockClient.projects).toHaveBeenCalledWith({
      filter: { teams: { some: { id: { eq: 'team-1' } } } },
      first: 50,
      includeArchived: false,
    })
  })

  it('should handle JSON output', async () => {
    const mockProjects = {
      nodes: [
        {
          description: 'Goals for Q1',
          id: 'project-1',
          name: 'Q1 Goals',
          progress: 0.5,
          state: 'started',
          targetDate: '2025-03-31',
        },
      ],
    }
    
    mockClient.projects.mockResolvedValue(mockProjects)
    
    const ProjectList = (await import('../../../src/commands/project/list.js')).default
    const cmd = new ProjectList([], {} as any)
    await cmd.runWithFlags({ json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        description: 'Goals for Q1',
        id: 'project-1',
        name: 'Q1 Goals',
        progress: 0.5,
        state: 'started',
        targetDate: '2025-03-31',
      },
    ])
  })

  it('should handle no projects', async () => {
    const mockProjects = {
      nodes: [],
    }
    
    mockClient.projects.mockResolvedValue(mockProjects)
    
    const ProjectList = (await import('../../../src/commands/project/list.js')).default
    const cmd = new ProjectList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No projects found'))
  })
})