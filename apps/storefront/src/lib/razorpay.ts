// Typed wrapper around Razorpay's hosted checkout (checkout.js). The script is
// injected lazily on the client and only once. The publishable Key ID comes from
// NEXT_PUBLIC_RAZORPAY_KEY_ID — the secret never touches the frontend.

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface RazorpayConstructorOptions {
  key: string
  amount: number
  currency: string
  order_id: string
  name: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
  handler: (response: RazorpaySuccessResponse) => void
  modal?: { ondismiss?: () => void }
}

interface RazorpayPaymentFailedResponse {
  error?: { description?: string; reason?: string }
}

interface RazorpayInstance {
  open: () => void
  on: (event: 'payment.failed', handler: (response: RazorpayPaymentFailedResponse) => void) => void
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayConstructorOptions) => RazorpayInstance
  }
}

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

/** Thrown when the shopper closes the Razorpay modal without completing payment. */
export class RazorpayDismissedError extends Error {
  readonly code = 'RAZORPAY_DISMISSED'
  constructor() {
    super('Payment cancelled.')
    this.name = 'RazorpayDismissedError'
  }
}

/**
 * Inject the Razorpay checkout script. Resolves once `window.Razorpay` is
 * available. Safe to call repeatedly — the script is only added once, and
 * concurrent callers await the same in-flight load.
 */
export async function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('Razorpay checkout can only be loaded in the browser.')
  }
  if (window.Razorpay) return

  const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`)
  if (existing) {
    if (window.Razorpay) return
    return new Promise<void>((resolve, reject) => {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener(
        'error',
        () => reject(new Error('Failed to load Razorpay checkout.')),
        { once: true },
      )
    })
  }

  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SCRIPT_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () =>
      reject(new Error('Failed to load Razorpay checkout. Check your connection and try again.'))
    document.body.appendChild(script)
  })
}

export interface OpenCheckoutParams {
  /** Razorpay order id returned by the initiated payment session. */
  orderId: string
  /** Amount in the smallest currency unit (paise for INR) — must match the order. */
  amount: number
  /** ISO currency code, e.g. "INR". */
  currency: string
  description?: string
  prefill?: { name?: string; email?: string; contact?: string }
}

/**
 * Open the Razorpay checkout modal. Resolves with the three callback tokens on a
 * successful payment, rejects with `RazorpayDismissedError` if the shopper closes
 * the modal, or rejects with the Razorpay error message on payment failure.
 */
export async function openRazorpayCheckout(
  params: OpenCheckoutParams,
): Promise<RazorpaySuccessResponse> {
  const key = process.env['NEXT_PUBLIC_RAZORPAY_KEY_ID']
  if (!key) {
    throw new Error('Razorpay is not configured (missing NEXT_PUBLIC_RAZORPAY_KEY_ID).')
  }
  if (typeof window === 'undefined' || !window.Razorpay) {
    throw new Error('Razorpay checkout is not ready. Please try again.')
  }

  const RazorpayCtor = window.Razorpay
  return new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    let settled = false

    const rzp = new RazorpayCtor({
      key,
      amount: params.amount,
      currency: params.currency,
      order_id: params.orderId,
      name: 'Treasure Trove',
      description: params.description,
      prefill: params.prefill,
      handler: (response) => {
        settled = true
        if (
          response.razorpay_payment_id &&
          response.razorpay_order_id &&
          response.razorpay_signature
        ) {
          resolve(response)
        } else {
          reject(new Error('Payment response was incomplete. Please try again.'))
        }
      },
      modal: {
        ondismiss: () => {
          // Fires on success too (after handler) — guard with `settled`.
          if (!settled) {
            settled = true
            reject(new RazorpayDismissedError())
          }
        },
      },
    })

    rzp.on('payment.failed', (response) => {
      if (settled) return
      settled = true
      reject(new Error(response.error?.description ?? 'Payment failed. Please try again.'))
    })

    rzp.open()
  })
}
