import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils'
import promotionEventsSubscriber, { config } from '../promotion-events'

type MockLogger = { info: jest.Mock; warn: jest.Mock; error: jest.Mock; debug: jest.Mock }

type CartOverrides = {
  id?: string
  region_id?: string | null
  currency_code?: string | null
  promotions?: Array<{ id: string; code?: string | null }>
}

function makeContainer(
  overrides: {
    cart?: CartOverrides | null
    cartResolveError?: Error
    cartServiceError?: Error
  } = {},
) {
  const mockLogger: MockLogger = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }

  const defaultCart = {
    id: 'cart_01',
    region_id: 'reg_india_01',
    currency_code: 'inr',
    promotions: [{ id: 'promo_01', code: 'TT-INDIA-500' }],
  }

  const cartData = overrides.cart === null ? null : { ...defaultCart, ...(overrides.cart ?? {}) }

  const mockCartService = {
    retrieveCart: overrides.cartServiceError
      ? jest.fn().mockRejectedValue(overrides.cartServiceError)
      : jest.fn().mockResolvedValue(cartData),
  }

  const container = {
    resolve: jest.fn((key: string) => {
      if (key === ContainerRegistrationKeys.LOGGER) return mockLogger
      if (overrides.cartResolveError) throw overrides.cartResolveError
      if (key === Modules.CART) return mockCartService
      throw new Error(`Unexpected container key: ${key}`)
    }),
  }

  return { container, mockLogger, mockCartService }
}

function makeArgs(
  cartId: string,
  container: ReturnType<typeof makeContainer>['container'],
): Parameters<typeof promotionEventsSubscriber>[0] {
  return {
    event: { data: { id: cartId } },
    container,
  } as never
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('promotionEventsSubscriber', () => {
  // ─── config export ─────────────────────────────────────────────────────────

  describe('config', () => {
    it('subscribes to cart.updated', () => {
      expect(config.event).toBe('cart.updated')
    })
  })

  // ─── Early return — null cart ─────────────────────────────────────────────

  describe('when cart is not found', () => {
    it('returns without logging info', async () => {
      const { container, mockLogger } = makeContainer({ cart: null })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).not.toHaveBeenCalled()
    })

    it('does not throw', async () => {
      const { container } = makeContainer({ cart: null })
      await expect(
        promotionEventsSubscriber(makeArgs('cart_01', container)),
      ).resolves.toBeUndefined()
    })
  })

  // ─── Early return — no promotions ─────────────────────────────────────────

  describe('when cart has no promotions', () => {
    it('returns without logging info', async () => {
      const { container, mockLogger } = makeContainer({ cart: { promotions: [] } })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).not.toHaveBeenCalled()
    })

    it('does not throw', async () => {
      const { container } = makeContainer({ cart: { promotions: [] } })
      await expect(
        promotionEventsSubscriber(makeArgs('cart_01', container)),
      ).resolves.toBeUndefined()
    })
  })

  // ─── retrieveCart call ────────────────────────────────────────────────────

  describe('retrieveCart', () => {
    it('retrieves the cart using the event cart ID', async () => {
      const { container, mockCartService } = makeContainer()
      await promotionEventsSubscriber(makeArgs('cart_event_id', container))
      expect(mockCartService.retrieveCart).toHaveBeenCalledWith('cart_event_id', expect.anything())
    })

    it('requests promotions relation', async () => {
      const { container, mockCartService } = makeContainer()
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockCartService.retrieveCart).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ relations: expect.arrayContaining(['promotions']) }),
      )
    })
  })

  // ─── Promotion application logging ───────────────────────────────────────

  describe('when promotions are applied to a cart', () => {
    it('logs the cart_id from the event data', async () => {
      const { container, mockLogger } = makeContainer()
      await promotionEventsSubscriber(makeArgs('cart_event_abc', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ cart_id: 'cart_event_abc' }),
      )
    })

    it('logs the region_id from the cart', async () => {
      const { container, mockLogger } = makeContainer({
        cart: { region_id: 'reg_india_01' },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ region_id: 'reg_india_01' }),
      )
    })

    it('logs the currency_code from the cart', async () => {
      const { container, mockLogger } = makeContainer({
        cart: { currency_code: 'inr' },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ currency_code: 'inr' }),
      )
    })

    it('logs the promotion code when code is present', async () => {
      const { container, mockLogger } = makeContainer({
        cart: { promotions: [{ id: 'promo_01', code: 'TT-INDIA-500' }] },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ promotion_codes: 'TT-INDIA-500' }),
      )
    })

    it('falls back to promotion id when code is null', async () => {
      const { container, mockLogger } = makeContainer({
        cart: { promotions: [{ id: 'promo_fallback_01', code: null }] },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ promotion_codes: 'promo_fallback_01' }),
      )
    })

    it('joins multiple promotion codes with a comma and space', async () => {
      const { container, mockLogger } = makeContainer({
        cart: {
          promotions: [
            { id: 'promo_01', code: 'TT-INDIA-500' },
            { id: 'promo_02', code: 'TT-FREE-SHIP' },
          ],
        },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({ promotion_codes: 'TT-INDIA-500, TT-FREE-SHIP' }),
      )
    })

    it('logs promotion_count equal to the number of applied promotions', async () => {
      const { container, mockLogger } = makeContainer({
        cart: {
          promotions: [
            { id: 'promo_01', code: 'TT-INDIA-500' },
            { id: 'promo_02', code: 'TT-FREE-SHIP' },
          ],
        },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ promotion_count: 2 }))
    })

    it('logs null for region_id when cart has no region', async () => {
      const { container, mockLogger } = makeContainer({
        cart: { region_id: null },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ region_id: null }))
    })

    it('logs null for currency_code when cart has no currency', async () => {
      const { container, mockLogger } = makeContainer({
        cart: { currency_code: null },
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).toHaveBeenCalledWith(expect.objectContaining({ currency_code: null }))
    })

    it('logs AED currency_code for UAE region carts', async () => {
      const { container, mockLogger } = makeContainer({
        cart: {
          region_id: 'reg_uae_01',
          currency_code: 'aed',
          promotions: [{ id: 'promo_uae', code: 'TT-UAE-100' }],
        },
      })
      await promotionEventsSubscriber(makeArgs('cart_uae', container))
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.objectContaining({
          region_id: 'reg_uae_01',
          currency_code: 'aed',
          promotion_codes: 'TT-UAE-100',
        }),
      )
    })
  })

  // ─── Error handling ───────────────────────────────────────────────────────

  describe('error handling', () => {
    it('logs an error and does not rethrow when retrieveCart rejects', async () => {
      const { container, mockLogger } = makeContainer({
        cartServiceError: new Error('DB timeout'),
      })
      await expect(
        promotionEventsSubscriber(makeArgs('cart_err', container)),
      ).resolves.toBeUndefined()
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('DB timeout'))
    })

    it('includes the cart id in the error message', async () => {
      const { container, mockLogger } = makeContainer({
        cartServiceError: new Error('Connection refused'),
      })
      await promotionEventsSubscriber(makeArgs('cart_err_99', container))
      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining('cart_err_99'))
    })

    it('logs an error and does not rethrow when CART module cannot be resolved', async () => {
      const { container, mockLogger } = makeContainer({
        cartResolveError: new Error('Cart module not registered'),
      })
      await expect(
        promotionEventsSubscriber(makeArgs('cart_01', container)),
      ).resolves.toBeUndefined()
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Cart module not registered'),
      )
    })

    it('does not log info when an error occurs', async () => {
      const { container, mockLogger } = makeContainer({
        cartServiceError: new Error('Unexpected failure'),
      })
      await promotionEventsSubscriber(makeArgs('cart_01', container))
      expect(mockLogger.info).not.toHaveBeenCalled()
    })
  })
})
