'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Pencil, Check } from 'lucide-react'
import type { MockProfile } from '@/lib/account.mock'
import { updateProfile } from '@/actions/account'

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(7, 'Valid phone number required'),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  'w-full bg-white border border-[var(--color-tt-outline-variant)] px-4 py-3 text-sm text-[var(--color-tt-ink)] focus:ring-1 focus:ring-[var(--color-tt-gold)] focus:border-[var(--color-tt-gold)] outline-none transition-all rounded-sm placeholder:text-[var(--color-tt-outline-variant)]'
const labelCls =
  'block text-[11px] font-bold tracking-[0.10em] text-[var(--color-tt-ink-muted)] uppercase mb-1.5'
const errorCls = 'text-[11px] text-[var(--color-tt-danger)] mt-1'

interface Props {
  profile: MockProfile
}

export function ProfileForm({ profile }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saved, setSaved] = useState<MockProfile>(profile)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: saved.firstName,
      lastName: saved.lastName,
      phone: saved.phone,
    },
  })

  async function onSubmit(values: FormValues) {
    setSaveError(null)
    const result = await updateProfile(values)
    if (!result.ok) {
      setSaveError(result.message)
      return
    }
    setSaved((prev) => ({ ...prev, ...values }))
    setSaveSuccess(true)
    setEditing(false)
    router.refresh()
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  function handleCancel() {
    reset({ firstName: saved.firstName, lastName: saved.lastName, phone: saved.phone })
    setSaveError(null)
    setEditing(false)
  }

  return (
    <div data-testid="profile-settings">
      {/* Read-only display */}
      <div className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm divide-y divide-[var(--color-tt-outline-variant)]/50">
        <div className="px-5 py-4 flex items-center justify-between">
          <h2 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink)]">
            Personal Details
          </h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              data-testid="edit-profile-button"
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-orange)] hover:underline"
            >
              <Pencil size={12} /> Edit Profile
            </button>
          )}
          {saveSuccess && (
            <span
              data-testid="profile-save-success"
              className="flex items-center gap-1 text-[11px] font-bold tracking-wide text-green-700"
            >
              <Check size={12} /> Saved
            </span>
          )}
        </div>

        {[
          { label: 'First Name', value: saved.firstName, testId: 'profile-first-name' },
          { label: 'Last Name', value: saved.lastName, testId: 'profile-last-name' },
          { label: 'Email', value: saved.email, testId: 'profile-email' },
          { label: 'Phone', value: saved.phone, testId: 'profile-phone' },
        ].map(({ label, value, testId }) => (
          <div key={label} className="px-5 py-4 flex items-center justify-between">
            <p className="text-[10px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]">
              {label}
            </p>
            <p className="text-sm text-[var(--color-tt-ink)]" data-testid={testId}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <div
          className="mt-5 bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm p-5"
          data-testid="edit-profile-form"
        >
          <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink)] mb-5">
            Edit Profile
          </h3>

          {saveError && (
            <p className="mb-4 text-sm text-[var(--color-tt-danger)]" data-testid="profile-error">
              {saveError}
            </p>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <div>
              <label className={labelCls}>First Name</label>
              <input
                {...register('firstName')}
                type="text"
                className={inputCls}
                placeholder="Arjun"
                data-testid="input-first-name"
                autoComplete="given-name"
              />
              {errors.firstName && <p className={errorCls}>{errors.firstName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>Last Name</label>
              <input
                {...register('lastName')}
                type="text"
                className={inputCls}
                placeholder="Mehra"
                data-testid="input-last-name"
                autoComplete="family-name"
              />
              {errors.lastName && <p className={errorCls}>{errors.lastName.message}</p>}
            </div>

            <div>
              <label className={labelCls}>
                Email{' '}
                <span className="text-[var(--color-tt-outline-variant)] font-normal">
                  (cannot change)
                </span>
              </label>
              <input
                type="email"
                value={saved.email}
                disabled
                className={`${inputCls} opacity-50 cursor-not-allowed`}
                data-testid="input-email-disabled"
              />
            </div>

            <div>
              <label className={labelCls}>Phone Number</label>
              <input
                {...register('phone')}
                type="tel"
                className={inputCls}
                placeholder="+91 98765 43210"
                data-testid="input-phone"
                autoComplete="tel"
              />
              {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
            </div>

            <div className="sm:col-span-2 flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="profile-save-button"
                className="bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] px-8 py-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {isSubmitting ? 'Saving…' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                data-testid="profile-cancel-button"
                className="px-6 py-3 text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] border border-[var(--color-tt-outline-variant)] hover:border-[var(--color-tt-outline)] transition-colors rounded-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
