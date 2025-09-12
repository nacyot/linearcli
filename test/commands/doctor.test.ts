import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as linearService from '../../src/services/linear.js'

// Mock the linear service
vi.mock('../../src/services/linear.js', () => ({
  getApiKey: vi.fn(),
  getLinearClient: vi.fn(),
  hasApiKey: vi.fn(),
  testConnection: vi.fn(),
}))

vi.mock('@linear/sdk', () => ({
  LinearClient: vi.fn().mockImplementation(() => ({
    viewer: vi.fn().mockResolvedValue({ 
      email: 'test@example.com',
      id: 'test-user-id',
      name: 'Test User' 
    }),
  })),
}))

describe('doctor command', () => {
  let logSpy: any
  let errorSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    logSpy.mockRestore()
    errorSpy.mockRestore()
  })

  it('should show success when API key is configured and valid', async () => {
    const mockViewer = {
      email: 'john@example.com',
      id: 'user-123',
      name: 'John Doe',
      organization: Promise.resolve({
        name: 'Test Org',
      }),
    }
    
    const mockClient = {
      teams: vi.fn().mockResolvedValue({
        nodes: [{ id: 'team-1' }, { id: 'team-2' }],
      }),
      viewer: Promise.resolve(mockViewer),
    }
    
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getApiKey).mockReturnValue('lin_api_test')
    vi.mocked(linearService.getLinearClient).mockReturnValue(mockClient as any)
    vi.mocked(linearService.testConnection).mockResolvedValue(true)
    
    // Import and run the command
    const Doctor = (await import('../../src/commands/doctor.js')).default
    const cmd = new Doctor([], {} as any)
    await cmd.runWithoutParse()
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('API Key'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('lin_api_'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Connection'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('John Doe'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('john@example.com'))
  })

  it('should show error when no API key is configured', async () => {
    vi.mocked(linearService.hasApiKey).mockReturnValue(false)
    vi.mocked(linearService.getApiKey).mockReturnValue()
    
    const Doctor = (await import('../../src/commands/doctor.js')).default
    const cmd = new Doctor([], {} as any)
    await cmd.runWithoutParse()
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('API Key'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Not configured'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('lc init'))
  })

  it('should show error when API key is invalid', async () => {
    vi.mocked(linearService.hasApiKey).mockReturnValue(true)
    vi.mocked(linearService.getApiKey).mockReturnValue('lin_api_invalid')
    vi.mocked(linearService.testConnection).mockResolvedValue(false)
    
    const Doctor = (await import('../../src/commands/doctor.js')).default
    const cmd = new Doctor([], {} as any)
    await cmd.runWithoutParse()
    
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('API Key'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('lin_api_'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Connection'))
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Failed'))
  })
})