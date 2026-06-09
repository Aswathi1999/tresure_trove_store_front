import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { HTMLAttributes, ReactNode } from 'react'

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    fill: _fill,
    sizes: _sizes,
    priority: _priority,
    className,
  }: {
    src: string
    alt: string
    fill?: boolean
    sizes?: string
    priority?: boolean
    className?: string
  }) => <img src={src} alt={alt} className={className} />,
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial: _i,
      animate: _a,
      exit: _e,
      transition: _t,
      custom: _c,
      ...rest
    }: HTMLAttributes<HTMLDivElement> & {
      children?: ReactNode
      initial?: unknown
      animate?: unknown
      exit?: unknown
      transition?: unknown
      custom?: unknown
    }) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children?: ReactNode }) => <>{children}</>,
}))

import { ImageGallery } from './ImageGallery'

const images = [
  { id: 'img-1', url: 'https://cdn.example.com/chair-front.jpg', alt: 'Chair front view' },
  { id: 'img-2', url: 'https://cdn.example.com/chair-side.jpg', alt: 'Chair side view' },
  { id: 'img-3', url: 'https://cdn.example.com/chair-back.jpg', alt: 'Chair back view' },
]

describe('ImageGallery', () => {
  it('renders the gallery container', () => {
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    expect(screen.getByTestId('image-gallery')).toBeInTheDocument()
  })

  it('renders the main image container', () => {
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    expect(screen.getByTestId('main-image')).toBeInTheDocument()
  })

  it('renders a thumbnail button for each image', () => {
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    images.forEach((_, i) => {
      expect(screen.getByTestId(`thumbnail-${i}`)).toBeInTheDocument()
    })
  })

  it('renders a dot button for each image', () => {
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    images.forEach((_, i) => {
      expect(screen.getByTestId(`dot-${i}`)).toBeInTheDocument()
    })
  })

  it('shows the first image in the main area on initial render', () => {
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    const mainArea = screen.getByTestId('main-image')
    expect(within(mainArea).getByAltText('Chair front view')).toBeInTheDocument()
  })

  it('switches the main image when a thumbnail is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    await user.click(screen.getByTestId('thumbnail-1'))
    const mainArea = screen.getByTestId('main-image')
    expect(within(mainArea).getByAltText('Chair side view')).toBeInTheDocument()
  })

  it('switches the main image when a dot is clicked', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    await user.click(screen.getByTestId('dot-2'))
    const mainArea = screen.getByTestId('main-image')
    expect(within(mainArea).getByAltText('Chair back view')).toBeInTheDocument()
  })

  it('falls back to the product title as alt text when image alt is empty', () => {
    const imagesWithEmptyAlt = [{ id: 'img-1', url: 'https://cdn.example.com/chair.jpg', alt: '' }]
    render(<ImageGallery images={imagesWithEmptyAlt} title="Ōkura Chair" />)
    const mainArea = screen.getByTestId('main-image')
    expect(within(mainArea).getByAltText('Ōkura Chair')).toBeInTheDocument()
  })

  it('renders the zoom hint text', () => {
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    expect(screen.getByText(/hover to zoom/i)).toBeInTheDocument()
  })

  it('re-selecting the active thumbnail keeps the same main image', async () => {
    const user = userEvent.setup()
    render(<ImageGallery images={images} title="Ōkura Chair" />)
    await user.click(screen.getByTestId('thumbnail-0'))
    const mainArea = screen.getByTestId('main-image')
    expect(within(mainArea).getByAltText('Chair front view')).toBeInTheDocument()
  })
})
