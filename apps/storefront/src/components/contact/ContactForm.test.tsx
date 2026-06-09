import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ContactForm } from './ContactForm'

describe('ContactForm', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders all form fields and the submit button', () => {
    render(<ContactForm />)
    expect(screen.getByTestId('contact-name-input')).toBeInTheDocument()
    expect(screen.getByTestId('contact-email-input')).toBeInTheDocument()
    expect(screen.getByTestId('contact-phone-input')).toBeInTheDocument()
    expect(screen.getByTestId('contact-subject-input')).toBeInTheDocument()
    expect(screen.getByTestId('contact-message-input')).toBeInTheDocument()
    expect(screen.getByTestId('contact-submit-button')).toHaveTextContent('Send Message')
  })

  describe('Zod validation', () => {
    it('shows required errors for name, email, subject, and message on empty submit', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.click(screen.getByTestId('contact-submit-button'))

      expect(await screen.findByTestId('contact-name-error')).toHaveTextContent('Name is required.')
      expect(screen.getByTestId('contact-email-error')).toHaveTextContent('Email is required.')
      expect(screen.getByTestId('contact-subject-error')).toHaveTextContent(
        'Please select a subject.',
      )
      expect(screen.getByTestId('contact-message-error')).toHaveTextContent(
        'Message must be at least 20 characters.',
      )
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('shows an email format error for an invalid email address', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByTestId('contact-email-input'), 'not-an-email')
      await user.click(screen.getByTestId('contact-submit-button'))

      expect(await screen.findByTestId('contact-email-error')).toHaveTextContent(
        'Enter a valid email address.',
      )
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('shows a message-length error when message is under 20 characters', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByTestId('contact-message-input'), 'Too short')
      await user.click(screen.getByTestId('contact-submit-button'))

      expect(await screen.findByTestId('contact-message-error')).toHaveTextContent(
        'Message must be at least 20 characters.',
      )
    })

    it('does not show a phone error — phone is optional', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.click(screen.getByTestId('contact-submit-button'))
      await screen.findByTestId('contact-name-error')

      expect(screen.queryByTestId('contact-phone-error')).not.toBeInTheDocument()
    })

    it('shows a phone error for a number that is too short / wrong format', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByTestId('contact-phone-input'), '12345')
      await user.click(screen.getByTestId('contact-submit-button'))

      expect(await screen.findByTestId('contact-phone-error')).toHaveTextContent(
        /valid 10-digit mobile number/i,
      )
      expect(screen.getByTestId('contact-phone-input')).toHaveAttribute('aria-invalid', 'true')
    })

    it('accepts a valid mobile number (with +91 and spaces) — no phone error', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.type(screen.getByTestId('contact-phone-input'), '+91 98765 43210')
      await user.click(screen.getByTestId('contact-submit-button'))

      // Other required fields are empty, so submit still fails — but the valid
      // phone must not produce a phone error.
      await screen.findByTestId('contact-name-error')
      expect(screen.queryByTestId('contact-phone-error')).not.toBeInTheDocument()
    })

    it('strips non-phone characters as the user types', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const input = screen.getByTestId('contact-phone-input') as HTMLInputElement
      await user.type(input, 'abc98765def43210')

      expect(input.value).toBe('9876543210')
    })

    it('strips numbers from the name as the user types', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      const input = screen.getByTestId('contact-name-input') as HTMLInputElement
      await user.type(input, 'John123 Doe456')

      expect(input.value).toBe('John Doe')
    })

    it('rejects a name containing numbers (pasted) with a validation message', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      // Paste bypasses per-keystroke typing; the field still sanitizes onChange,
      // so the value ends up letters-only and submits without a name error.
      await user.click(screen.getByTestId('contact-name-input'))
      await user.paste('John123')

      expect((screen.getByTestId('contact-name-input') as HTMLInputElement).value).toBe('John')
    })

    it('marks required inputs as aria-invalid when they have errors', async () => {
      const user = userEvent.setup()
      render(<ContactForm />)

      await user.click(screen.getByTestId('contact-submit-button'))
      await screen.findByTestId('contact-name-error')

      expect(screen.getByTestId('contact-name-input')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('contact-email-input')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('contact-subject-input')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByTestId('contact-message-input')).toHaveAttribute('aria-invalid', 'true')
    })
  })

  describe('submission states', () => {
    const VALID_FORM = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      subject: 'order',
      message: 'This is a long enough test message for the form submission.',
    }

    async function fillAndSubmit(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByTestId('contact-name-input'), VALID_FORM.name)
      await user.type(screen.getByTestId('contact-email-input'), VALID_FORM.email)
      await user.selectOptions(screen.getByTestId('contact-subject-input'), VALID_FORM.subject)
      await user.type(screen.getByTestId('contact-message-input'), VALID_FORM.message)
      await user.click(screen.getByTestId('contact-submit-button'))
    }

    it('disables the button and shows a spinner while submitting', async () => {
      const user = userEvent.setup()
      let resolveSubmit: () => void = () => {}
      fetchMock.mockReturnValueOnce(
        new Promise<Response>((resolve) => {
          resolveSubmit = () => resolve({ ok: true } as Response)
        }),
      )
      render(<ContactForm />)

      await fillAndSubmit(user)

      await waitFor(() => {
        expect(screen.getByTestId('contact-submit-spinner')).toBeInTheDocument()
        expect(screen.getByTestId('contact-submit-button')).toBeDisabled()
        expect(screen.getByTestId('contact-submit-button')).toHaveTextContent(/sending/i)
      })

      await act(async () => {
        resolveSubmit()
      })
    })

    it('shows the success panel and hides the form after a successful submission', async () => {
      const user = userEvent.setup()
      fetchMock.mockResolvedValueOnce({ ok: true } as Response)
      render(<ContactForm />)

      await fillAndSubmit(user)

      expect(await screen.findByTestId('contact-form-success')).toBeInTheDocument()
      expect(screen.queryByTestId('contact-form')).not.toBeInTheDocument()
    })

    it('shows a server error message when the API returns a non-ok response', async () => {
      const user = userEvent.setup()
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: { message: 'Rate limit exceeded. Please try again later.' },
        }),
      } as unknown as Response)
      render(<ContactForm />)

      await fillAndSubmit(user)

      const errorEl = await screen.findByTestId('contact-submit-error')
      expect(errorEl).toHaveTextContent('Rate limit exceeded. Please try again later.')
      expect(screen.queryByTestId('contact-form-success')).not.toBeInTheDocument()
      expect(screen.getByTestId('contact-form')).toBeInTheDocument()
    })

    it('shows a fallback error message when the API error body has no message', async () => {
      const user = userEvent.setup()
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ success: false }),
      } as unknown as Response)
      render(<ContactForm />)

      await fillAndSubmit(user)

      const errorEl = await screen.findByTestId('contact-submit-error')
      expect(errorEl).toHaveTextContent('Submission failed. Please try again.')
    })

    it('shows a friendly message (not "Failed to fetch") when the request rejects', async () => {
      const user = userEvent.setup()
      fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'))
      render(<ContactForm />)

      await fillAndSubmit(user)

      const errorEl = await screen.findByTestId('contact-submit-error')
      expect(errorEl).toHaveTextContent(/check your internet connection/i)
      expect(errorEl).not.toHaveTextContent(/failed to fetch/i)
      expect(screen.queryByTestId('contact-form-success')).not.toBeInTheDocument()
      expect(screen.getByTestId('contact-form')).toBeInTheDocument()
    })

    it('maps a 500 with a non-JSON body to a friendly server-error message', async () => {
      const user = userEvent.setup()
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new SyntaxError('Unexpected token < in JSON')
        },
      } as unknown as Response)
      render(<ContactForm />)

      await fillAndSubmit(user)

      const errorEl = await screen.findByTestId('contact-submit-error')
      expect(errorEl).toHaveTextContent(/servers are having a moment/i)
    })

    it('sends the correct payload to the API endpoint', async () => {
      const user = userEvent.setup()
      fetchMock.mockResolvedValueOnce({ ok: true } as Response)
      render(<ContactForm />)

      await fillAndSubmit(user)
      await screen.findByTestId('contact-form-success')

      expect(fetchMock).toHaveBeenCalledOnce()
      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
      expect(url).toMatch(/\/store\/contact$/)
      expect(init.method).toBe('POST')
      expect((init.headers as Record<string, string>)['x-publishable-api-key']).toBeDefined()
      const body = JSON.parse(init.body as string) as Record<string, string>
      expect(body.name).toBe(VALID_FORM.name)
      expect(body.email).toBe(VALID_FORM.email)
      expect(body.subject).toBe(VALID_FORM.subject)
      expect(body.message).toBe(VALID_FORM.message)
    })
  })
})
