/**
 * POST /store/carts/:id/payment-authorize
 *
 * Bridges the client-side Razorpay checkout with Medusa's payment authorization.
 * Medusa v2 has no built-in store route to push the Razorpay callback tokens onto
 * a payment session, and it only authorizes sessions during cart completion using
 * the data already stored on the session. So after the Razorpay modal succeeds the
 * storefront calls this route with the three callback fields; we merge them into the
 * Razorpay session's data and authorize it via the Payment module. The provider's
 * authorizePayment() then verifies the HMAC (order_id|payment_id) server-side.
 *
 * Only the publishable key is required (enforced automatically on /store/* routes);
 * the Razorpay secret never leaves the backend.
 */

import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

const RAZORPAY_PROVIDER_ID = 'pp_razorpay_razorpay'

interface AuthorizeBody {
  razorpay_payment_id?: unknown
  razorpay_order_id?: unknown
  razorpay_signature?: unknown
}

interface CartPaymentSession {
  id: string
  provider_id: string
  status: string
  amount: number
  currency_code: string
  data: Record<string, unknown> | null
}

export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const cartId = req.params.id
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = (req.body ??
    {}) as AuthorizeBody

  if (
    typeof razorpay_payment_id !== 'string' ||
    typeof razorpay_order_id !== 'string' ||
    typeof razorpay_signature !== 'string' ||
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature
  ) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'razorpay_payment_id, razorpay_order_id and razorpay_signature are all required.',
      },
    })
    return
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: carts } = await query.graph({
    entity: 'cart',
    fields: [
      'id',
      'payment_collection.id',
      'payment_collection.payment_sessions.id',
      'payment_collection.payment_sessions.provider_id',
      'payment_collection.payment_sessions.status',
      'payment_collection.payment_sessions.amount',
      'payment_collection.payment_sessions.currency_code',
      'payment_collection.payment_sessions.data',
    ],
    filters: { id: cartId },
  })

  const cart = carts?.[0] as
    | { payment_collection?: { payment_sessions?: CartPaymentSession[] } }
    | undefined
  const sessions = cart?.payment_collection?.payment_sessions ?? []
  const session = sessions.find((s) => s.provider_id === RAZORPAY_PROVIDER_ID)

  if (!session) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'No Razorpay payment session found for this cart.' },
    })
    return
  }

  const paymentModule = req.scope.resolve(Modules.PAYMENT)

  // Merge the Razorpay callback tokens into the session data so the provider's
  // authorizePayment() can verify the signature. `id` is the Razorpay order id the
  // HMAC is computed against.
  await paymentModule.updatePaymentSession({
    id: session.id,
    currency_code: session.currency_code,
    amount: session.amount,
    data: {
      ...(session.data ?? {}),
      id: razorpay_order_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
    },
  })

  try {
    const payment = await paymentModule.authorizePaymentSession(session.id, {})
    res.status(200).json({ success: true, payment_id: payment?.id ?? null })
  } catch (err) {
    // Invalid signature or provider error → session not authorized.
    res.status(402).json({
      success: false,
      error: {
        code: 'PAYMENT_AUTHORIZATION_FAILED',
        message:
          err instanceof Error ? err.message : 'Payment could not be verified. Please try again.',
      },
    })
  }
}
