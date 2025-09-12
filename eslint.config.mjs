import {includeIgnoreFile} from '@eslint/compat'
import oclif from 'eslint-config-oclif'
import prettier from 'eslint-config-prettier'
import path from 'node:path'
import {fileURLToPath} from 'node:url'

const gitignorePath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '.gitignore')

export default [
  includeIgnoreFile(gitignorePath),
  ...oclif,
  prettier,
  // Allow 'any' in test files but not in production code
  {
    files: ['test/**/*.ts', 'test/**/*.test.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      // Also allow unused vars in tests (for mocking)
      '@typescript-eslint/no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^logSpy$|^errorSpy$'
      }]
    }
  },
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'complexity': ['warn', { max: 20 }]
    }
  }
]
