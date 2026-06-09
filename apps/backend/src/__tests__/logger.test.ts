/**
 * Unit tests for src/lib/logger.ts
 *
 * Validates that the Winston logger is created with the correct log level
 * and transports based on the NODE_ENV environment variable.
 */

import { transports as WinstonTransports } from 'winston'

describe('logger', () => {
  const ENV_BACKUP = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...ENV_BACKUP }
  })

  afterEach(() => {
    process.env = ENV_BACKUP
  })

  function loadLogger() {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require('../lib/logger') as { logger: import('winston').Logger }).logger
  }

  it('exports a logger instance', () => {
    const { logger } = require('../lib/logger') as {
      logger: import('winston').Logger
    }
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
    expect(typeof logger.error).toBe('function')
    expect(typeof logger.warn).toBe('function')
    expect(typeof logger.debug).toBe('function')
  })

  it('uses "debug" log level in development', () => {
    process.env['NODE_ENV'] = 'development'
    const logger = loadLogger()
    expect(logger.level).toBe('debug')
  })

  it('uses "info" log level in production', () => {
    process.env['NODE_ENV'] = 'production'
    const logger = loadLogger()
    expect(logger.level).toBe('info')
  })

  it('uses "debug" log level in test environment (non-production)', () => {
    process.env['NODE_ENV'] = 'test'
    const logger = loadLogger()
    expect(logger.level).toBe('debug')
  })

  it('has exactly one Console transport', () => {
    const logger = loadLogger()
    const consoleTransports = logger.transports.filter(
      (t) => t instanceof WinstonTransports.Console,
    )
    expect(consoleTransports).toHaveLength(1)
  })

  it('does not write to file transports', () => {
    const logger = loadLogger()
    const fileTransports = logger.transports.filter((t) => t instanceof WinstonTransports.File)
    expect(fileTransports).toHaveLength(0)
  })
})
