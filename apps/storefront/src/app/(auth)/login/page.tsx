import type { Metadata } from 'next'
import { AuthHeader } from '@/components/auth/AuthHeader'
import { LoginForm } from '@/components/auth/LoginForm'

export const metadata: Metadata = {
  title: 'Sign In — Treasure Trove',
  description: 'Sign in to your Treasure Trove account to manage orders and favourites.',
}

export default function LoginPage() {
  return (
    <section data-testid="login-page">
      <AuthHeader
        eyebrow="Welcome Back"
        title="Sign in to your account"
        description="Enter your credentials to continue shopping handcrafted heirlooms."
      />
      <LoginForm />
    </section>
  )
}
