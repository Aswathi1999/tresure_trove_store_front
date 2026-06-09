'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X } from 'lucide-react'
import type { MockSavedAddress } from '@/lib/account.mock'
import {
  NAME_REGEX,
  NAME_MSG,
  PLACE_REGEX,
  CITY_MSG,
  STATE_MSG,
  COUNTRY_MSG,
  PHONE_REGEX,
  PHONE_MSG,
  phoneHasEnoughDigits,
  PHONE_DIGITS_MSG,
  STREET_REGEX,
  STREET_MSG,
  stripName,
  stripPhone,
  stripPlace,
  stripStreet,
  stripDigits,
} from '@/lib/address-validation'
import type { UseFormRegisterReturn } from 'react-hook-form'

// Merge react-hook-form's register props with a live input filter so disallowed
// characters are removed as the user types or pastes. The sanitized value is
// written back to the DOM before RHF reads it, then RHF's own onChange runs.
function filtered(reg: UseFormRegisterReturn, strip: (v: string) => string) {
  return {
    ...reg,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = strip(e.target.value)
      if (cleaned !== e.target.value) e.target.value = cleaned
      return reg.onChange(e)
    },
  }
}

const schema = z.object({
  label: z.string().trim().min(1, 'Label is required'),
  fullName: z.string().trim().min(2, 'Full name is required').regex(NAME_REGEX, NAME_MSG),
  phone: z
    .string()
    .trim()
    .min(7, 'Valid phone number required')
    .regex(PHONE_REGEX, PHONE_MSG)
    .refine(phoneHasEnoughDigits, PHONE_DIGITS_MSG),
  line1: z.string().trim().min(5, 'Street address is required').regex(STREET_REGEX, STREET_MSG),
  line2: z.string().optional(),
  city: z.string().trim().min(2, 'City is required').regex(PLACE_REGEX, CITY_MSG),
  state: z.string().trim().min(2, 'State is required').regex(PLACE_REGEX, STATE_MSG),
  pin: z.string().regex(/^\d{6}$/, 'Enter a valid 6-digit PIN'),
  country: z.string().trim().min(1, 'Country is required').regex(PLACE_REGEX, COUNTRY_MSG),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  'w-full bg-white border border-[var(--color-tt-outline-variant)] px-4 py-3 text-sm text-[var(--color-tt-ink)] focus:ring-1 focus:ring-[var(--color-tt-gold)] focus:border-[var(--color-tt-gold)] outline-none transition-all rounded-sm placeholder:text-[var(--color-tt-outline-variant)]'
const labelCls =
  'block text-[11px] font-bold tracking-[0.10em] text-[var(--color-tt-ink-muted)] uppercase mb-1.5'
const errorCls = 'text-[13px] font-medium text-[var(--color-tt-danger)] mt-1.5 leading-snug'

interface Props {
  initial?: Partial<MockSavedAddress>
  onSave: (data: Omit<MockSavedAddress, 'id' | 'isDefault'>) => void
  onCancel: () => void
  /** Submission-level error (e.g. duplicate address) surfaced from the parent. */
  error?: string | null
}

export function AddressForm({ initial, onSave, onCancel, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: initial?.label ?? '',
      fullName: initial?.fullName ?? '',
      phone: initial?.phone ?? '',
      line1: initial?.line1 ?? '',
      line2: initial?.line2 ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      pin: initial?.pin ?? '',
      country: initial?.country ?? 'India',
    },
  })

  function onSubmit(values: FormValues) {
    onSave(values)
  }

  return (
    <div
      className="bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm p-5"
      data-testid="address-form"
    >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink)]">
          {initial?.id ? 'Edit Address' : 'Add New Address'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          data-testid="address-form-cancel"
          className="text-[var(--color-tt-outline)] hover:text-[var(--color-tt-ink)] transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        <div>
          <label className={labelCls}>Label</label>
          <input
            {...register('label')}
            type="text"
            className={inputCls}
            placeholder="Home / Office"
            data-testid="input-label"
          />
          {errors.label && <p className={errorCls}>{errors.label.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Full Name</label>
          <input
            {...filtered(register('fullName'), stripName)}
            type="text"
            className={inputCls}
            placeholder="Arjun Mehra"
            data-testid="input-full-name"
          />
          {errors.fullName && <p className={errorCls}>{errors.fullName.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Phone Number</label>
          <input
            {...filtered(register('phone'), stripPhone)}
            type="tel"
            inputMode="tel"
            className={inputCls}
            placeholder="+91 98765 43210"
            data-testid="input-phone"
          />
          {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
        </div>

        <div>
          <label className={labelCls}>Country</label>
          <input
            {...filtered(register('country'), stripPlace)}
            type="text"
            className={inputCls}
            placeholder="India"
            data-testid="input-country"
          />
          {errors.country && <p className={errorCls}>{errors.country.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>Street Address</label>
          <input
            {...filtered(register('line1'), stripStreet)}
            type="text"
            className={inputCls}
            placeholder="House / Flat no., Street, Area"
            data-testid="input-line1"
          />
          {errors.line1 && <p className={errorCls}>{errors.line1.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className={labelCls}>
            Apartment, Suite{' '}
            <span className="text-[var(--color-tt-outline-variant)] font-normal">(optional)</span>
          </label>
          <input
            {...register('line2')}
            type="text"
            className={inputCls}
            placeholder="Apt, Floor, etc."
            data-testid="input-line2"
          />
        </div>

        <div>
          <label className={labelCls}>City</label>
          <input
            {...filtered(register('city'), stripPlace)}
            type="text"
            className={inputCls}
            placeholder="Bengaluru"
            data-testid="input-city"
          />
          {errors.city && <p className={errorCls}>{errors.city.message}</p>}
        </div>

        <div>
          <label className={labelCls}>State</label>
          <input
            {...filtered(register('state'), stripPlace)}
            type="text"
            className={inputCls}
            placeholder="Karnataka"
            data-testid="input-state"
          />
          {errors.state && <p className={errorCls}>{errors.state.message}</p>}
        </div>

        <div>
          <label className={labelCls}>PIN Code</label>
          <input
            {...filtered(register('pin'), stripDigits)}
            type="text"
            inputMode="numeric"
            className={inputCls}
            placeholder="560001"
            data-testid="input-pin"
          />
          {errors.pin && <p className={errorCls}>{errors.pin.message}</p>}
        </div>

        {error && (
          <div className="sm:col-span-2">
            <p className={errorCls} data-testid="address-form-error" role="alert">
              {error}
            </p>
          </div>
        )}

        <div className="sm:col-span-2 flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="address-form-submit"
            className="bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] px-8 py-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
            {isSubmitting ? 'Saving…' : 'Save Address'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            data-testid="address-form-cancel-secondary"
            className="px-6 py-3 text-[11px] font-bold tracking-[0.15em] uppercase text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors border border-[var(--color-tt-outline-variant)] hover:border-[var(--color-tt-outline)] rounded-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
