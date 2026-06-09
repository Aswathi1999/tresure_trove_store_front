import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import CheckoutStepper from './CheckoutStepper'

describe('CheckoutStepper', () => {
  it('renders all 4 step indicators', () => {
    render(<CheckoutStepper currentStep={1} />)
    expect(screen.getByTestId('checkout-stepper')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-1')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-2')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-3')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-4')).toBeInTheDocument()
  })

  it('renders step labels', () => {
    render(<CheckoutStepper currentStep={1} />)
    expect(screen.getByText('ADDRESS')).toBeInTheDocument()
    expect(screen.getByText('SHIPPING')).toBeInTheDocument()
    expect(screen.getByText('PAYMENT')).toBeInTheDocument()
    expect(screen.getByText('CONFIRMATION')).toBeInTheDocument()
  })

  it('marks step 1 as active and steps 2–4 as pending on currentStep=1', () => {
    render(<CheckoutStepper currentStep={1} />)
    const step1 = screen.getByTestId('stepper-step-1')
    expect(step1.querySelector('[aria-current="step"]')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-2').querySelector('[aria-current="step"]')).toBeNull()
    expect(screen.getByTestId('stepper-step-3').querySelector('[aria-current="step"]')).toBeNull()
    expect(screen.getByTestId('stepper-step-4').querySelector('[aria-current="step"]')).toBeNull()
  })

  it('shows step number "1" as the current step indicator text on step 1', () => {
    render(<CheckoutStepper currentStep={1} />)
    const activeIndicator = screen
      .getByTestId('stepper-step-1')
      .querySelector('[aria-current="step"]')
    expect(activeIndicator).toHaveTextContent('1')
  })

  it('marks step 1 completed and step 2 active on currentStep=2', () => {
    render(<CheckoutStepper currentStep={2} />)
    const step2 = screen.getByTestId('stepper-step-2')
    expect(step2.querySelector('[aria-current="step"]')).toBeInTheDocument()
    // Step 1 should no longer show its number — it shows a Check icon
    const step1Indicator = screen
      .getByTestId('stepper-step-1')
      .querySelector('[aria-current="step"]')
    expect(step1Indicator).toBeNull()
  })

  it('marks steps 1–2 completed and step 3 active on currentStep=3', () => {
    render(<CheckoutStepper currentStep={3} />)
    const step3 = screen.getByTestId('stepper-step-3')
    expect(step3.querySelector('[aria-current="step"]')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-1').querySelector('[aria-current="step"]')).toBeNull()
    expect(screen.getByTestId('stepper-step-2').querySelector('[aria-current="step"]')).toBeNull()
    expect(screen.getByTestId('stepper-step-4').querySelector('[aria-current="step"]')).toBeNull()
  })

  it('marks steps 1–3 completed and step 4 active on currentStep=4', () => {
    render(<CheckoutStepper currentStep={4} />)
    const step4 = screen.getByTestId('stepper-step-4')
    expect(step4.querySelector('[aria-current="step"]')).toBeInTheDocument()
    expect(screen.getByTestId('stepper-step-1').querySelector('[aria-current="step"]')).toBeNull()
    expect(screen.getByTestId('stepper-step-2').querySelector('[aria-current="step"]')).toBeNull()
    expect(screen.getByTestId('stepper-step-3').querySelector('[aria-current="step"]')).toBeNull()
  })

  it('renders as a nav element with accessible label', () => {
    render(<CheckoutStepper currentStep={1} />)
    const nav = screen.getByRole('navigation', { name: 'Checkout progress' })
    expect(nav).toBeInTheDocument()
  })

  it('shows step 2 number as pending text when on step 1', () => {
    render(<CheckoutStepper currentStep={1} />)
    // Step 2 is pending — its indicator should show the number "2"
    const step2 = screen.getByTestId('stepper-step-2')
    expect(step2).toHaveTextContent('2')
  })

  it('shows step 3 number as pending text when on step 1', () => {
    render(<CheckoutStepper currentStep={1} />)
    expect(screen.getByTestId('stepper-step-3')).toHaveTextContent('3')
  })
})
