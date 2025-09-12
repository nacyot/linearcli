import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../../src/services/linear.js'

// Mock the linear service
vi.mock('../../../src/services/linear.js', () => ({
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
}))

describe('user get command', () => {
  let logSpy: any
  let errorSpy: any
  let mockClient: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    // Create mock client
    mockClient = {
      user: vi.fn(),
      users: vi.fn(),
      viewer: Promise.resolve({ id: 'current-user-id' }),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient)
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should get user by ID', async () => {
    const mockUser = {
      active: true,
      admin: false,
      createdAt: '2024-01-01T00:00:00Z',
      email: 'john@example.com',
      id: 'user-1',
      name: 'John Doe',
    }
    
    mockClient.user.mockResolvedValue(mockUser)
    
    const UserGet = (await import('../../../src/commands/user/get.js')).default
    const cmd = new UserGet(['user-1'], {} as any)
    await cmd.runWithArgs('user-1', {})
    
    expect(mockClient.user).toHaveBeenCalledWith('user-1')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('john@example.com'))
  })

  it('should get user by email', async () => {
    const mockUsers = {
      nodes: [{
        active: true,
        admin: false,
        createdAt: '2024-01-01T00:00:00Z',
        email: 'john@example.com',
        id: 'user-1',
        name: 'John Doe',
      }],
    }
    
    mockClient.users.mockResolvedValue(mockUsers)
    
    const UserGet = (await import('../../../src/commands/user/get.js')).default
    const cmd = new UserGet(['john@example.com'], {} as any)
    await cmd.runWithArgs('john@example.com', {})
    
    expect(mockClient.users).toHaveBeenCalledWith({
      filter: { email: { eq: 'john@example.com' } },
      first: 1,
    })
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
  })

  it('should get current user with "me"', async () => {
    const mockUser = {
      active: true,
      admin: true,
      createdAt: '2024-01-01T00:00:00Z',
      email: 'current@example.com',
      id: 'current-user-id',
      name: 'Current User',
    }
    
    mockClient.user.mockResolvedValue(mockUser)
    
    const UserGet = (await import('../../../src/commands/user/get.js')).default
    const cmd = new UserGet(['me'], {} as any)
    await cmd.runWithArgs('me', {})
    
    expect(mockClient.user).toHaveBeenCalledWith('current-user-id')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Current User'))
  })

  it('should handle user not found', async () => {
    mockClient.user.mockResolvedValue(null)
    mockClient.users.mockResolvedValue({ nodes: [] })
    
    const UserGet = (await import('../../../src/commands/user/get.js')).default
    const cmd = new UserGet(['INVALID'], {} as any)
    
    await expect(cmd.runWithArgs('INVALID', {})).rejects.toThrow(/not found/)
  })
})