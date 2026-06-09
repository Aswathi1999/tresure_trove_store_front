/**
 * Unit tests for the Payload CMS Media collection.
 *
 * Covers generateFileURL (must return CloudFront URL, never S3), access
 * control (authenticated upload, public read), field validation (required alt
 * text, accepted MIME types, 10 MB size limit).  All Payload and S3 deps are
 * mocked — no live database or S3 connection required.
 */

import type { CollectionConfig } from 'payload'

class MockAPIError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'APIError'
    this.status = status
  }
}

jest.mock('payload', () => ({
  APIError: MockAPIError,
}))

type AccessFn = (args: { req: { user: unknown } }) => boolean

type BeforeOperationHook = (args: {
  operation: string
  req: { file?: { size: number } }
}) => Promise<void>

// ─── Media collection config ──────────────────────────────────────────────────

describe('Media collection config', () => {
  let config: CollectionConfig

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    config = (require('../collections/media') as { Media: CollectionConfig }).Media
  })

  // ─── Slug ─────────────────────────────────────────────────────────────────

  it('has slug "media"', () => {
    expect(config.slug).toBe('media')
  })

  // ─── Admin config ──────────────────────────────────────────────────────────

  describe('admin config', () => {
    it('uses alt as the display title field', () => {
      expect(config.admin?.useAsTitle).toBe('alt')
    })

    it('sets default columns to filename, alt, mimeType, filesize, createdAt', () => {
      expect(config.admin?.defaultColumns).toEqual([
        'filename',
        'alt',
        'mimeType',
        'filesize',
        'createdAt',
      ])
    })
  })

  // ─── Access control ────────────────────────────────────────────────────────

  describe('access control', () => {
    it('read is open to the public (returns true always)', () => {
      const fn = config.access?.read as (() => boolean) | undefined
      expect(fn?.()).toBe(true)
    })

    it('create returns true for an authenticated user', () => {
      const fn = config.access?.create as AccessFn | undefined
      expect(fn?.({ req: { user: { id: 'usr_1' } } })).toBe(true)
    })

    it('create returns false when user is null', () => {
      const fn = config.access?.create as AccessFn | undefined
      expect(fn?.({ req: { user: null } })).toBe(false)
    })

    it('create returns false when user is undefined', () => {
      const fn = config.access?.create as AccessFn | undefined
      expect(fn?.({ req: { user: undefined } })).toBe(false)
    })

    it('update returns true for an authenticated user', () => {
      const fn = config.access?.update as AccessFn | undefined
      expect(fn?.({ req: { user: { id: 'usr_1' } } })).toBe(true)
    })

    it('update returns false when user is null', () => {
      const fn = config.access?.update as AccessFn | undefined
      expect(fn?.({ req: { user: null } })).toBe(false)
    })

    it('delete returns true for an authenticated user', () => {
      const fn = config.access?.delete as AccessFn | undefined
      expect(fn?.({ req: { user: { id: 'usr_1' } } })).toBe(true)
    })

    it('delete returns false when user is null', () => {
      const fn = config.access?.delete as AccessFn | undefined
      expect(fn?.({ req: { user: null } })).toBe(false)
    })
  })

  // ─── Upload config / accepted MIME types ──────────────────────────────────

  describe('upload config', () => {
    type UploadConfig = { mimeTypes: string[]; disableLocalStorage: boolean }

    it('accepts image/jpeg', () => {
      expect((config.upload as UploadConfig).mimeTypes).toContain('image/jpeg')
    })

    it('accepts image/png', () => {
      expect((config.upload as UploadConfig).mimeTypes).toContain('image/png')
    })

    it('accepts image/webp', () => {
      expect((config.upload as UploadConfig).mimeTypes).toContain('image/webp')
    })

    it('accepts exactly 3 MIME types', () => {
      expect((config.upload as UploadConfig).mimeTypes).toHaveLength(3)
    })

    it('disables local storage (files go to S3)', () => {
      expect((config.upload as UploadConfig).disableLocalStorage).toBe(true)
    })
  })

  // ─── Fields ────────────────────────────────────────────────────────────────

  describe('fields', () => {
    type AltField = { name: string; type: string; required: boolean; label: string }

    function altField(): AltField | undefined {
      return config.fields.find((f) => 'name' in f && (f as AltField).name === 'alt') as
        | AltField
        | undefined
    }

    it('defines exactly 1 field', () => {
      expect(config.fields).toHaveLength(1)
    })

    it('alt field is a text field', () => {
      expect(altField()?.type).toBe('text')
    })

    it('alt field is required', () => {
      expect(altField()?.required).toBe(true)
    })

    it('alt field has label "Alt Text"', () => {
      expect(altField()?.label).toBe('Alt Text')
    })
  })

  // ─── beforeOperation hook — 10 MB file size limit ─────────────────────────

  describe('beforeOperation hook (10 MB size limit)', () => {
    let hook: BeforeOperationHook
    const MAX = 10_485_760 // 10 MB in bytes

    beforeAll(() => {
      hook = config.hooks?.beforeOperation?.[0] as unknown as BeforeOperationHook
    })

    it('is registered as the only beforeOperation hook', () => {
      expect(config.hooks?.beforeOperation).toHaveLength(1)
    })

    it('throws APIError when file exceeds 10 MB on create', async () => {
      await expect(hook({ operation: 'create', req: { file: { size: MAX + 1 } } })).rejects.toThrow(
        'File size must be less than 10MB.',
      )
    })

    it('throws with HTTP status 400 on oversized upload', async () => {
      await expect(
        hook({ operation: 'create', req: { file: { size: MAX + 1 } } }),
      ).rejects.toMatchObject({ status: 400 })
    })

    it('throws APIError when file exceeds 10 MB on update', async () => {
      await expect(hook({ operation: 'update', req: { file: { size: MAX + 1 } } })).rejects.toThrow(
        'File size must be less than 10MB.',
      )
    })

    it('does not throw when file size is exactly 10 MB', async () => {
      await expect(
        hook({ operation: 'create', req: { file: { size: MAX } } }),
      ).resolves.toBeUndefined()
    })

    it('does not throw when file size is under 10 MB', async () => {
      await expect(
        hook({ operation: 'create', req: { file: { size: 5_000_000 } } }),
      ).resolves.toBeUndefined()
    })

    it('does not throw when req.file is absent', async () => {
      await expect(hook({ operation: 'create', req: {} })).resolves.toBeUndefined()
    })

    it('does not validate size on read operations', async () => {
      await expect(
        hook({ operation: 'read', req: { file: { size: MAX + 1_000_000 } } }),
      ).resolves.toBeUndefined()
    })

    it('does not validate size on delete operations', async () => {
      await expect(
        hook({ operation: 'delete', req: { file: { size: MAX + 1_000_000 } } }),
      ).resolves.toBeUndefined()
    })
  })
})

// ─── isAuthenticated access function ─────────────────────────────────────────

describe('isAuthenticated access function', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { isAuthenticated } = require('../access/isAuthenticated') as {
    isAuthenticated: AccessFn
  }

  it('returns true for an authenticated user', () => {
    expect(isAuthenticated({ req: { user: { id: 'usr_1', email: 'admin@tt.com' } } })).toBe(true)
  })

  it('returns false when user is null', () => {
    expect(isAuthenticated({ req: { user: null } })).toBe(false)
  })

  it('returns false when user is undefined', () => {
    expect(isAuthenticated({ req: { user: undefined } })).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isAuthenticated({ req: { user: '' } })).toBe(false)
  })

  it('returns true for any truthy user object', () => {
    expect(isAuthenticated({ req: { user: { id: 'usr_2' } } })).toBe(true)
  })
})

// ─── generateFileURL — CloudFront URL generation ──────────────────────────────

describe('generateFileURL', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { generateFileURL } = require('../lib/generate-file-url') as {
    generateFileURL: (args: { filename: string; prefix?: string }) => string
  }

  const defaultCDN = 'https://cdn.treasuretrove.in'
  let savedEnv: string | undefined

  beforeEach(() => {
    savedEnv = process.env['CLOUDFRONT_URL']
    process.env['CLOUDFRONT_URL'] = defaultCDN
  })

  afterEach(() => {
    if (savedEnv !== undefined) {
      process.env['CLOUDFRONT_URL'] = savedEnv
    } else {
      delete process.env['CLOUDFRONT_URL']
    }
  })

  it('returns a URL that starts with the CloudFront domain', () => {
    const url = generateFileURL({ filename: 'chair.jpg' })
    expect(url).toMatch(/^https:\/\/cdn\.treasuretrove\.in\//)
  })

  it('never returns an S3 hostname URL', () => {
    const url = generateFileURL({ filename: 'chair.jpg' })
    expect(url).not.toMatch(/s3\.amazonaws\.com/)
    expect(url).not.toMatch(/s3\.ap-south-1\.amazonaws\.com/)
    expect(url).not.toMatch(/\.s3\./)
  })

  it('includes the filename in the returned URL', () => {
    const url = generateFileURL({ filename: 'sofa-hero.webp' })
    expect(url).toContain('sofa-hero.webp')
  })

  it('builds the correct URL without a prefix', () => {
    const url = generateFileURL({ filename: 'table.png' })
    expect(url).toBe(`${defaultCDN}/table.png`)
  })

  it('builds the correct URL with a prefix', () => {
    const url = generateFileURL({ filename: 'table.png', prefix: 'media' })
    expect(url).toBe(`${defaultCDN}/media/table.png`)
  })

  it('does not produce a double slash in the path when prefix is omitted', () => {
    const url = generateFileURL({ filename: 'lamp.jpg' })
    // Strip the protocol (https://) before checking for double slashes in the path
    const path = url.replace(/^https?:\/\//, '')
    expect(path).not.toContain('//')
  })

  it('uses a custom CLOUDFRONT_URL from the environment', () => {
    process.env['CLOUDFRONT_URL'] = 'https://custom-cdn.example.com'
    const url = generateFileURL({ filename: 'vase.jpg' })
    expect(url).toMatch(/^https:\/\/custom-cdn\.example\.com\//)
  })

  it('falls back to cdn.treasuretrove.in when CLOUDFRONT_URL is not set', () => {
    delete process.env['CLOUDFRONT_URL']
    const url = generateFileURL({ filename: 'vase.jpg' })
    expect(url).toMatch(/^https:\/\/cdn\.treasuretrove\.in\//)
  })

  it('handles nested prefix paths', () => {
    const url = generateFileURL({ filename: 'desk.jpg', prefix: 'uploads/2026' })
    expect(url).toBe(`${defaultCDN}/uploads/2026/desk.jpg`)
  })
})
