/**
 * Unit tests for medusa-config.ts
 *
 * Validates that the exported Medusa config has the correct module structure
 * for authentication, notifications, and infrastructure. Tests mock loadEnv
 * to avoid file-system access and control env-var values explicitly.
 */

jest.mock('@medusajs/framework/utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const actual = jest.requireActual('@medusajs/framework/utils') as Record<string, unknown>
  return { ...actual, loadEnv: jest.fn() }
})

// Stub out the ESM-only meilisearch package so defineConfig can resolve the
// meilisearch module path without failing on unsupported ES module syntax.
jest.mock('meilisearch', () => ({
  Meilisearch: jest.fn(),
}))

type ConfigModule = { resolve: string; options?: Record<string, unknown> }
type MedusaConfig = {
  projectConfig?: {
    databaseUrl?: string
    redisUrl?: string
    http?: Record<string, unknown>
  }
  // defineConfig transforms the modules array into a keyed object
  modules?: Record<string, ConfigModule>
}

describe('medusa-config', () => {
  const ENV_BACKUP = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...ENV_BACKUP,
      NODE_ENV: 'production',
      DATABASE_URL: 'postgres://test@localhost:5432/test_db',
      REDIS_URL: 'redis://localhost:6379',
      JWT_SECRET: 'test-jwt-secret',
      COOKIE_SECRET: 'test-cookie-secret',
      STORE_CORS: 'http://localhost:3000',
      ADMIN_CORS: 'http://localhost:9000',
      AUTH_CORS: 'http://localhost:3000,http://localhost:9000',
    }
  })

  afterEach(() => {
    process.env = ENV_BACKUP
  })

  function loadConfig(): MedusaConfig {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return (require('../../medusa-config') as { default: MedusaConfig }).default
  }

  function findModule(config: MedusaConfig, resolve: string) {
    return Object.values(config.modules ?? {}).find((m) => m.resolve === resolve)
  }

  // ─── projectConfig ──────────────────────────────────────────────

  describe('projectConfig', () => {
    it('reads DATABASE_URL from env', () => {
      expect(loadConfig().projectConfig?.databaseUrl).toBe('postgres://test@localhost:5432/test_db')
    })

    it('reads REDIS_URL from env', () => {
      expect(loadConfig().projectConfig?.redisUrl).toBe('redis://localhost:6379')
    })

    it('reads JWT_SECRET from env', () => {
      expect(loadConfig().projectConfig?.http?.['jwtSecret']).toBe('test-jwt-secret')
    })

    it('reads COOKIE_SECRET from env', () => {
      expect(loadConfig().projectConfig?.http?.['cookieSecret']).toBe('test-cookie-secret')
    })

    it('falls back to "supersecret" when JWT_SECRET is unset', () => {
      delete process.env['JWT_SECRET']
      expect(loadConfig().projectConfig?.http?.['jwtSecret']).toBe('supersecret')
    })

    it('falls back to "supersecret" when COOKIE_SECRET is unset', () => {
      delete process.env['COOKIE_SECRET']
      expect(loadConfig().projectConfig?.http?.['cookieSecret']).toBe('supersecret')
    })

    it('sets storeCors from STORE_CORS env', () => {
      expect(loadConfig().projectConfig?.http?.['storeCors']).toBe('http://localhost:3000')
    })

    it('sets adminCors from ADMIN_CORS env', () => {
      expect(loadConfig().projectConfig?.http?.['adminCors']).toBe('http://localhost:9000')
    })

    it('sets authCors from AUTH_CORS env — includes both storefront and admin origins', () => {
      const authCors = loadConfig().projectConfig?.http?.['authCors'] as string
      expect(authCors).toContain('http://localhost:3000')
      expect(authCors).toContain('http://localhost:9000')
    })
  })

  // ─── modules ────────────────────────────────────────────────────

  describe('modules', () => {
    it('includes the Redis cache module', () => {
      expect(findModule(loadConfig(), '@medusajs/medusa/cache-redis')).toBeDefined()
    })

    it('includes the Redis event-bus module', () => {
      expect(findModule(loadConfig(), '@medusajs/medusa/event-bus-redis')).toBeDefined()
    })

    it('includes the Redis workflow-engine module', () => {
      expect(findModule(loadConfig(), '@medusajs/medusa/workflow-engine-redis')).toBeDefined()
    })

    it('passes REDIS_URL to cache and event-bus modules', () => {
      const config = loadConfig()
      for (const resolve of ['@medusajs/medusa/cache-redis', '@medusajs/medusa/event-bus-redis']) {
        expect(findModule(config, resolve)?.options?.['redisUrl']).toBe('redis://localhost:6379')
      }
    })

    it('passes REDIS_URL to workflow-engine under redis.url', () => {
      const mod = findModule(loadConfig(), '@medusajs/medusa/workflow-engine-redis')
      const redis = mod?.options?.['redis'] as Record<string, unknown>
      expect(redis?.['url']).toBe('redis://localhost:6379')
    })

    // ─── Auth module ──────────────────────────────────────────────

    describe('auth module', () => {
      it('declares the auth module', () => {
        expect(findModule(loadConfig(), '@medusajs/medusa/auth')).toBeDefined()
      })

      it('configures the emailpass provider', () => {
        const providers = findModule(loadConfig(), '@medusajs/medusa/auth')?.options?.[
          'providers'
        ] as ConfigModule[]
        expect(
          providers?.find((p) => p.resolve === '@medusajs/medusa/auth-emailpass'),
        ).toBeDefined()
      })

      it('assigns emailpass provider the id "emailpass"', () => {
        const providers = findModule(loadConfig(), '@medusajs/medusa/auth')?.options?.[
          'providers'
        ] as ConfigModule[]
        const emailpass = providers?.find((p) => p.resolve === '@medusajs/medusa/auth-emailpass')
        expect((emailpass as Record<string, unknown>)?.['id']).toBe('emailpass')
      })
    })

    // ─── Notification module ──────────────────────────────────────

    describe('notification module', () => {
      it('declares the notification module', () => {
        expect(findModule(loadConfig(), '@medusajs/medusa/notification')).toBeDefined()
      })

      it('configures the local notification provider', () => {
        const providers = findModule(loadConfig(), '@medusajs/medusa/notification')?.options?.[
          'providers'
        ] as ConfigModule[]
        expect(providers?.find((p) => p.resolve === '@medusajs/notification-local')).toBeDefined()
      })

      it('assigns local provider the id "local"', () => {
        const providers = findModule(loadConfig(), '@medusajs/medusa/notification')?.options?.[
          'providers'
        ] as ConfigModule[]
        const local = providers?.find((p) => p.resolve === '@medusajs/notification-local')
        expect((local as Record<string, unknown>)?.['id']).toBe('local')
      })
    })

    // ─── MeiliSearch module ───────────────────────────────────────

    describe('meilisearch module', () => {
      it('is excluded when MEILISEARCH_HOST is not set', () => {
        delete process.env['MEILISEARCH_HOST']
        expect(findModule(loadConfig(), './src/modules/meilisearch')).toBeUndefined()
      })

      it('is included when MEILISEARCH_HOST is set', () => {
        process.env['MEILISEARCH_HOST'] = 'http://127.0.0.1:7700'
        process.env['MEILISEARCH_API_KEY'] = 'test-key'
        expect(findModule(loadConfig(), './src/modules/meilisearch')).toBeDefined()
      })

      it('passes the host option from MEILISEARCH_HOST', () => {
        process.env['MEILISEARCH_HOST'] = 'http://127.0.0.1:7700'
        process.env['MEILISEARCH_API_KEY'] = 'test-key'
        const mod = findModule(loadConfig(), './src/modules/meilisearch')
        expect(mod?.options?.['host']).toBe('http://127.0.0.1:7700')
      })

      it('passes the apiKey option from MEILISEARCH_API_KEY', () => {
        process.env['MEILISEARCH_HOST'] = 'http://127.0.0.1:7700'
        process.env['MEILISEARCH_API_KEY'] = 'test-master-key'
        const mod = findModule(loadConfig(), './src/modules/meilisearch')
        expect(mod?.options?.['apiKey']).toBe('test-master-key')
      })

      it('uses MEILISEARCH_PRODUCT_INDEX_NAME when provided', () => {
        process.env['MEILISEARCH_HOST'] = 'http://127.0.0.1:7700'
        process.env['MEILISEARCH_API_KEY'] = 'test-key'
        process.env['MEILISEARCH_PRODUCT_INDEX_NAME'] = 'custom-products'
        const mod = findModule(loadConfig(), './src/modules/meilisearch')
        expect(mod?.options?.['productIndexName']).toBe('custom-products')
      })

      it('defaults productIndexName to "products" when MEILISEARCH_PRODUCT_INDEX_NAME is unset', () => {
        process.env['MEILISEARCH_HOST'] = 'http://127.0.0.1:7700'
        process.env['MEILISEARCH_API_KEY'] = 'test-key'
        delete process.env['MEILISEARCH_PRODUCT_INDEX_NAME']
        const mod = findModule(loadConfig(), './src/modules/meilisearch')
        expect(mod?.options?.['productIndexName']).toBe('products')
      })
    })
  })
})
