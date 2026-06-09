/**
 * Unit tests for src/api/middlewares.ts
 *
 * Validates the store product request logging middleware — route matcher,
 * debug log message (query params, publishable key presence), and next() call.
 * Also verifies the Razorpay webhook raw-body preservation route is registered.
 * The Medusa framework and logger are mocked so no real HTTP server starts.
 */

type Req = {
  query: Record<string, unknown>
  headers: Record<string, string | undefined>
  scope: { resolve: jest.Mock }
}

type ContactReq = {
  body: Record<string, unknown> | null
  scope: { resolve: jest.Mock }
}
type Res = Record<string, never>
type Next = jest.Mock

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

type RouteEntry = {
  matcher: string
  middlewares?: ((req: Req, res: Res, next: Next) => void)[]
  bodyParser?: { preserveRawBody?: boolean }
}

type MiddlewareConfig = { routes: RouteEntry[] }

let capturedConfig: MiddlewareConfig | null = null

// Read capturedConfig through an explicitly-typed accessor. Inside the helper
// functions below we reset `capturedConfig = null` and then re-populate it via
// require() (through the jest.mock above) — a side effect TS can't see, so it
// narrows the variable back to `null`/`never`. The declared return type here
// re-widens it so `.routes` access type-checks.
function loadedConfig(): MiddlewareConfig | null {
  return capturedConfig
}

jest.mock('@medusajs/medusa', () => ({
  defineMiddlewares: jest.fn((config: MiddlewareConfig) => {
    capturedConfig = config
    return config
  }),
}))

jest.mock('@medusajs/framework/utils', () => ({
  ContainerRegistrationKeys: { LOGGER: 'logger', QUERY: 'query' },
  Modules: { PRODUCT: 'product' },
}))

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeReq(query: Record<string, unknown> = {}, headers: Record<string, string> = {}): Req {
  return {
    query,
    headers,
    scope: { resolve: jest.fn(() => mockLogger) },
  }
}

function makeRes(): Res {
  return {} as Res
}

function loadProductsHandler(): (req: Req, res: Res, next: Next) => void {
  jest.resetModules()
  capturedConfig = null
  require('../api/middlewares')

  const handler = loadedConfig()?.routes?.[0]?.middlewares?.[0]
  if (typeof handler !== 'function') throw new Error('Products middleware handler not found')
  return handler
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('store products middleware', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    capturedConfig = null
  })

  // ─── Route registration ─────────────────────────────────────────────────

  describe('route registration', () => {
    it('calls defineMiddlewares with a routes array', () => {
      const { defineMiddlewares } = require('@medusajs/medusa') as typeof import('@medusajs/medusa')
      require('../api/middlewares')
      expect(defineMiddlewares).toHaveBeenCalledTimes(1)
      const config = (defineMiddlewares as jest.Mock).mock.calls[0][0] as { routes: unknown[] }
      expect(Array.isArray(config.routes)).toBe(true)
    })

    it('registers a route entry for each configured matcher', () => {
      require('../api/middlewares')
      const matchers = (capturedConfig?.routes ?? []).map((r: { matcher?: string }) => r.matcher)
      expect(matchers).toEqual(
        expect.arrayContaining([
          '/store/products*',
          '/webhooks/razorpay',
          '/admin/products/import',
          '/admin/products',
          '/admin/products/*/variants',
          '/admin/products/*/variants/batch',
          '/admin/products/*/variants/*/inventory-items',
          '/admin/collections',
          '/admin/product-categories',
          '/store/contact',
          '/store/products/*/reviews',
        ]),
      )
    })

    it('first route matcher is "/store/products*"', () => {
      require('../api/middlewares')
      expect(capturedConfig?.routes?.[0]?.matcher).toBe('/store/products*')
    })

    it('attaches exactly one middleware function to the products route', () => {
      require('../api/middlewares')
      const middlewares = capturedConfig?.routes?.[0]?.middlewares
      expect(middlewares).toHaveLength(1)
      expect(typeof middlewares?.[0]).toBe('function')
    })

    it('second route matcher is "/webhooks/razorpay"', () => {
      require('../api/middlewares')
      expect(capturedConfig?.routes?.[1]?.matcher).toBe('/webhooks/razorpay')
    })

    it('Razorpay route preserves raw body', () => {
      require('../api/middlewares')
      expect(capturedConfig?.routes?.[1]?.bodyParser?.preserveRawBody).toBe(true)
    })
  })

  // ─── Logging behaviour ──────────────────────────────────────────────────

  describe('logging', () => {
    it('resolves the logger from the Medusa container', () => {
      const handler = loadProductsHandler()
      const req = makeReq()
      handler(req, makeRes(), jest.fn())
      expect(req.scope.resolve).toHaveBeenCalledWith('logger')
    })

    it('calls logger.debug once per request', () => {
      const handler = loadProductsHandler()
      handler(makeReq(), makeRes(), jest.fn())
      expect(mockLogger.debug).toHaveBeenCalledTimes(1)
    })

    it('log message starts with "[store] GET /store/products"', () => {
      const handler = loadProductsHandler()
      handler(makeReq(), makeRes(), jest.fn())
      const [msg] = mockLogger.debug.mock.calls[0] as [string]
      expect(msg).toMatch(/^\[store\] GET \/store\/products/)
    })

    it('log message includes serialized query params', () => {
      const handler = loadProductsHandler()
      const query = { limit: '10', offset: '0' }
      handler(makeReq(query), makeRes(), jest.fn())
      const [msg] = mockLogger.debug.mock.calls[0] as [string]
      expect(msg).toContain(JSON.stringify(query))
    })

    it('log message includes "present" when x-publishable-api-key header is set', () => {
      const handler = loadProductsHandler()
      handler(makeReq({}, { 'x-publishable-api-key': 'pk_test_123' }), makeRes(), jest.fn())
      const [msg] = mockLogger.debug.mock.calls[0] as [string]
      expect(msg).toContain('present')
    })

    it('log message includes "missing" when x-publishable-api-key header is absent', () => {
      const handler = loadProductsHandler()
      handler(makeReq({}, {}), makeRes(), jest.fn())
      const [msg] = mockLogger.debug.mock.calls[0] as [string]
      expect(msg).toContain('missing')
    })

    it('log message includes "missing" when header value is an empty string', () => {
      const handler = loadProductsHandler()
      handler(makeReq({}, { 'x-publishable-api-key': '' }), makeRes(), jest.fn())
      const [msg] = mockLogger.debug.mock.calls[0] as [string]
      expect(msg).toContain('missing')
    })

    it('logs an empty query object when no query params are present', () => {
      const handler = loadProductsHandler()
      handler(makeReq({}), makeRes(), jest.fn())
      const [msg] = mockLogger.debug.mock.calls[0] as [string]
      expect(msg).toContain(JSON.stringify({}))
    })
  })

  // ─── Import route registration ────────────────────────────────────────────

  describe('import route registration', () => {
    it('third route matcher is "/admin/products/import"', () => {
      require('../api/middlewares')
      expect(capturedConfig?.routes?.[2]?.matcher).toBe('/admin/products/import')
    })

    it('disables body parser for the import route', () => {
      require('../api/middlewares')
      expect(capturedConfig?.routes?.[2]?.bodyParser).toBe(false)
    })
  })

  // ─── Contact route registration ──────────────────────────────────────────

  describe('contact route registration', () => {
    const contactRoute = () =>
      capturedConfig?.routes?.find((r: { matcher?: string }) => r.matcher === '/store/contact')

    it('registers a "/store/contact" route', () => {
      require('../api/middlewares')
      expect(contactRoute()?.matcher).toBe('/store/contact')
    })

    it('attaches exactly one middleware function to the contact route', () => {
      require('../api/middlewares')
      const middlewares = contactRoute()?.middlewares
      expect(middlewares).toHaveLength(1)
      expect(typeof middlewares?.[0]).toBe('function')
    })
  })

  // ─── next() call ────────────────────────────────────────────────────────

  describe('next()', () => {
    it('always calls next() to pass control to the next handler', () => {
      const handler = loadProductsHandler()
      const next = jest.fn()
      handler(makeReq(), makeRes(), next)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('calls next() with no arguments (does not pass an error)', () => {
      const handler = loadProductsHandler()
      const next = jest.fn()
      handler(makeReq(), makeRes(), next)
      expect(next).toHaveBeenCalledWith()
    })

    it('calls next() even when query params are complex', () => {
      const handler = loadProductsHandler()
      const next = jest.fn()
      handler(
        makeReq({
          limit: '20',
          offset: '40',
          order: '-created_at',
          'collection_id[]': ['col_01', 'col_02'],
          'tag_id[]': ['tag_teak', 'tag_oak'],
          region_id: 'reg_01',
          currency_code: 'INR',
        }),
        makeRes(),
        next,
      )
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})

// ─── Contact sanitization middleware ─────────────────────────────────────────

function makeContactReq(body: Record<string, unknown> | null): ContactReq {
  return {
    body,
    scope: { resolve: jest.fn(() => mockLogger) },
  }
}

function loadContactHandler(): (req: ContactReq, res: Res, next: Next) => void {
  jest.resetModules()
  capturedConfig = null
  require('../api/middlewares')

  const route = loadedConfig()?.routes?.find(
    (r: { matcher?: string }) => r.matcher === '/store/contact',
  )
  const handler = route?.middlewares?.[0]
  if (typeof handler !== 'function') throw new Error('Contact sanitization handler not found')
  return handler as unknown as (req: ContactReq, res: Res, next: Next) => void
}

describe('contact sanitization middleware', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    capturedConfig = null
  })

  // ─── HTML stripping ───────────────────────────────────────────────────────

  describe('HTML stripping', () => {
    it('strips HTML tags from the name field', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ name: '<b>John</b>' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).name).toBe('John')
    })

    it('strips an <img> tag from the message field', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ message: 'Hello <img src="x" onerror="evil()"/> world' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).message).toBe('Hello  world')
    })

    it('strips multiple tags from the same field', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ name: '<b><i>John</i></b>' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).name).toBe('John')
    })

    it('leaves a clean string unchanged', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ name: 'John Doe' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).name).toBe('John Doe')
    })
  })

  // ─── Whitespace trimming ──────────────────────────────────────────────────

  describe('whitespace trimming', () => {
    it('trims leading whitespace from a string field', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ name: '   John' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).name).toBe('John')
    })

    it('trims trailing whitespace from a string field', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ name: 'John   ' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).name).toBe('John')
    })

    it('trims whitespace left after stripping HTML tags', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ name: '  <b>John</b>  ' })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).name).toBe('John')
    })
  })

  // ─── Non-string values ────────────────────────────────────────────────────

  describe('non-string values', () => {
    it('leaves numeric fields untouched', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ count: 42 })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).count).toBe(42)
    })

    it('leaves boolean fields untouched', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ active: true })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).active).toBe(true)
    })

    it('leaves array fields untouched', () => {
      const handler = loadContactHandler()
      const req = makeContactReq({ tags: ['a', 'b'] })
      handler(req, {} as Res, jest.fn())
      expect((req.body as Record<string, unknown>).tags).toEqual(['a', 'b'])
    })
  })

  // ─── Null / missing body ──────────────────────────────────────────────────

  describe('null body', () => {
    it('does not throw when body is null', () => {
      const handler = loadContactHandler()
      const req = makeContactReq(null)
      expect(() => handler(req, {} as Res, jest.fn())).not.toThrow()
    })
  })

  // ─── next() call ──────────────────────────────────────────────────────────

  describe('next()', () => {
    it('always calls next() after sanitizing', () => {
      const handler = loadContactHandler()
      const next = jest.fn()
      handler(makeContactReq({ name: 'John' }), {} as Res, next)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('calls next() with no arguments', () => {
      const handler = loadContactHandler()
      const next = jest.fn()
      handler(makeContactReq({ name: 'John' }), {} as Res, next)
      expect(next).toHaveBeenCalledWith()
    })

    it('calls next() even when body is null', () => {
      const handler = loadContactHandler()
      const next = jest.fn()
      handler(makeContactReq(null), {} as Res, next)
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})

// ─── Auto-variant-SKU middleware ─────────────────────────────────────────────

type AutoReq = {
  method: string
  path?: string
  body: unknown
  scope: { resolve: jest.Mock }
}

function loadRouteHandler(matcher: string): (req: AutoReq, res: Res, next: Next) => Promise<void> {
  jest.resetModules()
  capturedConfig = null
  require('../api/middlewares')
  const route = loadedConfig()?.routes?.find((r: { matcher?: string }) => r.matcher === matcher)
  const handler = route?.middlewares?.[0]
  if (typeof handler !== 'function') throw new Error(`Handler for ${matcher} not found`)
  return handler as unknown as (req: AutoReq, res: Res, next: Next) => Promise<void>
}

function makeScope(productHandle?: string) {
  const productModule = {
    retrieveProduct: jest.fn(async () => ({ handle: productHandle })),
  }
  return {
    resolve: jest.fn((key: string) => (key === 'product' ? productModule : mockLogger)),
  }
}

describe('auto-variant-sku middleware', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    capturedConfig = null
  })

  describe('product create (/admin/products)', () => {
    it('fills a blank SKU on each variant from handle + options', async () => {
      const handler = loadRouteHandler('/admin/products')
      const body = {
        handle: 'sunappi',
        variants: [
          { sku: '', options: { Color: 'White', Material: 'Wood' } },
          { sku: null, options: { Color: 'Black' } },
        ],
      }
      const next = jest.fn()
      await handler({ method: 'POST', body, scope: makeScope() }, {} as Res, next)
      expect(body.variants[0].sku).toMatch(/^SUNAPPI-WHITE-WOOD-[0-9A-F]+$/)
      expect(body.variants[1].sku).toMatch(/^SUNAPPI-BLACK-[0-9A-F]+$/)
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('leaves a provided SKU untouched', async () => {
      const handler = loadRouteHandler('/admin/products')
      const body = { handle: 'sofa', variants: [{ sku: 'MY-SKU-1', options: { Color: 'Red' } }] }
      await handler({ method: 'POST', body, scope: makeScope() }, {} as Res, jest.fn())
      expect(body.variants[0].sku).toBe('MY-SKU-1')
    })

    it('defaults manage_inventory to true (even with a provided SKU, and overriding false)', async () => {
      const handler = loadRouteHandler('/admin/products')
      const body = {
        handle: 'sofa',
        variants: [
          { sku: 'MY-SKU-1', options: { Color: 'Red' } },
          { sku: '', manage_inventory: false, options: { Color: 'Blue' } },
        ],
      }
      await handler({ method: 'POST', body, scope: makeScope() }, {} as Res, jest.fn())
      expect((body.variants[0] as { manage_inventory?: boolean }).manage_inventory).toBe(true)
      expect((body.variants[1] as { manage_inventory?: boolean }).manage_inventory).toBe(true)
    })

    it('ignores non-POST methods', async () => {
      const handler = loadRouteHandler('/admin/products')
      const body = { handle: 'x', variants: [{ sku: '', options: {} }] }
      const next = jest.fn()
      await handler({ method: 'GET', body, scope: makeScope() }, {} as Res, next)
      expect(body.variants[0].sku).toBe('')
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('generates unique SKUs for two same-option variants', async () => {
      const handler = loadRouteHandler('/admin/products')
      const body = {
        handle: 'lamp',
        variants: [
          { sku: '', options: { Color: 'Red' } },
          { sku: '', options: { Color: 'Red' } },
        ],
      }
      await handler({ method: 'POST', body, scope: makeScope() }, {} as Res, jest.fn())
      expect(body.variants[0].sku).not.toBe(body.variants[1].sku)
    })
  })

  describe('variant add (/admin/products/*/variants)', () => {
    it('fills a blank SKU on a single-variant create using the product handle', async () => {
      const handler = loadRouteHandler('/admin/products/*/variants')
      const body = { sku: '', options: { Color: 'Blue' } }
      await handler(
        {
          method: 'POST',
          path: '/admin/products/prod_1/variants',
          body,
          scope: makeScope('kallax'),
        },
        {} as Res,
        jest.fn(),
      )
      expect((body as { sku: string }).sku).toMatch(/^KALLAX-BLUE-[0-9A-F]+$/)
    })

    it('fills blank SKUs in a batch { create: [...] } body', async () => {
      const handler = loadRouteHandler('/admin/products/*/variants/batch')
      const body = { create: [{ sku: '', options: { Size: 'L' } }] }
      await handler(
        {
          method: 'POST',
          path: '/admin/products/prod_1/variants/batch',
          body,
          scope: makeScope('trynow'),
        },
        {} as Res,
        jest.fn(),
      )
      expect(body.create[0].sku).toMatch(/^TRYNOW-L-[0-9A-F]+$/)
    })

    it('does NOT inject sku on the inventory-items subroute (regression)', async () => {
      const handler = loadRouteHandler('/admin/products/*/variants')
      const body = { inventory_item_id: 'iitem_1', required_quantity: 10 }
      const next = jest.fn()
      await handler(
        {
          method: 'POST',
          path: '/admin/products/prod_1/variants/var_1/inventory-items',
          body,
          scope: makeScope('kallax'),
        },
        {} as Res,
        next,
      )
      expect(body).not.toHaveProperty('sku')
      expect(next).toHaveBeenCalledTimes(1)
    })

    it('falls back to the path id when the product lookup fails', async () => {
      const handler = loadRouteHandler('/admin/products/*/variants')
      const scope = {
        resolve: jest.fn((key: string) =>
          key === 'product'
            ? {
                retrieveProduct: jest.fn(async () => {
                  throw new Error('not found')
                }),
              }
            : mockLogger,
        ),
      }
      const body = { sku: '', options: { Color: 'Teak' } }
      await handler(
        { method: 'POST', path: '/admin/products/prod_99/variants', body, scope },
        {} as Res,
        jest.fn(),
      )
      expect((body as { sku: string }).sku).toMatch(/^PROD-99-TEAK-[0-9A-F]+$/)
    })
  })
})

// ─── Cross-product inventory link guard ──────────────────────────────────────

describe('cross-product inventory link guard', () => {
  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    capturedConfig = null
  })

  const PATH = '/admin/products/prod_1/variants/var_1/inventory-items'

  function guardScope(graphResult: unknown) {
    const query = { graph: jest.fn(async () => graphResult) }
    return { resolve: jest.fn((k: string) => (k === 'query' ? query : mockLogger)) }
  }
  function guardRes() {
    const res: { status: jest.Mock; json: jest.Mock } = { status: jest.fn(), json: jest.fn() }
    res.status.mockReturnValue(res)
    res.json.mockReturnValue(res)
    return res
  }
  const load = () => loadRouteHandler('/admin/products/*/variants/*/inventory-items')

  it('blocks linking an item owned by a different product (409)', async () => {
    const handler = load()
    const res = guardRes()
    const next = jest.fn()
    const scope = guardScope({
      data: [{ variants: [{ product: { id: 'prod_OTHER', title: 'Red Roses Bouquet' } }] }],
    })
    await handler(
      { method: 'POST', path: PATH, body: { inventory_item_id: 'iitem_x' }, scope } as never,
      res as never,
      next,
    )
    expect(res.status).toHaveBeenCalledWith(409)
    expect(next).not.toHaveBeenCalled()
  })

  it('allows linking an item that belongs to the same product', async () => {
    const handler = load()
    const res = guardRes()
    const next = jest.fn()
    const scope = guardScope({
      data: [{ variants: [{ product: { id: 'prod_1', title: 'Self' } }] }],
    })
    await handler(
      { method: 'POST', path: PATH, body: { inventory_item_id: 'iitem_x' }, scope } as never,
      res as never,
      next,
    )
    expect(res.status).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('allows when the item has no other product (new/dedicated)', async () => {
    const handler = load()
    const res = guardRes()
    const next = jest.fn()
    const scope = guardScope({ data: [{ variants: [] }] })
    await handler(
      { method: 'POST', path: PATH, body: { inventory_item_id: 'iitem_x' }, scope } as never,
      res as never,
      next,
    )
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('ignores requests with no inventory_item_id', async () => {
    const handler = load()
    const res = guardRes()
    const next = jest.fn()
    await handler(
      { method: 'POST', path: PATH, body: {}, scope: guardScope({ data: [] }) } as never,
      res as never,
      next,
    )
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('fails open when the lookup throws', async () => {
    const handler = load()
    const res = guardRes()
    const next = jest.fn()
    const scope = {
      resolve: jest.fn((k: string) =>
        k === 'query'
          ? {
              graph: jest.fn(async () => {
                throw new Error('boom')
              }),
            }
          : mockLogger,
      ),
    }
    await handler(
      { method: 'POST', path: PATH, body: { inventory_item_id: 'iitem_x' }, scope } as never,
      res as never,
      next,
    )
    expect(next).toHaveBeenCalledTimes(1)
  })

  it('ignores non-POST methods', async () => {
    const handler = load()
    const res = guardRes()
    const next = jest.fn()
    await handler(
      {
        method: 'GET',
        path: PATH,
        body: { inventory_item_id: 'iitem_x' },
        scope: guardScope({ data: [] }),
      } as never,
      res as never,
      next,
    )
    expect(next).toHaveBeenCalledTimes(1)
  })
})
