import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@medusajs/framework/utils$': '<rootDir>/node_modules/@medusajs/framework/dist/utils',
    '^@medusajs/framework/http$': '<rootDir>/node_modules/@medusajs/framework/dist/http',
    '^@medusajs/framework/types$': '<rootDir>/node_modules/@medusajs/framework/dist/types',
    '^@medusajs/framework$': '<rootDir>/node_modules/@medusajs/framework/dist/index',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { module: 'CommonJS', jsx: 'react-jsx' } }],
  },
  setupFilesAfterEnv: ['<rootDir>/src/admin/__tests__/setup.ts'],
}

export default config
