import { LinearClient } from '@linear/sdk'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// 테스트할 서비스
import { clearApiKey, getApiKey, getLinearClient, setApiKey } from '../../src/services/linear.js'

vi.mock('@linear/sdk', () => ({
  LinearClient: vi.fn().mockImplementation(() => ({
    viewer: vi.fn().mockResolvedValue({ id: 'test-user-id' }),
  })),
}))

describe('Linear Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // 환경변수 초기화
    delete process.env.LINEAR_API_KEY
    delete process.env.LINEAR_CLI_KEY
    // 저장된 설정 초기화
    clearApiKey()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getLinearClient', () => {
    it('should create a LinearClient with API key from environment', () => {
      process.env.LINEAR_API_KEY = 'test-api-key'
      
      const client = getLinearClient()
      
      expect(LinearClient).toHaveBeenCalledWith({ apiKey: 'test-api-key' })
      expect(client).toBeDefined()
    })

    it('should create a LinearClient with stored API key when env is not set', () => {
      // 저장된 키를 사용하는 케이스는 setApiKey 구현 후 테스트
      setApiKey('stored-api-key')
      
      getLinearClient()
      
      expect(LinearClient).toHaveBeenCalledWith({ apiKey: 'stored-api-key' })
    })

    it('should throw error when no API key is available', () => {
      expect(() => getLinearClient()).toThrow(/API key/)
    })
  })

  describe('API Key Management', () => {
    it('should store and retrieve API key', () => {
      const testKey = 'test-api-key-123'
      
      setApiKey(testKey)
      const retrievedKey = getApiKey()
      
      expect(retrievedKey).toBe(testKey)
    })

    it('should prioritize environment variable over stored key', () => {
      process.env.LINEAR_API_KEY = 'env-key'
      setApiKey('stored-key')
      
      const key = getApiKey()
      
      expect(key).toBe('env-key')
    })
  })
})