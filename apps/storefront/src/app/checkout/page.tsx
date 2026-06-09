'use client'

import { useEffect, useState } from 'react'
import CheckoutStepper from '@/components/checkout/CheckoutStepper'
import AddressStep from '@/components/checkout/AddressStep'
import ShippingStep from '@/components/checkout/ShippingStep'
import PaymentStep from '@/components/checkout/PaymentStep'
import ConfirmationStep from '@/components/checkout/ConfirmationStep'
import OrderSummary from '@/components/checkout/OrderSummary'
import type { MockAddress, MockShippingOption, MockOrder } from '@/lib/checkout.mock'

type CheckoutStep = 1 | 2 | 3 | 4

export default function CheckoutPage(): React.JSX.Element {
  const [step, setStep] = useState<CheckoutStep>(1)
  const [address, setAddress] = useState<MockAddress | null>(null)
  const [shippingOption, setShippingOption] = useState<MockShippingOption | null>(null)
  const [order, setOrder] = useState<MockOrder | null>(null)

  // Scroll to top whenever the step changes so mobile users land at the
  // beginning of the new step instead of mid-page (where the previous
  // step's "Continue" button sat).
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [step])

  return (
    <div className="min-h-screen bg-[var(--color-tt-surface)] flex flex-col">
      {/* Main content — top padding clears the fixed global navbar */}
      <main className="flex-1 mx-auto w-full max-w-screen-2xl px-4 sm:px-8 pt-[104px] lg:pt-[140px] pb-10 sm:pb-16">
        {step === 4 && order ? (
          <ConfirmationStep order={order} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
            {/* Left: checkout flow */}
            <div className="lg:col-span-8 space-y-10">
              <CheckoutStepper currentStep={step} />

              <div>
                {step === 1 && (
                  <AddressStep
                    initialAddress={address}
                    onNext={(addr) => {
                      setAddress(addr)
                      setStep(2)
                    }}
                  />
                )}

                {step === 2 && (
                  <ShippingStep
                    initialSelectedId={shippingOption?.id ?? null}
                    onNext={(opt) => {
                      setShippingOption(opt)
                      setStep(3)
                    }}
                    onBack={() => setStep(1)}
                  />
                )}

                {step === 3 && address && shippingOption && (
                  <PaymentStep
                    address={address}
                    shippingOption={shippingOption}
                    onSuccess={(placedOrder) => {
                      setOrder(placedOrder)
                      setStep(4)
                    }}
                    onBack={() => setStep(2)}
                  />
                )}
              </div>
            </div>

            {/* Right: order summary — shown above on mobile */}
            <div
              className="lg:col-span-4 order-first lg:order-last lg:sticky lg:top-28"
              data-testid="order-summary-sidebar"
            >
              <OrderSummary shippingOption={shippingOption} />
            </div>
          </div>
        )}
      </main>

      {/* Slim footer */}
      <footer className="bg-[var(--color-tt-surface-container)] mt-16">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-[var(--color-tt-outline-variant)]">
          <nav className="flex flex-wrap justify-center gap-6 text-[11px] font-bold tracking-[0.2em] text-[var(--color-tt-ink-muted)]">
            {['POLICIES', 'SHIPPING', 'RETURNS', 'CONTACT'].map((link) => (
              <a
                key={link}
                href="#"
                className="hover:text-[var(--color-tt-gold)] transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>
          <p className="text-[11px] font-medium tracking-[0.1em] text-[var(--color-tt-ink-muted)] uppercase">
            COPYRIGHT 2026 TREASURE TROVE. MADE IN INDIA.
          </p>
        </div>
      </footer>
    </div>
  )
}
