// @ts-nocheck
import {
  createWorkflow,
  createStep,
  StepResponse,
  WorkflowResponse,
  transform,
} from '@medusajs/framework/workflows-sdk'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import type { IPaymentModuleService } from '@medusajs/types'

// ─── Types ─────────────────────────────────────────────────────────────────

export type RefundInput = {
  payment_id: string
  amount: number
  reason: string
  metadata?: Record<string, unknown>
}

export type RefundResult = {
  refund_id: string
  payment_id: string
  amount: number
  reason: string
}

// ─── Step 1: validate refund amount against captured payment ──────────────

const validateRefundAmountStep = createStep(
  'validate-refund-amount',
  async (input: { payment_id: string; amount: number }, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const paymentService: IPaymentModuleService = container.resolve(Modules.PAYMENT)

    const payment = await paymentService.retrievePayment(input.payment_id, {
      relations: ['refunds'],
    })

    if (!payment) {
      throw new Error(`Payment ${input.payment_id} not found`)
    }

    if (!payment.captured_at) {
      throw new Error(`Payment ${input.payment_id} has not been captured — cannot issue refund`)
    }

    const alreadyRefunded = (payment.refunds ?? []).reduce(
      (sum: number, r: { amount: number }) => sum + (r.amount ?? 0),
      0,
    )
    const maxRefundable = payment.amount - alreadyRefunded

    if (input.amount <= 0) {
      throw new Error(`Refund amount must be greater than zero`)
    }

    if (input.amount > maxRefundable) {
      throw new Error(
        `Refund amount ${input.amount} exceeds the refundable balance of ${maxRefundable} ` +
          `(captured: ${payment.amount}, already refunded: ${alreadyRefunded})`,
      )
    }

    logger.info(
      `[refund] Validated refund of ${input.amount} for payment ${input.payment_id} ` +
        `(max refundable: ${maxRefundable})`,
    )

    return new StepResponse({
      payment_id: payment.id,
      amount: payment.amount,
      captured_at: payment.captured_at,
      already_refunded: alreadyRefunded,
      max_refundable: maxRefundable,
    })
  },
)

// ─── Step 2: process the refund via the payment provider ──────────────────

const processRefundStep = createStep(
  'process-refund',
  async (
    input: {
      payment_id: string
      amount: number
      reason: string
      metadata?: Record<string, unknown>
    },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const paymentService: IPaymentModuleService = container.resolve(Modules.PAYMENT)

    const refund = await paymentService.refundPayment({
      payment_id: input.payment_id,
      amount: input.amount,
      metadata: {
        ...input.metadata,
        reason: input.reason,
        refunded_at: new Date().toISOString(),
      },
    })

    logger.info(
      `[refund] Refund ${refund.id} processed — payment: ${input.payment_id}, ` +
        `amount: ${input.amount}, reason: ${input.reason}`,
    )

    return new StepResponse({
      refund_id: refund.id,
      payment_id: input.payment_id,
      amount: input.amount,
    })
  },
)

// ─── Step 3: emit refund event ────────────────────────────────────────────

const emitRefundCreatedStep = createStep(
  'emit-refund-created-event',
  async (
    input: { refund_id: string; payment_id: string; amount: number; reason: string },
    { container },
  ) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
    const eventBus = container.resolve(ContainerRegistrationKeys.EVENT_BUS)

    await eventBus.emit([
      {
        name: 'payment.refund_created',
        data: {
          refund_id: input.refund_id,
          payment_id: input.payment_id,
          amount: input.amount,
          reason: input.reason,
        },
      },
    ])

    logger.info(`[refund] Emitted payment.refund_created for refund ${input.refund_id}`)

    return new StepResponse({ emitted: true })
  },
)

// ─── Workflow ──────────────────────────────────────────────────────────────

export const refundWorkflow = createWorkflow('process-refund', function (input: RefundInput) {
  validateRefundAmountStep({
    payment_id: input.payment_id,
    amount: input.amount,
  })

  const refundData = processRefundStep({
    payment_id: input.payment_id,
    amount: input.amount,
    reason: input.reason,
    metadata: input.metadata,
  })

  emitRefundCreatedStep({
    refund_id: refundData.refund_id,
    payment_id: input.payment_id,
    amount: input.amount,
    reason: input.reason,
  })

  const result = transform(
    { refundData },
    ({ refundData: r }): RefundResult => ({
      refund_id: r.refund_id,
      payment_id: r.payment_id,
      amount: r.amount,
      reason: input.reason,
    }),
  )

  return new WorkflowResponse(result)
})
