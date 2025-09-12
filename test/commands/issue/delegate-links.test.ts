import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('issue commands - delegate and links support', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      createIssue: vi.fn(),
      issue: vi.fn(),
      issues: vi.fn(),
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

  describe('issue create with delegate', () => {
    it('should add single delegate by email', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-1', key: 'ENG', name: 'engineering' }],
      }
      mockClient.teams.mockResolvedValue(mockTeams)
      
      const mockUsers = {
        nodes: [{ email: 'alice@example.com', id: 'user-1', name: 'Alice' }],
      }
      mockClient.users.mockResolvedValue(mockUsers)
      
      const mockIssue = {
        issue: {
          id: 'issue-1',
          identifier: 'ENG-100',
          title: 'Test issue',
          url: 'https://linear.app/team/issue/ENG-100',
        },
        success: true,
      }
      mockClient.createIssue.mockResolvedValue(mockIssue)
      
      const IssueCreate = (await import('../../../src/commands/issue/create.js')).default
      const cmd = new IssueCreate([], {} as any)
      await cmd.runWithFlags({
        delegate: 'alice@example.com',
        team: 'ENG',
        title: 'Test issue',
      })
      
      expect(mockClient.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriberIds: ['user-1'],
          teamId: 'team-1',
          title: 'Test issue',
        }),
      )
    })

    it('should add multiple delegates', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-1', key: 'ENG', name: 'engineering' }],
      }
      mockClient.teams.mockResolvedValue(mockTeams)
      
      // Mock multiple user lookups
      mockClient.users
        .mockResolvedValueOnce({ nodes: [{ email: 'alice@example.com', id: 'user-1', name: 'Alice' }] })
        .mockResolvedValueOnce({ nodes: [{ email: 'bob@example.com', id: 'user-2', name: 'Bob' }] })
        .mockResolvedValueOnce({ nodes: [] }) // For name lookup fallback
        .mockResolvedValueOnce({ nodes: [] })
      
      const mockIssue = {
        issue: {
          id: 'issue-1',
          identifier: 'ENG-100',
          title: 'Test issue',
          url: 'https://linear.app/team/issue/ENG-100',
        },
        success: true,
      }
      mockClient.createIssue.mockResolvedValue(mockIssue)
      
      const IssueCreate = (await import('../../../src/commands/issue/create.js')).default
      const cmd = new IssueCreate([], {} as any)
      await cmd.runWithFlags({
        delegate: 'alice@example.com,bob@example.com',
        team: 'ENG',
        title: 'Test issue',
      })
      
      expect(mockClient.createIssue).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriberIds: ['user-1', 'user-2'],
        }),
      )
    })

    it('should warn about unknown delegates', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-1', key: 'ENG', name: 'engineering' }],
      }
      mockClient.teams.mockResolvedValue(mockTeams)
      
      // No users found
      mockClient.users.mockResolvedValue({ nodes: [] })
      
      const mockIssue = {
        issue: {
          id: 'issue-1',
          identifier: 'ENG-100',
          title: 'Test issue',
          url: 'https://linear.app/team/issue/ENG-100',
        },
        success: true,
      }
      mockClient.createIssue.mockResolvedValue(mockIssue)
      
      const IssueCreate = (await import('../../../src/commands/issue/create.js')).default
      const cmd = new IssueCreate([], {} as any)
      await cmd.runWithFlags({
        delegate: 'unknown@example.com',
        team: 'ENG',
        title: 'Test issue',
      })
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: Delegate "unknown@example.com" not found'))
      expect(mockClient.createIssue).toHaveBeenCalledWith(
        expect.not.objectContaining({
          subscriberIds: expect.anything(),
        }),
      )
    })
  })

  describe('issue create with links', () => {
    it('should add single link by issue key', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-1', key: 'ENG', name: 'engineering' }],
      }
      mockClient.teams.mockResolvedValue(mockTeams)
      
      const mockRelatedIssue = {
        id: 'related-1',
        identifier: 'ENG-99',
      }
      mockClient.issue.mockResolvedValue(mockRelatedIssue)
      
      const mockIssue = {
        issue: {
          id: 'issue-1',
          identifier: 'ENG-100',
          title: 'Test issue',
          url: 'https://linear.app/team/issue/ENG-100',
        },
        success: true,
      }
      mockClient.createIssue.mockResolvedValue(mockIssue)
      
      // Add mock for createIssueRelation
      mockClient.createIssueRelation = vi.fn().mockResolvedValue({
        issueRelation: { id: 'relation-1', type: 'related' },
        success: true,
      })
      
      const IssueCreate = (await import('../../../src/commands/issue/create.js')).default
      const cmd = new IssueCreate([], {} as any)
      await cmd.runWithFlags({
        links: 'ENG-99',
        team: 'ENG',
        title: 'Test issue',
      })
      
      expect(mockClient.issue).toHaveBeenCalledWith('ENG-99')
      
      // Should NOT include relatedIssueIds in createIssue
      expect(mockClient.createIssue).toHaveBeenCalledWith(
        expect.not.objectContaining({
          relatedIssueIds: expect.anything(),
        }),
      )
      
      // Should call createIssueRelation
      expect(mockClient.createIssueRelation).toHaveBeenCalledWith({
        issueId: 'issue-1',
        relatedIssueId: 'related-1',
        type: 'related',
      })
    })

    it('should add multiple links after creation', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-1', key: 'ENG', name: 'engineering' }],
      }
      mockClient.teams.mockResolvedValue(mockTeams)
      
      mockClient.issue
        .mockResolvedValueOnce({ id: 'related-1', identifier: 'ENG-97' })
        .mockResolvedValueOnce({ id: 'related-2', identifier: 'ENG-98' })
      
      const mockIssue = {
        issue: {
          id: 'issue-1',
          identifier: 'ENG-100',
          title: 'Test issue',
          url: 'https://linear.app/team/issue/ENG-100',
        },
        success: true,
      }
      mockClient.createIssue.mockResolvedValue(mockIssue)
      
      // Add mock for createIssueRelation
      mockClient.createIssueRelation = vi.fn().mockResolvedValue({
        issueRelation: { id: 'relation-1', type: 'related' },
        success: true,
      })
      
      const IssueCreate = (await import('../../../src/commands/issue/create.js')).default
      const cmd = new IssueCreate([], {} as any)
      await cmd.runWithFlags({
        links: 'ENG-97,ENG-98',
        team: 'ENG',
        title: 'Test issue',
      })
      
      // Should NOT include relatedIssueIds in createIssue
      expect(mockClient.createIssue).toHaveBeenCalledWith(
        expect.not.objectContaining({
          relatedIssueIds: expect.anything(),
        }),
      )
      
      // Should call createIssueRelation for each link
      expect(mockClient.createIssueRelation).toHaveBeenCalledTimes(2)
      expect(mockClient.createIssueRelation).toHaveBeenCalledWith({
        issueId: 'issue-1',
        relatedIssueId: 'related-1',
        type: 'related',
      })
      expect(mockClient.createIssueRelation).toHaveBeenCalledWith({
        issueId: 'issue-1',
        relatedIssueId: 'related-2',
        type: 'related',
      })
      
      // Should log progress
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Creating issue links...'))
    })

    it('should warn about invalid issue links', async () => {
      const mockTeams = {
        nodes: [{ id: 'team-1', key: 'ENG', name: 'engineering' }],
      }
      mockClient.teams.mockResolvedValue(mockTeams)
      
      mockClient.issue.mockRejectedValue(new Error('Issue not found'))
      
      const mockIssue = {
        issue: {
          id: 'issue-1',
          identifier: 'ENG-100',
          title: 'Test issue',
          url: 'https://linear.app/team/issue/ENG-100',
        },
        success: true,
      }
      mockClient.createIssue.mockResolvedValue(mockIssue)
      
      // Add mock for createIssueRelation (should not be called for invalid links)
      mockClient.createIssueRelation = vi.fn()
      
      const IssueCreate = (await import('../../../src/commands/issue/create.js')).default
      const cmd = new IssueCreate([], {} as any)
      await cmd.runWithFlags({
        links: 'INVALID-999',
        team: 'ENG',
        title: 'Test issue',
      })
      
      expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Warning: Issue "INVALID-999" not found'))
      expect(mockClient.createIssue).toHaveBeenCalledWith(
        expect.not.objectContaining({
          relatedIssueIds: expect.anything(),
        }),
      )
      
      // Should not call createIssueRelation for invalid links
      expect(mockClient.createIssueRelation).not.toHaveBeenCalled()
    })
  })

  describe('issue update with delegate and links', () => {
    it('should update delegates', async () => {
      const mockIssue = {
        id: 'issue-1',
        identifier: 'ENG-100',
        team: Promise.resolve({ id: 'team-1', key: 'ENG', name: 'engineering' }),
        update: vi.fn().mockResolvedValue({
          issue: {
            id: 'issue-1',
            identifier: 'ENG-100',
          },
          success: true,
        }),
      }
      mockClient.issue.mockResolvedValue(mockIssue)
      
      const mockUsers = {
        nodes: [{ email: 'charlie@example.com', id: 'user-3', name: 'Charlie' }],
      }
      mockClient.users.mockResolvedValue(mockUsers)
      
      const IssueUpdate = (await import('../../../src/commands/issue/update.js')).default
      const cmd = new IssueUpdate(['ENG-100'], {} as any)
      await cmd.runWithArgs('ENG-100', { delegate: 'charlie@example.com' })
      
      expect(mockIssue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriberIds: ['user-3'],
        }),
      )
    })

    it('should update links', async () => {
      const mockIssue = {
        id: 'issue-1',
        identifier: 'ENG-100',
        team: Promise.resolve({ id: 'team-1', key: 'ENG', name: 'engineering' }),
        update: vi.fn().mockResolvedValue({
          issue: {
            id: 'issue-1',
            identifier: 'ENG-100',
          },
          success: true,
        }),
      }
      mockClient.issue.mockResolvedValueOnce(mockIssue) // First call for main issue
        .mockResolvedValueOnce({ id: 'related-3', identifier: 'ENG-95' }) // Second call for link
      
      const IssueUpdate = (await import('../../../src/commands/issue/update.js')).default
      const cmd = new IssueUpdate(['ENG-100'], {} as any)
      await cmd.runWithArgs('ENG-100', { links: 'ENG-95' })
      
      expect(mockIssue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          relatedIssueIds: ['related-3'],
        }),
      )
    })

    it('should clear delegates with none', async () => {
      const mockIssue = {
        id: 'issue-1',
        identifier: 'ENG-100',
        team: Promise.resolve({ id: 'team-1', key: 'ENG', name: 'engineering' }),
        update: vi.fn().mockResolvedValue({
          issue: {
            id: 'issue-1',
            identifier: 'ENG-100',
          },
          success: true,
        }),
      }
      mockClient.issue.mockResolvedValue(mockIssue)
      
      const IssueUpdate = (await import('../../../src/commands/issue/update.js')).default
      const cmd = new IssueUpdate(['ENG-100'], {} as any)
      await cmd.runWithArgs('ENG-100', { delegate: 'none' })
      
      expect(mockIssue.update).toHaveBeenCalledWith(
        expect.objectContaining({
          subscriberIds: [],
        }),
      )
    })
  })
})