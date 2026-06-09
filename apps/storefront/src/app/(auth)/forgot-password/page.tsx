import type { Metadata } from 'next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Forgot Password — Treasure Trove',
  description: 'Reset your Treasure Trove account password.',
}

export default function ForgotPasswordPage() {
  return (
    <section data-testid="forgot-password-page">
      <AuthHeader
        eyebrow="Password Recovery"
        title="Forgot your password?"
        description="Enter your email and we will send you a link to reset your password."
      />
      <ForgotPasswordForm />
    </section>
  )
}
