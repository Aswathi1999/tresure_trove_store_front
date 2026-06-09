'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { UseFormRegisterReturn } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { setShippingAddressAction } from '@/actions/checkout'
import type { MockAddress } from '@/lib/checkout.mock'
import {
  NAME_REGEX,
  NAME_MSG,
  PLACE_REGEX,
  CITY_MSG,
  STATE_MSG,
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

// Merge react-hook-form register props with a live filter that strips
// disallowed characters as the user types/pastes (Zod still validates on submit).
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

const COUNTRIES = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'AE', label: 'UAE' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
] as const

function validatePincode(
  country: string | undefined,
  pincode: string,
  path: string,
  ctx: z.RefinementCtx,
) {
  if (country === 'IN' && !/^\d{6}$/.test(pincode)) {
    ctx.addIssue({ code: 'custom', path: [path], message: 'Enter a valid 6-digit PIN code' })
  } else if (country && country !== 'IN' && !/^\d{5,10}$/.test(pincode)) {
    ctx.addIssue({
      code: 'custom',
      path: [path],
      message: 'Enter a valid postal code (5–10 digits)',
    })
  }
}

const schema = z
  .object({
    email: z.string().email('Valid email address is required'),
    fullName: z.string().trim().min(2, 'Full name is required').regex(NAME_REGEX, NAME_MSG),
    phone: z
      .string()
      .trim()
      .min(7, 'Valid phone number required')
      .regex(PHONE_REGEX, PHONE_MSG)
      .refine(phoneHasEnoughDigits, PHONE_DIGITS_MSG),
    addressLine1: z
      .string()
      .trim()
      .min(5, 'Street address is required')
      .regex(STREET_REGEX, STREET_MSG),
    addressLine2: z.string().optional(),
    city: z.string().trim().min(2, 'City is required').regex(PLACE_REGEX, CITY_MSG),
    state: z.string().trim().min(2, 'State / region is required').regex(PLACE_REGEX, STATE_MSG),
    pincode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    // Billing — defaults to same as shipping; the fields below are only
    // required (and validated) when the box is unchecked.
    billingSameAsShipping: z.boolean(),
    billingFullName: z.string().optional(),
    billingPhone: z.string().optional(),
    billingAddressLine1: z.string().optional(),
    billingAddressLine2: z.string().optional(),
    billingCity: z.string().optional(),
    billingState: z.string().optional(),
    billingPincode: z.string().optional(),
    billingCountry: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    validatePincode(data.country, data.pincode, 'pincode', ctx)

    if (data.billingSameAsShipping) return

    const required: Array<[string | undefined, number, string]> = [
      [data.billingFullName, 2, 'billingFullName'],
      [data.billingPhone, 7, 'billingPhone'],
      [data.billingAddressLine1, 5, 'billingAddressLine1'],
      [data.billingCity, 2, 'billingCity'],
      [data.billingState, 2, 'billingState'],
      [data.billingCountry, 1, 'billingCountry'],
    ]
    const messages: Record<string, string> = {
      billingFullName: 'Full name is required',
      billingPhone: 'Valid phone number required',
      billingAddressLine1: 'Street address is required',
      billingCity: 'City is required',
      billingState: 'State / region is required',
      billingCountry: 'Country is required',
    }
    for (const [val, min, path] of required) {
      if (!val || val.trim().length < min) {
        ctx.addIssue({ code: 'custom', path: [path], message: messages[path] ?? 'Required' })
      }
    }

    // Character-class checks for billing fields (same rules as shipping). Only
    // run when the field has a value that passed the length check above, so a
    // single field never shows both a "required" and a character-rule error.
    const charsetChecks: Array<[string | undefined, number, RegExp, string, string]> = [
      [data.billingFullName, 2, NAME_REGEX, 'billingFullName', NAME_MSG],
      [data.billingAddressLine1, 5, STREET_REGEX, 'billingAddressLine1', STREET_MSG],
      [data.billingCity, 2, PLACE_REGEX, 'billingCity', CITY_MSG],
      [data.billingState, 2, PLACE_REGEX, 'billingState', STATE_MSG],
    ]
    for (const [val, min, re, path, msg] of charsetChecks) {
      const v = val?.trim() ?? ''
      if (v.length >= min && !re.test(v)) {
        ctx.addIssue({ code: 'custom', path: [path], message: msg })
      }
    }
    const billPhone = data.billingPhone?.trim() ?? ''
    if (billPhone.length >= 7) {
      if (!PHONE_REGEX.test(billPhone)) {
        ctx.addIssue({ code: 'custom', path: ['billingPhone'], message: PHONE_MSG })
      } else if (!phoneHasEnoughDigits(billPhone)) {
        ctx.addIssue({ code: 'custom', path: ['billingPhone'], message: PHONE_DIGITS_MSG })
      }
    }

    validatePincode(data.billingCountry, data.billingPincode ?? '', 'billingPincode', ctx)
  })

type FormValues = z.infer<typeof schema>

const inputCls =
  'w-full bg-white border border-[var(--color-tt-outline-variant)] px-4 py-3 text-sm text-[var(--color-tt-ink)] focus:ring-1 focus:ring-[var(--color-tt-gold)] focus:border-[var(--color-tt-gold)] outline-none transition-all rounded-sm placeholder:text-[var(--color-tt-outline-variant)]'
const labelCls =
  'block text-[11px] font-bold tracking-[0.10em] text-[var(--color-tt-ink-muted)] uppercase mb-1.5'
const errorCls = 'text-[13px] font-medium text-[var(--color-tt-danger)] mt-1.5 leading-snug'

interface Props {
  onNext: (address: MockAddress) => void
  /** Pre-fill the form when the user navigates back to this step. */
  initialAddress?: MockAddress | null
}

export default function AddressStep({ onNext, initialAddress }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: initialAddress?.email ?? '',
      fullName: initialAddress?.fullName ?? '',
      phone: initialAddress?.phone ?? '',
      addressLine1: initialAddress?.addressLine1 ?? '',
      addressLine2: initialAddress?.addressLine2 ?? '',
      city: initialAddress?.city ?? '',
      state: initialAddress?.state ?? '',
      pincode: initialAddress?.pincode ?? '',
      country: initialAddress?.country ?? 'IN',
      billingSameAsShipping: true,
      billingCountry: 'IN',
    },
  })

  const billingSame = watch('billingSameAsShipping')

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    setServerError(null)
    const shippingAddress: MockAddress = {
      email: values.email,
      fullName: values.fullName,
      phone: values.phone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      city: values.city,
      state: values.state,
      pincode: values.pincode,
      country: values.country,
    }
    try {
      if (values.billingSameAsShipping) {
        await setShippingAddressAction(shippingAddress)
      } else {
        const billingAddress: MockAddress = {
          email: values.email,
          fullName: values.billingFullName ?? '',
          phone: values.billingPhone ?? '',
          addressLine1: values.billingAddressLine1 ?? '',
          addressLine2: values.billingAddressLine2,
          city: values.billingCity ?? '',
          state: values.billingState ?? '',
          pincode: values.billingPincode ?? '',
          country: values.billingCountry ?? '',
        }
        await setShippingAddressAction(shippingAddress, billingAddress)
      }
      onNext(shippingAddress)
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to save address. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section data-testid="address-step">
      <div className="flex items-center gap-6 mb-8">
        <span className="w-8 h-8 flex items-center justify-center bg-[var(--color-tt-ink)] text-white font-bold text-sm shrink-0">
          1
        </span>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight uppercase text-[var(--color-tt-ink)]">
          Delivery Address
        </h2>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="pl-0 sm:pl-14 space-y-6"
        suppressHydrationWarning
      >
        {serverError && (
          <div
            className="p-4 border border-[var(--color-tt-danger)] bg-red-50 text-sm text-[var(--color-tt-danger)] font-medium"
            data-testid="address-server-error"
            role="alert"
          >
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="sm:col-span-2">
            <label className={labelCls}>Email Address</label>
            <input
              {...register('email')}
              type="email"
              className={inputCls}
              placeholder="arjun@example.com"
              data-testid="input-email"
              autoComplete="email"
            />
            {errors.email && <p className={errorCls}>{errors.email.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Full Name</label>
            <input
              {...filtered(register('fullName'), stripName)}
              type="text"
              className={inputCls}
              placeholder="Arjun Mehra"
              data-testid="input-full-name"
              autoComplete="name"
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
              autoComplete="tel"
            />
            {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>Street Address</label>
            <input
              {...filtered(register('addressLine1'), stripStreet)}
              type="text"
              className={inputCls}
              placeholder="House / Flat no., Street, Area"
              data-testid="input-address-line-1"
              autoComplete="address-line1"
            />
            {errors.addressLine1 && <p className={errorCls}>{errors.addressLine1.message}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className={labelCls}>
              Apartment, Suite, Floor{' '}
              <span className="text-[var(--color-tt-outline-variant)] font-normal">(optional)</span>
            </label>
            <input
              {...register('addressLine2')}
              type="text"
              className={inputCls}
              placeholder="Apartment, suite, unit, etc."
              data-testid="input-address-line-2"
              autoComplete="address-line2"
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
              autoComplete="address-level2"
            />
            {errors.city && <p className={errorCls}>{errors.city.message}</p>}
          </div>

          <div>
            <label className={labelCls}>State / Region</label>
            <input
              {...filtered(register('state'), stripPlace)}
              type="text"
              className={inputCls}
              placeholder="Karnataka"
              data-testid="input-state"
              autoComplete="address-level1"
            />
            {errors.state && <p className={errorCls}>{errors.state.message}</p>}
          </div>

          <div>
            <label className={labelCls}>PIN / Postal Code</label>
            <input
              {...filtered(register('pincode'), stripDigits)}
              type="text"
              inputMode="numeric"
              className={inputCls}
              placeholder="560001"
              data-testid="input-pincode"
              autoComplete="postal-code"
            />
            {errors.pincode && <p className={errorCls}>{errors.pincode.message}</p>}
          </div>

          <div>
            <label className={labelCls}>Country</label>
            <select
              {...register('country')}
              className={inputCls}
              data-testid="input-country"
              autoComplete="country"
            >
              {COUNTRIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
            {errors.country && <p className={errorCls}>{errors.country.message}</p>}
          </div>
        </div>

        {/* Billing address: same-as-shipping toggle */}
        <div className="border-t border-[var(--color-tt-outline-variant)] pt-6">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              {...register('billingSameAsShipping')}
              className="w-4 h-4 accent-[var(--color-tt-gold)] cursor-pointer"
              data-testid="billing-same-checkbox"
            />
            <span className="text-sm font-medium text-[var(--color-tt-ink)]">
              Billing address same as shipping address
            </span>
          </label>
        </div>

        {!billingSame && (
          <div className="space-y-6" data-testid="billing-address-fields">
            <h3 className="text-sm font-bold tracking-tight uppercase text-[var(--color-tt-ink)]">
              Billing Address
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>Full Name</label>
                <input
                  {...filtered(register('billingFullName'), stripName)}
                  type="text"
                  className={inputCls}
                  placeholder="Arjun Mehra"
                  data-testid="input-billing-full-name"
                />
                {errors.billingFullName && (
                  <p className={errorCls}>{errors.billingFullName.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Phone Number</label>
                <input
                  {...filtered(register('billingPhone'), stripPhone)}
                  type="tel"
                  inputMode="tel"
                  className={inputCls}
                  placeholder="+91 98765 43210"
                  data-testid="input-billing-phone"
                />
                {errors.billingPhone && <p className={errorCls}>{errors.billingPhone.message}</p>}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>Street Address</label>
                <input
                  {...filtered(register('billingAddressLine1'), stripStreet)}
                  type="text"
                  className={inputCls}
                  placeholder="House / Flat no., Street, Area"
                  data-testid="input-billing-address-line-1"
                />
                {errors.billingAddressLine1 && (
                  <p className={errorCls}>{errors.billingAddressLine1.message}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className={labelCls}>
                  Apartment, Suite, Floor{' '}
                  <span className="text-[var(--color-tt-outline-variant)] font-normal">
                    (optional)
                  </span>
                </label>
                <input
                  {...register('billingAddressLine2')}
                  type="text"
                  className={inputCls}
                  placeholder="Apartment, suite, unit, etc."
                  data-testid="input-billing-address-line-2"
                />
              </div>

              <div>
                <label className={labelCls}>City</label>
                <input
                  {...filtered(register('billingCity'), stripPlace)}
                  type="text"
                  className={inputCls}
                  placeholder="Bengaluru"
                  data-testid="input-billing-city"
                />
                {errors.billingCity && <p className={errorCls}>{errors.billingCity.message}</p>}
              </div>

              <div>
                <label className={labelCls}>State / Region</label>
                <input
                  {...filtered(register('billingState'), stripPlace)}
                  type="text"
                  className={inputCls}
                  placeholder="Karnataka"
                  data-testid="input-billing-state"
                />
                {errors.billingState && <p className={errorCls}>{errors.billingState.message}</p>}
              </div>

              <div>
                <label className={labelCls}>PIN / Postal Code</label>
                <input
                  {...filtered(register('billingPincode'), stripDigits)}
                  type="text"
                  inputMode="numeric"
                  className={inputCls}
                  placeholder="560001"
                  data-testid="input-billing-pincode"
                />
                {errors.billingPincode && (
                  <p className={errorCls}>{errors.billingPincode.message}</p>
                )}
              </div>

              <div>
                <label className={labelCls}>Country</label>
                <select
                  {...register('billingCountry')}
                  className={inputCls}
                  data-testid="input-billing-country"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {errors.billingCountry && (
                  <p className={errorCls}>{errors.billingCountry.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] px-10 py-4 text-xs font-bold tracking-[0.20em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="address-continue-button"
          >
            {submitting ? 'SAVING…' : 'CONTINUE TO SHIPPING'}
          </button>
        </div>
      </form>
    </section>
  )
}
