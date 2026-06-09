'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import type { MockSavedAddress } from '@/lib/account.mock'
import { addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/actions/account'
import { AddressForm } from './AddressForm'

interface Props {
  initialAddresses: MockSavedAddress[]
}

// Normalize a field for comparison: trim, lowercase, collapse internal spaces,
// so "12  MG Road " and "12 mg road" count as the same.
const norm = (s?: string) => (s ?? '').trim().toLowerCase().replace(/\s+/g, ' ')

// Two entries are the "same address" when their physical fields match. The label
// (Home/Work) is intentionally ignored, so the identical address can't be saved
// twice under a different label.
type AddressFields = Omit<MockSavedAddress, 'id' | 'isDefault'>
function isSameAddress(a: AddressFields, b: AddressFields): boolean {
  return (
    norm(a.fullName) === norm(b.fullName) &&
    norm(a.line1) === norm(b.line1) &&
    norm(a.line2) === norm(b.line2) &&
    norm(a.city) === norm(b.city) &&
    norm(a.state) === norm(b.state) &&
    norm(a.pin) === norm(b.pin) &&
    norm(a.country) === norm(b.country) &&
    norm(a.phone) === norm(b.phone)
  )
}

export function AddressBook({ initialAddresses }: Props) {
  const router = useRouter()
  const [addresses, setAddresses] = useState<MockSavedAddress[]>(initialAddresses)
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>('list')
  const [editing, setEditing] = useState<MockSavedAddress | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAdd(data: Omit<MockSavedAddress, 'id' | 'isDefault'>) {
    setError(null)
    if (addresses.some((a) => isSameAddress(a, data))) {
      setError('This address is already saved.')
      return
    }
    const result = await addAddress(data)
    if (!result.ok) {
      setError(result.message)
      return
    }
    const newAddr: MockSavedAddress = {
      ...data,
      id: result.data || `addr_${Date.now()}`,
      isDefault: addresses.length === 0,
    }
    setAddresses((prev) => [...prev, newAddr])
    setMode('list')
    router.refresh()
  }

  async function handleEdit(data: Omit<MockSavedAddress, 'id' | 'isDefault'>) {
    if (!editing) return
    setError(null)
    // Block editing one address into a duplicate of another (excluding itself).
    if (addresses.some((a) => a.id !== editing.id && isSameAddress(a, data))) {
      setError('This address is already saved.')
      return
    }
    const result = await updateAddress(editing.id, data)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setAddresses((prev) => prev.map((a) => (a.id === editing.id ? { ...editing, ...data } : a)))
    setEditing(null)
    setMode('list')
    router.refresh()
  }

  async function handleDelete(id: string) {
    setError(null)
    const result = await deleteAddress(id)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    router.refresh()
  }

  async function handleSetDefault(id: string) {
    setError(null)
    const result = await setDefaultAddress(id)
    if (!result.ok) {
      setError(result.message)
      return
    }
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })))
    router.refresh()
  }

  if (mode === 'add') {
    return (
      <AddressForm
        onSave={handleAdd}
        error={error}
        onCancel={() => {
          setError(null)
          setMode('list')
        }}
      />
    )
  }

  if (mode === 'edit' && editing) {
    return (
      <AddressForm
        initial={editing}
        onSave={handleEdit}
        error={error}
        onCancel={() => {
          setError(null)
          setMode('list')
          setEditing(null)
        }}
      />
    )
  }

  return (
    <div data-testid="address-book">
      <button
        onClick={() => {
          setError(null)
          setMode('add')
        }}
        data-testid="add-address-button"
        className="mb-6 flex items-center gap-2 bg-[var(--color-tt-gold)] text-[var(--color-tt-ink)] px-6 py-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-[var(--color-tt-gold-hover)] transition-colors rounded-sm"
      >
        <Plus size={14} />
        Add New Address
      </button>

      {error && (
        <p className="mb-4 text-sm text-[var(--color-tt-danger)]" data-testid="address-error">
          {error}
        </p>
      )}

      {addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-[var(--color-tt-surface)] border border-[var(--color-tt-outline-variant)] rounded-sm text-center">
          <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)]">
            No saved addresses
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              data-testid={`address-card-${addr.id}`}
              className={`relative bg-[var(--color-tt-surface)] border rounded-sm p-5 ${
                addr.isDefault
                  ? 'border-[var(--color-tt-ink)]'
                  : 'border-[var(--color-tt-outline-variant)]'
              }`}
            >
              {addr.isDefault && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.15em] uppercase bg-[var(--color-tt-ink)] text-[var(--color-tt-gold)] px-2 py-0.5 rounded-sm mb-3">
                  <Star size={9} fill="currentColor" /> Default
                </span>
              )}

              <p className="text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)] mb-2">
                {addr.label}
              </p>
              <div className="text-sm text-[var(--color-tt-ink-muted)] space-y-0.5">
                <p className="font-semibold text-[var(--color-tt-ink)]">{addr.fullName}</p>
                <p>{addr.line1}</p>
                {addr.line2 && <p>{addr.line2}</p>}
                <p>
                  {addr.city}, {addr.state} — {addr.pin}
                </p>
                <p>{addr.country}</p>
                <p className="pt-1">{addr.phone}</p>
              </div>

              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[var(--color-tt-outline-variant)]/50">
                <button
                  onClick={() => {
                    setError(null)
                    setEditing(addr)
                    setMode('edit')
                  }}
                  data-testid={`edit-address-${addr.id}`}
                  className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-ink-muted)] hover:text-[var(--color-tt-ink)] transition-colors"
                >
                  <Pencil size={12} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  data-testid={`delete-address-${addr.id}`}
                  className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-outline)] hover:text-[var(--color-tt-danger)] transition-colors"
                >
                  <Trash2 size={12} /> Delete
                </button>
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    data-testid={`set-default-${addr.id}`}
                    className="ml-auto text-[11px] font-bold tracking-widest uppercase text-[var(--color-tt-orange)] hover:underline"
                  >
                    Set Default
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
