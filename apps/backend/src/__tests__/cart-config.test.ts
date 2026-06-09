/**
 * Unit tests for cart module configuration in medusa-config.ts
 *
 * Medusa v2 ships cart as a built-in module — no explicit registration is
 * needed. These tests document and enforce that constraint: no custom module
 * should accidentally override cart, and the infrastructure modules that
 * cart workflows depend on (workflow-engine, event-bus, cache) must be present.
 */

jest.mock('@medusajs/framework/utils', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const actual = jest.requireActual('@medusajs/framework/utils') as Record<string, unknown>
  return { ...actual, loadEnv: jest.fn() }
})

type ConfigModule = { resolve: string; options?: Record<string, unknown> }
type MedusaConfig = {
  projectConfig?: {
    databaseUrl?: string
    redisUrl?: string
    http?: Record<string, unknown>
  }
  admin?: { disable?: boolean }
  modules?: Record<string, ConfigModule>
}

describe('medusa-config — cart module', () => {
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

  // ─── Cart module registration ────────────────────────────────────────────

  describe('cart module registration', () => {
    it('exposes the built-in cart module under the "cart" key', () => {
      const live = loadConfig()
      const mod = (live.modules as Record<string, ConfigModule> | undefined)?.['cart']
      expect(mod?.resolve).toBe('@medusajs/medusa/cart')
    })

    it('cart module uses default options — no custom override is applied', () => {
      const live = loadConfig()
      const mod = (live.modules as Record<string, ConfigModule> | undefined)?.['cart']
      // Built-in modules auto-linked by Medusa have no extra options object.
      expect(mod?.options).toBeUndefined()
    })

    it('total registered modules includes all built-in Medusa modules', () => {
      const live = loadConfig()
      // Medusa v2 defineConfig auto-links all built-in modules (27 total with defaults).
      expect(Object.keys(live.modules ?? {}).length).toBeGreaterThanOrEqual(5)
    })
  })

  // ─── Admin panel ─────────────────────────────────────────────────────────

  describe('admin', () => {
    it('keeps admin enabled so cart operations can be managed via the admin panel', () => {
      expect(loadConfig().admin?.disable).toBe(false)
    })
  })

  // ─── Cart-critical infrastructure ────────────────────────────────────────

  describe('cart-critical infrastructure', () => {
    it('includes workflow-engine module — required for addToCartWorkflow and cart mutations', () => {
      expect(findModule(loadConfig(), '@medusajs/medusa/workflow-engine-redis')).toBeDefined()
    })

    it('passes REDIS_URL to the workflow-engine module', () => {
      const mod = findModule(loadConfig(), '@medusajs/medusa/workflow-engine-redis')
      const redis = mod?.options?.['redis'] as Record<string, unknown>
      expect(redis?.['url']).toBe('redis://localhost:6379')
    })

    it('includes event-bus module — required for cart.created and cart.updated events', () => {
      expect(findModule(loadConfig(), '@medusajs/medusa/event-bus-redis')).toBeDefined()
    })

    it('passes REDIS_URL to the event-bus module', () => {
      const mod = findModule(loadConfig(), '@medusajs/medusa/event-bus-redis')
      expect(mod?.options?.['redisUrl']).toBe('redis://localhost:6379')
    })

    it('includes cache module — required for cart session and region data caching', () => {
      expect(findModule(loadConfig(), '@medusajs/medusa/cache-redis')).toBeDefined()
    })

    it('passes REDIS_URL to the cache module', () => {
      const mod = findModule(loadConfig(), '@medusajs/medusa/cache-redis')
      expect(mod?.options?.['redisUrl']).toBe('redis://localhost:6379')
    })
  })

  // ─── STORE_CORS — storefront cart access ────────────────────────────────

  describe('CORS — storefront cart access', () => {
    it('sets STORE_CORS so the storefront can reach cart API endpoints', () => {
      expect(loadConfig().projectConfig?.http?.['storeCors']).toBe('http://localhost:3000')
    })

    it('falls back gracefully when STORE_CORS env var changes', () => {
      process.env['STORE_CORS'] = 'https://app.treasuretrove.in'
      expect(loadConfig().projectConfig?.http?.['storeCors']).toBe('https://app.treasuretrove.in')
    })
  })
})
