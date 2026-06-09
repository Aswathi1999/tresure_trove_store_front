import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: './tsconfig.test.json' }],
  },
  testMatch: ['**/src/__tests__/**/*.test.ts'],
  clearMocks: true,
  moduleNameMapper: {
    '@payloadcms/richtext-lexical': '<rootDir>/src/__mocks__/richtext-lexical.ts',
  },
}

export default config
