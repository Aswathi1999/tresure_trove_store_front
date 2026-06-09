import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password — Treasure Trove',
  description: 'Set a new password for your Treasure Trove account.',
}

export default function ResetPasswordPage() {
  return (
    <section data-testid="reset-password-page">
      <AuthHeader
        eyebrow="Secure Your Account"
        title="Set a new password"
        description="Choose a strong password to protect your account."
      />
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-tt-gold)] border-t-transparent" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </section>
  )
}
