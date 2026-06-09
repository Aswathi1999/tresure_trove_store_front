import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MockAddress, MockShippingOption, MockOrder } from '@/lib/checkout.mock'
import type { CartLineItem } from '@/lib/cart-types'

// Shared mocks (hoisted above the vi.mock factories below).
const h = vi.hoisted(() => {
  class RazorpayDismissedError extends Error {
    readonly code = 'RAZORPAY_DISMISSED'
    constructor() {
      super('Payment cancelled.')
      this.name = 'RazorpayDismissedError'
    }
  }
  const cartItems = [
    {
      id: 'item_1',
      productId: 'prod_1',
      variantId: 'var_1',
      title: 'Artisan Vase',
      category: 'Decor',
      variant: 'Ivory',
      imageUrl: '',
      imageAlt: '',
      unitPrice: 845000,
      quantity: 1,
    },
  ]
  const cartState = {
    items: cartItems,
    selectedIds: ['item_1'],
    cartId: 'cart_1',
    initCart: vi.fn().mockResolvedValue(undefined),
    selectAll: vi.fn(),
  }
  const useCartStore = Object.assign(
    vi.fn((selector?: (s: typeof cartState) => unknown) =>
      selector ? selector(cartState) : cartState,
    ),
    { getState: () => cartState },
  )
  return {
    cartItems,
    cartState,
    useCartStore,
    completeOrderAction: vi.fn(),
    getAppliedPromotionsAction: vi.fn(),
    initiateRazorpaySession: vi.fn(),
    loadRazorpayScript: vi.fn(),
    openRazorpayCheckout: vi.fn(),
    RazorpayDismissedError,
  }
})

vi.mock('@/actions/checkout', () => ({
  completeOrderAction: (...args: unknown[]) => h.completeOrderAction(...args),
  getAppliedPromotionsAction: (...args: unknown[]) => h.getAppliedPromotionsAction(...args),
  initiateRazorpaySession: (...args: unknown[]) => h.initiateRazorpaySession(...args),
}))

vi.mock('@/lib/razorpay', () => ({
  loadRazorpayScript: (...args: unknown[]) => h.loadRazorpayScript(...args),
  openRazorpayCheckout: (...args: unknown[]) => h.openRazorpayCheckout(...args),
  RazorpayDismissedError: h.RazorpayDismissedError,
}))

vi.mock('@/stores/cart', () => ({ useCartStore: h.useCartStore }))

import PaymentStep from './PaymentStep'

const MOCK_ADDRESS: MockAddress = {
  email: 'arjun@example.com',
  fullName: 'Arjun Mehra',
  phone: '+919876543210',
  addressLine1: '12 MG Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560038',
  country: 'IN',
}

const MOCK_SHIPPING: MockShippingOption = {
  id: 'ship_standard',
  name: 'Standard Delivery',
  carrier: 'DTDC / Blue Dart',
  estimatedDelivery: '5–7 business days',
  price: 0,
}

const MOCK_SHIPPING_PAID: MockShippingOption = {
  id: 'ship_express',
  name: 'Express Delivery',
  carrier: 'FedEx Priority',
  estimatedDelivery: '2–3 business days',
  price: 59900,
}

const RAZORPAY_TOKENS = {
  razorpay_payment_id: 'pay_1',
  razorpay_order_id: 'order_x',
  razorpay_signature: 'sig_1',
}

const MOCK_ORDER: MockOrder = {
  id: 'TT-2026-00042',
  items: [],
  address: MOCK_ADDRESS,
  shippingOption: MOCK_SHIPPING,
  subtotal: 845000,
  shipping: 0,
  total: 946400,
  currency: 'INR',
}

function renderStep(props: Partial<React.ComponentProps<typeof PaymentStep>> = {}) {
  return render(
    <PaymentStep
      address={MOCK_ADDRESS}
      shippingOption={MOCK_SHIPPING}
      onSuccess={vi.fn()}
      onBack={vi.fn()}
      currency="INR"
      {...props}
    />,
  )
}

describe('PaymentStep', () => {
  beforeEach(() => {
    process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID'] = 'rzp_test_dummy'
    h.completeOrderAction.mockReset()
    h.getAppliedPromotionsAction.mockReset().mockResolvedValue({
      ok: true,
      discountTotal: 0,
      discountSubtotal: 0,
      shippingDiscount: 0,
      appliedCodes: [],
    })
    h.initiateRazorpaySession.mockReset().mockResolvedValue({
      razorpayOrderId: 'order_x',
      amount: 946400,
      currency: 'INR',
      cartId: 'cart_1',
    })
    h.loadRazorpayScript.mockReset().mockResolvedValue(undefined)
    h.openRazorpayCheckout.mockReset().mockResolvedValue(RAZORPAY_TOKENS)
    h.cartState.initCart.mockClear()
    h.cartState.selectAll.mockClear()
  })

  it('renders the payment section', () => {
    renderStep()
    expect(screen.getByTestId('payment-step')).toBeInTheDocument()
  })

  it('renders INR payment methods for INR currency', () => {
    renderStep()
    expect(screen.getByTestId('payment-method-upi')).toBeInTheDocument()
    expect(screen.getByTestId('payment-method-card')).toBeInTheDocument()
    expect(screen.getByTestId('payment-method-netbanking')).toBeInTheDocument()
    expect(screen.getByTestId('payment-method-cod')).toBeInTheDocument()
  })

  it('defaults selected method to "card" for INR', () => {
    renderStep()
    expect(screen.getByTestId('payment-radio-card')).toBeChecked()
  })

  it('allows selecting a different INR payment method', async () => {
    const user = userEvent.setup()
    renderStep()
    await user.click(screen.getByTestId('payment-radio-upi'))
    expect(screen.getByTestId('payment-radio-upi')).toBeChecked()
    expect(screen.getByTestId('payment-radio-card')).not.toBeChecked()
  })

  it('renders Stripe card element for USD currency', () => {
    renderStep({ currency: 'USD' })
    expect(screen.getByTestId('stripe-card-element')).toBeInTheDocument()
    expect(screen.queryByTestId('payment-method-upi')).not.toBeInTheDocument()
  })

  it('renders Stripe card element for AED currency', () => {
    renderStep({ currency: 'AED' })
    expect(screen.getByTestId('stripe-card-element')).toBeInTheDocument()
    expect(screen.queryByTestId('payment-method-upi')).not.toBeInTheDocument()
  })

  it('shows the GST-inclusive total in the place order button', () => {
    // subtotal 845000 + shipping 59900 = 904900; GST 12% = 108588; total = 1013488.
    renderStep({ shippingOption: MOCK_SHIPPING_PAID })
    expect(screen.getByTestId('place-order-button')).toHaveTextContent('Rs. 10,13,488')
  })

  it('opens the Razorpay modal and completes an INR order on success', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    h.completeOrderAction.mockResolvedValueOnce(MOCK_ORDER)
    renderStep({ onSuccess })

    await user.click(screen.getByTestId('place-order-button'))

    await waitFor(() => {
      expect(h.loadRazorpayScript).toHaveBeenCalled()
      expect(h.initiateRazorpaySession).toHaveBeenCalledWith('cart_1', [])
      expect(h.openRazorpayCheckout).toHaveBeenCalled()
      expect(h.completeOrderAction).toHaveBeenCalledWith(
        MOCK_ADDRESS,
        MOCK_SHIPPING,
        h.cartItems,
        'INR',
        'card',
        [],
        { paymentId: 'pay_1', orderId: 'order_x', signature: 'sig_1' },
        [],
      )
      expect(onSuccess).toHaveBeenCalledWith(MOCK_ORDER)
    })
  })

  it('shows a clear message when Razorpay is not configured (no publishable key)', async () => {
    const user = userEvent.setup()
    delete process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID']
    renderStep()

    await user.click(screen.getByTestId('place-order-button'))

    expect(await screen.findByTestId('payment-error')).toHaveTextContent(
      'Online payments are not configured yet',
    )
    expect(h.openRazorpayCheckout).not.toHaveBeenCalled()
    expect(h.completeOrderAction).not.toHaveBeenCalled()
    expect(screen.getByTestId('place-order-button')).not.toBeDisabled()
  })

  it('completes a COD order without opening the Razorpay modal', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()
    h.completeOrderAction.mockResolvedValueOnce(MOCK_ORDER)
    renderStep({ onSuccess })

    await user.click(screen.getByTestId('payment-radio-cod'))
    await user.click(screen.getByTestId('place-order-button'))

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(MOCK_ORDER)
    })
    expect(h.openRazorpayCheckout).not.toHaveBeenCalled()
    expect(h.completeOrderAction).toHaveBeenCalledWith(
      MOCK_ADDRESS,
      MOCK_SHIPPING,
      h.cartItems,
      'INR',
      'cod',
      [],
      undefined,
      [],
    )
  })

  it('shows "Payment cancelled" and re-enables the button when the modal is dismissed', async () => {
    const user = userEvent.setup()
    h.openRazorpayCheckout.mockRejectedValueOnce(new h.RazorpayDismissedError())
    renderStep()

    await user.click(screen.getByTestId('place-order-button'))

    expect(await screen.findByTestId('payment-error')).toHaveTextContent(
      'Payment cancelled. Please try again.',
    )
    expect(h.completeOrderAction).not.toHaveBeenCalled()
    expect(screen.getByTestId('place-order-button')).not.toBeDisabled()
  })

  it('shows the Razorpay error message when payment fails in the modal', async () => {
    const user = userEvent.setup()
    h.openRazorpayCheckout.mockRejectedValueOnce(new Error('Card declined by bank.'))
    renderStep()

    await user.click(screen.getByTestId('place-order-button'))

    expect(await screen.findByTestId('payment-error')).toHaveTextContent('Card declined by bank.')
    expect(screen.getByTestId('retry-payment-button')).toBeInTheDocument()
  })

  it('shows a payment error when order completion fails after payment', async () => {
    const user = userEvent.setup()
    h.completeOrderAction.mockRejectedValueOnce(new Error('Payment could not be confirmed.'))
    renderStep()

    await user.click(screen.getByTestId('place-order-button'))

    expect(await screen.findByTestId('payment-error')).toHaveTextContent(
      'Payment could not be confirmed.',
    )
  })

  it('shows "PROCESSING…" and disables the button while the modal is open', async () => {
    const user = userEvent.setup()
    // Keep the modal "open" by never resolving the checkout promise.
    h.openRazorpayCheckout.mockReturnValueOnce(new Promise(() => {}))
    renderStep()

    await user.click(screen.getByTestId('place-order-button'))

    await waitFor(() => {
      expect(screen.getByTestId('place-order-button')).toHaveTextContent('PROCESSING…')
      expect(screen.getByTestId('place-order-button')).toBeDisabled()
    })
  })

  it('calls onBack when the back button is clicked', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    renderStep({ onBack })
    await user.click(screen.getByTestId('payment-back-button'))
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('does not show a payment error on initial render', () => {
    renderStep()
    expect(screen.queryByTestId('payment-error')).not.toBeInTheDocument()
    expect(screen.queryByTestId('retry-payment-button')).not.toBeInTheDocument()
  })
})
