import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    className,
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    className?: string
  }) => <img src={src} alt={alt} className={className} />,
}))

import { RichTextRenderer } from './RichTextRenderer'
import type { LexicalContent } from '@/lib/payload.mock'

function makeContent(children: unknown[]): LexicalContent {
  return { root: { children } } as unknown as LexicalContent
}

describe('RichTextRenderer', () => {
  it('renders without crashing for empty content', () => {
    const { container } = render(<RichTextRenderer content={makeContent([])} />)
    expect(container.firstChild).toBeInTheDocument()
  })

  describe('paragraph', () => {
    it('renders paragraph text content', () => {
      const content = makeContent([
        { type: 'paragraph', children: [{ type: 'text', text: 'Hello paragraph', format: 0 }] },
      ])
      render(<RichTextRenderer content={content} />)
      expect(screen.getByText('Hello paragraph')).toBeInTheDocument()
    })
  })

  describe('headings', () => {
    it('renders an h2 heading', () => {
      const content = makeContent([
        {
          type: 'heading',
          tag: 'h2',
          children: [{ type: 'text', text: 'Chapter One', format: 0 }],
        },
      ])
      render(<RichTextRenderer content={content} />)
      expect(screen.getByRole('heading', { level: 2, name: 'Chapter One' })).toBeInTheDocument()
    })

    it('renders an h3 heading', () => {
      const content = makeContent([
        { type: 'heading', tag: 'h3', children: [{ type: 'text', text: 'Section A', format: 0 }] },
      ])
      render(<RichTextRenderer content={content} />)
      expect(screen.getByRole('heading', { level: 3, name: 'Section A' })).toBeInTheDocument()
    })

    it('renders an h4 heading', () => {
      const content = makeContent([
        {
          type: 'heading',
          tag: 'h4',
          children: [{ type: 'text', text: 'Sub-section', format: 0 }],
        },
      ])
      render(<RichTextRenderer content={content} />)
      expect(screen.getByRole('heading', { level: 4, name: 'Sub-section' })).toBeInTheDocument()
    })
  })

  describe('text formatting', () => {
    it('renders bold text (format=1) wrapped in <strong>', () => {
      const content = makeContent([
        { type: 'paragraph', children: [{ type: 'text', text: 'Bold word', format: 1 }] },
      ])
      const { container } = render(<RichTextRenderer content={content} />)
      expect(container.querySelector('strong')).toHaveTextContent('Bold word')
    })

    it('renders italic text (format=2) wrapped in <em>', () => {
      const content = makeContent([
        { type: 'paragraph', children: [{ type: 'text', text: 'Italic word', format: 2 }] },
      ])
      const { container } = render(<RichTextRenderer content={content} />)
      expect(container.querySelector('em')).toHaveTextContent('Italic word')
    })

    it('renders bold+italic text (format=3) with both <strong> and <em>', () => {
      const content = makeContent([
        { type: 'paragraph', children: [{ type: 'text', text: 'Bold italic', format: 3 }] },
      ])
      const { container } = render(<RichTextRenderer content={content} />)
      expect(container.querySelector('strong')).toBeInTheDocument()
      expect(container.querySelector('em')).toBeInTheDocument()
    })
  })

  describe('links', () => {
    it('renders a link with the correct href', () => {
      const content = makeContent([
        {
          type: 'link',
          url: 'https://example.com',
          newTab: false,
          children: [{ type: 'text', text: 'Visit us', format: 0 }],
        },
      ])
      render(<RichTextRenderer content={content} />)
      const link = screen.getByRole('link', { name: 'Visit us' })
      expect(link).toHaveAttribute('href', 'https://example.com')
    })

    it('adds target="_blank" and rel="noopener noreferrer" for new-tab links', () => {
      const content = makeContent([
        {
          type: 'link',
          url: 'https://external.com',
          newTab: true,
          children: [{ type: 'text', text: 'External', format: 0 }],
        },
      ])
      render(<RichTextRenderer content={content} />)
      const link = screen.getByRole('link', { name: 'External' })
      expect(link).toHaveAttribute('target', '_blank')
      expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    })

    it('does not add target attribute for same-tab links', () => {
      const content = makeContent([
        {
          type: 'link',
          url: 'https://example.com',
          newTab: false,
          children: [{ type: 'text', text: 'Internal', format: 0 }],
        },
      ])
      render(<RichTextRenderer content={content} />)
      expect(screen.getByRole('link', { name: 'Internal' })).not.toHaveAttribute('target')
    })
  })

  describe('lists', () => {
    it('renders a bullet (unordered) list with its items', () => {
      const content = makeContent([
        {
          type: 'list',
          listType: 'bullet',
          children: [
            { type: 'listitem', children: [{ type: 'text', text: 'Item A', format: 0 }] },
            { type: 'listitem', children: [{ type: 'text', text: 'Item B', format: 0 }] },
          ],
        },
      ])
      const { container } = render(<RichTextRenderer content={content} />)
      expect(container.querySelector('ul')).toBeInTheDocument()
      expect(screen.getByText('Item A')).toBeInTheDocument()
      expect(screen.getByText('Item B')).toBeInTheDocument()
    })

    it('renders a numbered (ordered) list with its items', () => {
      const content = makeContent([
        {
          type: 'list',
          listType: 'number',
          children: [
            { type: 'listitem', children: [{ type: 'text', text: 'Step 1', format: 0 }] },
            { type: 'listitem', children: [{ type: 'text', text: 'Step 2', format: 0 }] },
          ],
        },
      ])
      const { container } = render(<RichTextRenderer content={content} />)
      expect(container.querySelector('ol')).toBeInTheDocument()
      expect(screen.getByText('Step 1')).toBeInTheDocument()
      expect(screen.getByText('Step 2')).toBeInTheDocument()
    })
  })

  describe('blockquote', () => {
    it('renders a blockquote with the correct text', () => {
      const content = makeContent([
        {
          type: 'quote',
          children: [{ type: 'text', text: 'Craft is the soul of design.', format: 0 }],
        },
      ])
      const { container } = render(<RichTextRenderer content={content} />)
      expect(container.querySelector('blockquote')).toHaveTextContent(
        'Craft is the soul of design.',
      )
    })
  })

  describe('upload (image node)', () => {
    it('renders an image with the correct src and alt', () => {
      const content = makeContent([
        {
          type: 'upload',
          value: { url: 'https://cdn.example.com/photo.jpg', alt: 'A teak chair' },
        },
      ])
      render(<RichTextRenderer content={content} />)
      const img = screen.getByAltText('A teak chair')
      expect(img).toHaveAttribute('src', 'https://cdn.example.com/photo.jpg')
    })
  })

  describe('multiple nodes', () => {
    it('renders multiple nodes in sequence', () => {
      const content = makeContent([
        { type: 'heading', tag: 'h2', children: [{ type: 'text', text: 'Title', format: 0 }] },
        { type: 'paragraph', children: [{ type: 'text', text: 'Body text here.', format: 0 }] },
      ])
      render(<RichTextRenderer content={content} />)
      expect(screen.getByRole('heading', { level: 2, name: 'Title' })).toBeInTheDocument()
      expect(screen.getByText('Body text here.')).toBeInTheDocument()
    })
  })
})
