import { useRef, useState } from 'react'
import { defineWidgetConfig } from '@medusajs/admin-sdk'
import type { DetailWidgetProps } from '@medusajs/framework/types'

type CollectionMetadata = {
  image_url?: string
  [key: string]: unknown
}

type AdminCollection = {
  id: string
  metadata?: CollectionMetadata | null
}

function CollectionImageWidget({ data }: DetailWidgetProps<AdminCollection>) {
  const collection = data as AdminCollection
  const meta = (collection.metadata ?? {}) as CollectionMetadata
  const [imageUrl, setImageUrl] = useState<string>(meta.image_url ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saved' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File): Promise<string> {
    const form = new FormData()
    form.append('files', file)
    const res = await fetch('/admin/uploads', {
      method: 'POST',
      credentials: 'include',
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: HTTP ${res.status}`)
    const data = (await res.json()) as { files?: Array<{ url: string }> }
    const url = data.files?.[0]?.url
    if (!url) throw new Error('Upload response missing file url')
    return url
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setStatus('idle')
    setErrorMessage('')
    try {
      const url = await uploadFile(file)
      setImageUrl(url)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaving(true)
    setStatus('idle')
    setErrorMessage('')
    try {
      const updatedMetadata: CollectionMetadata = {
        ...meta,
        image_url: imageUrl || undefined,
      }
      if (!imageUrl) delete updatedMetadata.image_url
      const res = await fetch(`/admin/collections/${collection.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metadata: updatedMetadata }),
      })
      if (!res.ok) throw new Error(`Save failed: HTTP ${res.status}`)
      setStatus('saved')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function handleRemove() {
    setImageUrl('')
  }

  return (
    <div
      data-testid="collection-image-widget"
      className="rounded-lg border overflow-hidden shadow-elevation-card-rest"
      style={{ background: '#ffffff', borderColor: '#cdc6b7' }}
    >
      <div
        className="px-5 py-4 border-b"
        style={{
          background: 'linear-gradient(to right, #fff8f3, #fdf6f0)',
          borderColor: '#cdc6b7',
        }}
      >
        <h2
          className="text-sm font-bold uppercase"
          style={{ letterSpacing: '0.10em', color: '#1F1B16' }}
        >
          Collection Image
        </h2>
        <p className="text-[11px] mt-0.5" style={{ color: '#4A443D' }}>
          Used by the storefront "Our Collections" grid
        </p>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div
          className="w-full h-64 rounded-md border flex items-center justify-center overflow-hidden p-2"
          style={{ borderColor: '#cdc6b7', background: '#fafaf6' }}
        >
          {imageUrl ? (
            <img
              data-testid="collection-image-preview"
              src={imageUrl}
              alt="Collection"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <span className="text-[11px] uppercase" style={{ color: '#7c7768' }}>
              No image yet
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            data-testid="collection-image-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            data-testid="collection-image-upload-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="text-[11px] font-bold uppercase px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: '#695e31', color: '#ffffff', letterSpacing: '0.08em' }}
          >
            {uploading ? 'Uploading…' : imageUrl ? 'Replace Image' : 'Upload Image'}
          </button>
          {imageUrl && (
            <button
              data-testid="collection-image-remove-btn"
              onClick={handleRemove}
              disabled={uploading || saving}
              className="text-[11px] font-bold uppercase px-4 py-2 rounded border disabled:opacity-40"
              style={{ borderColor: '#cdc6b7', color: '#76574d', background: '#ffffff' }}
            >
              Remove
            </button>
          )}
          <button
            data-testid="collection-image-save-btn"
            onClick={handleSave}
            disabled={saving || uploading || imageUrl === (meta.image_url ?? '')}
            className="text-[11px] font-bold uppercase px-4 py-2 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed ml-auto"
            style={{ background: '#1F1B16', color: '#ffffff', letterSpacing: '0.08em' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>

        {status === 'saved' && (
          <p
            data-testid="collection-image-success"
            className="text-[11px] font-medium"
            style={{ color: '#3d7a5e' }}
          >
            Saved successfully.
          </p>
        )}
        {status === 'error' && (
          <p
            data-testid="collection-image-error"
            className="text-[11px] font-medium text-ui-fg-error"
          >
            {errorMessage || 'Something went wrong.'}
          </p>
        )}
      </div>
    </div>
  )
}

export const config = defineWidgetConfig({
  zone: 'product_collection.details.before',
})

export default CollectionImageWidget
