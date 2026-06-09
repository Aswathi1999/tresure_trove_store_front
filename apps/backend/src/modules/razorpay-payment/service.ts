import crypto from 'node:crypto'
import Razorpay from 'razorpay'
import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  PaymentActions,
} from '@medusajs/framework/utils'
import type {
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  ProviderWebhookPayload,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
  WebhookActionResult,
} from '@medusajs/framework/types'

export type RazorpayOptions = {
  keyId: string
  keySecret: string
  webhookSecret: string
}

class RazorpayProviderService extends AbstractPaymentProvider<RazorpayOptions> {
  static identifier = 'razorpay'

  protected readonly options_: RazorpayOptions
  protected razorpay_: Razorpay

  constructor(cradle: Record<string, unknown>, options: RazorpayOptions) {
    // @ts-ignore
    super(cradle, options)
    this.options_ = options
    this.razorpay_ = new Razorpay({
      key_id: options.keyId,
      key_secret: options.keySecret,
    })
  }

  static validateOptions(options: RazorpayOptions): void {
    if (!options.keyId) throw new Error('Razorpay provider: `keyId` is required')
    if (!options.keySecret) throw new Error('Razorpay provider: `keySecret` is required')
    if (!options.webhookSecret) throw new Error('Razorpay provider: `webhookSecret` is required')
  }

  async initiatePayment({
    currency_code,
    amount,
    data,
  }: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    try {
      const order = await this.razorpay_.orders.create({
        amount: this.toSmallestUnit(amount, currency_code),
        currency: currency_code.toUpperCase(),
        receipt: (data?.session_id as string | undefined) ?? undefined,
        notes: {
          session_id: (data?.session_id as string) ?? '',
        },
      })
      return {
        id: order.id,
        status: PaymentSessionStatus.PENDING,
        data: {
          ...order,
          session_id: data?.session_id,
        },
      }
    } catch (error) {
      throw this.buildError('An error occurred in Razorpay initiatePayment', error as Error)
    }
  }

  async updatePayment({ data, amount }: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {
      status: PaymentSessionStatus.PENDING,
      data: {
        ...data,
        ...(amount ? { updated_amount: Math.round(Number(amount)) } : {}),
      },
    }
  }

  async authorizePayment({ data }: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const razorpayOrderId = data?.id as string | undefined
    const razorpayPaymentId = data?.razorpay_payment_id as string | undefined
    const razorpaySignature = data?.razorpay_signature as string | undefined

    if (!razorpayPaymentId || !razorpaySignature || !razorpayOrderId) {
      return {
        status: PaymentSessionStatus.PENDING,
        data: data ?? {},
      }
    }

    const payload = `${razorpayOrderId}|${razorpayPaymentId}`
    const expectedSignature = crypto
      .createHmac('sha256', this.options_.keySecret)
      .update(payload)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(razorpaySignature, 'hex'),
    )

    if (!isValid) {
      return {
        status: PaymentSessionStatus.ERROR,
        data: { ...data, error: 'Invalid payment signature' },
      }
    }

    return {
      status: PaymentSessionStatus.AUTHORIZED,
      data: { ...data },
    }
  }

  async capturePayment({ data }: CapturePaymentInput): Promise<CapturePaymentOutput> {
    // Razorpay auto-captures by default; no action needed.
    return { data: data ?? {} }
  }

  async refundPayment({ data, amount }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const paymentId = data?.razorpay_payment_id as string | undefined
    if (!paymentId) {
      throw this.buildError(
        'Razorpay refundPayment: razorpay_payment_id missing',
        new Error('missing payment id'),
      )
    }
    try {
      const currencyCode = (data?.currency as string | undefined) ?? 'inr'
      const refund = await this.razorpay_.payments.refund(paymentId, {
        amount: this.toSmallestUnit(amount, currencyCode),
        speed: 'normal',
      })
      return { data: { ...data, refund } }
    } catch (error) {
      throw this.buildError('An error occurred in Razorpay refundPayment', error as Error)
    }
  }

  async cancelPayment({ data }: CancelPaymentInput): Promise<CancelPaymentOutput> {
    // Razorpay does not support explicit order cancellation after creation.
    return { data: data ?? {} }
  }

  async retrievePayment({ data }: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const orderId = data?.id as string | undefined
    if (!orderId) {
      return { data: data ?? {} }
    }
    try {
      const order = await this.razorpay_.orders.fetch(orderId)
      return { data: order as unknown as Record<string, unknown> }
    } catch (error) {
      throw this.buildError('An error occurred in Razorpay retrievePayment', error as Error)
    }
  }

  async deletePayment({ data }: DeletePaymentInput): Promise<DeletePaymentOutput> {
    // Razorpay orders cannot be deleted; return existing session data.
    return { data: data ?? {} }
  }

  async getPaymentStatus({ data }: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const orderId = data?.id as string | undefined
    if (!orderId) {
      return { status: PaymentSessionStatus.PENDING, data: data ?? {} }
    }
    try {
      const order = await this.razorpay_.orders.fetch(orderId)
      switch (order.status) {
        case 'created':
          return {
            status: PaymentSessionStatus.PENDING,
            data: order as unknown as Record<string, unknown>,
          }
        case 'attempted':
          return {
            status: PaymentSessionStatus.REQUIRES_MORE,
            data: order as unknown as Record<string, unknown>,
          }
        case 'paid':
          return {
            status: PaymentSessionStatus.CAPTURED,
            data: order as unknown as Record<string, unknown>,
          }
        default:
          return {
            status: PaymentSessionStatus.PENDING,
            data: order as unknown as Record<string, unknown>,
          }
      }
    } catch (error) {
      throw this.buildError('An error occurred in Razorpay getPaymentStatus', error as Error)
    }
  }

  async getWebhookActionAndData(
    webhookData: ProviderWebhookPayload['payload'],
  ): Promise<WebhookActionResult> {
    const signature = webhookData.headers['x-razorpay-signature'] as string | undefined
    const rawData = webhookData.rawData as string | Buffer

    if (!signature || !rawData) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    const expectedSignature = crypto
      .createHmac('sha256', this.options_.webhookSecret)
      .update(rawData)
      .digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(signature, 'hex'),
    )

    if (!isValid) {
      return { action: PaymentActions.NOT_SUPPORTED }
    }

    const body = webhookData.data as Record<string, unknown>
    const event = body.event as string | undefined
    const payload = body.payload as Record<string, unknown> | undefined
    const paymentEntity = (payload?.payment as Record<string, unknown> | undefined)?.entity as
      | Record<string, unknown>
      | undefined
    const sessionId = (paymentEntity?.notes as Record<string, unknown> | undefined)?.session_id as
      | string
      | undefined
    const amount = (paymentEntity?.amount as number | undefined) ?? 0

    switch (event) {
      case 'payment.authorized':
        return {
          action: PaymentActions.AUTHORIZED,
          data: { session_id: sessionId ?? '', amount },
        }
      case 'payment.captured':
        return {
          action: PaymentActions.SUCCESSFUL,
          data: { session_id: sessionId ?? '', amount },
        }
      case 'payment.failed':
        return {
          action: PaymentActions.FAILED,
          data: { session_id: sessionId ?? '', amount },
        }
      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }

  // Convert a Medusa amount (major unit, e.g. 280 for ₹280) into the gateway's
  // smallest currency unit (paise for INR). This mirrors Medusa's own
  // getSmallestUnit helper (which is NOT publicly exported), using the standard
  // currency multiplier: most currencies are 2-decimal (×100); a handful are
  // 0-decimal (×1, e.g. JPY) or 3-decimal (×1000, e.g. KWD).
  //
  // NOTE: this assumes Medusa delivers `amount` in the MAJOR unit — the
  // documented v2 behaviour, verified against this backend. If a different
  // Medusa build delivers paise already, this would double-convert; keep the
  // backend version in sync with this repo.
  protected toSmallestUnit(amount: unknown, currencyCode: string): number {
    const ZERO_DECIMAL = [
      'BIF',
      'CLP',
      'DJF',
      'GNF',
      'JPY',
      'KMF',
      'KRW',
      'MGA',
      'PYG',
      'RWF',
      'UGX',
      'VND',
      'VUV',
      'XAF',
      'XOF',
      'XPF',
    ]
    const THREE_DECIMAL = ['BHD', 'IQD', 'JOD', 'KWD', 'OMR', 'TND']
    const cur = currencyCode.toUpperCase()
    const power = ZERO_DECIMAL.includes(cur) ? 0 : THREE_DECIMAL.includes(cur) ? 3 : 2
    return Math.round(Number(amount) * Math.pow(10, power))
  }

  // Surface the REAL Razorpay error. The Razorpay SDK rejects with an object
  // ({ statusCode, error: { code, description } }) that has no `.message`, which
  // is why logs showed "...: undefined". Pull the description/code instead.
  protected buildError(message: string, error: unknown): Error {
    const e = error as {
      message?: string
      statusCode?: number
      error?: { code?: string; description?: string; reason?: string }
    }
    let detail = e?.error?.description ?? e?.message ?? e?.error?.code
    if (!detail) {
      try {
        detail = JSON.stringify(error)
      } catch {
        detail = String(error)
      }
    }
    if (e?.statusCode) detail = `[${e.statusCode}] ${detail}`
    return new Error(`${message}: ${detail}`)
  }
}

export default RazorpayProviderService
