'use client'

import { Check } from 'lucide-react'

const STEPS = [
  { id: 1, label: 'ADDRESS' },
  { id: 2, label: 'SHIPPING' },
  { id: 3, label: 'PAYMENT' },
  { id: 4, label: 'CONFIRMATION' },
] as const

interface Props {
  currentStep: 1 | 2 | 3 | 4
}

export default function CheckoutStepper({ currentStep }: Props) {
  return (
    <nav aria-label="Checkout progress" data-testid="checkout-stepper">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep
          const isActive = step.id === currentStep
          const isPending = step.id > currentStep

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-3" data-testid={`stepper-step-${step.id}`}>
                {/* Circle indicator */}
                <span
                  className={[
                    'w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0 transition-all',
                    isCompleted
                      ? 'bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)]'
                      : isActive
                        ? 'bg-[var(--color-tt-ink)] text-white'
                        : 'border border-[var(--color-tt-outline-variant)] text-[var(--color-tt-ink-muted)]',
                  ].join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : step.id}
                </span>

                {/* Label – hidden on smallest screens */}
                <span
                  className={[
                    'hidden sm:block text-[10px] font-bold tracking-[0.15em] uppercase transition-colors',
                    isPending
                      ? 'text-[var(--color-tt-outline-variant)]'
                      : 'text-[var(--color-tt-ink)]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    'flex-1 h-px mx-3 sm:mx-4',
                    step.id < currentStep
                      ? 'bg-[var(--color-tt-gold)]'
                      : 'bg-[var(--color-tt-outline-variant)]',
                  ].join(' ')}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
