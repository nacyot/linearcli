import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('user list command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      users: vi.fn(),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should list all users', async () => {
    const mockUsers = {
      nodes: [
        {
          active: true,
          admin: false,
          email: 'john@example.com',
          id: 'user-1',
          name: 'John Doe',
        },
        {
          active: true,
          admin: true,
          email: 'jane@example.com',
          id: 'user-2',
          name: 'Jane Smith',
        },
      ],
    }
    
    mockClient.users.mockResolvedValue(mockUsers)
    
    const UserList = (await import('../../../src/commands/user/list.js')).default
    const cmd = new UserList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(mockClient.users).toHaveBeenCalled()
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('john@example.com'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Jane Smith'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('jane@example.com'))
  })

  it('should handle JSON output', async () => {
    const mockUsers = {
      nodes: [
        {
          active: true,
          admin: false,
          email: 'john@example.com',
          id: 'user-1',
          name: 'John Doe',
        },
      ],
    }
    
    mockClient.users.mockResolvedValue(mockUsers)
    
    const UserList = (await import('../../../src/commands/user/list.js')).default
    const cmd = new UserList([], {} as any)
    await cmd.runWithFlags({ json: true })
    
    const output = JSON.parse(logSpy.mock.calls[0][0])
    expect(output).toEqual([
      {
        active: true,
        admin: false,
        email: 'john@example.com',
        id: 'user-1',
        name: 'John Doe',
      },
    ])
  })

  it('should filter by search query', async () => {
    const mockUsers = {
      nodes: [
        {
          active: true,
          admin: false,
          email: 'john@example.com',
          id: 'user-1',
          name: 'John Doe',
        },
      ],
    }
    
    mockClient.users.mockResolvedValue(mockUsers)
    
    const UserList = (await import('../../../src/commands/user/list.js')).default
    const cmd = new UserList([], {} as any)
    await cmd.runWithFlags({ 'include-archived': false, limit: 50, query: 'john' })
    
    expect(mockClient.users).toHaveBeenCalledWith({
      filter: { 
        or: [
          { name: { containsIgnoreCase: 'john' } },
          { email: { containsIgnoreCase: 'john' } },
        ],
      },
      first: 50,
      includeArchived: false,
    })
  })

  it('should handle no users', async () => {
    const mockUsers = {
      nodes: [],
    }
    
    mockClient.users.mockResolvedValue(mockUsers)
    
    const UserList = (await import('../../../src/commands/user/list.js')).default
    const cmd = new UserList([], {} as any)
    await cmd.runWithFlags({})
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('No users found'))
  })
})