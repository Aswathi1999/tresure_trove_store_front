import type { Metadata } from 'next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { RegisterForm } from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account — Treasure Trove',
  description: 'Create a Treasure Trove account to save favourites and track orders.',
}

export default function RegisterPage() {
  return (
    <section data-testid="register-page">
      <AuthHeader
        eyebrow="Join Treasure Trove"
        title="Create your account"
        description="Save favourites, track orders, and get early access to new arrivals."
      />
      <RegisterForm />
    </section>
  )
}
