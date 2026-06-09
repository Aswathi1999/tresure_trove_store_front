import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/image', () => ({
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}))

import { MobileImageCarousel } from './MobileImageCarousel'

const images = [
  { id: 'img-1', url: 'https://cdn.example.com/a.jpg', alt: 'A' },
  { id: 'img-2', url: 'https://cdn.example.com/b.jpg', alt: 'B' },
  { id: 'img-3', url: 'https://cdn.example.com/c.jpg', alt: 'C' },
]

function renderCarousel(overrides: Partial<React.ComponentProps<typeof MobileImageCarousel>> = {}) {
  const onSelect = vi.fn()
  render(
    <MobileImageCarousel
      images={images}
      title="Chair"
      activeIndex={0}
      onSelect={onSelect}
      overrideOverlayUrl={null}
      {...overrides}
    />,
  )
  return { onSelect }
}

describe('MobileImageCarousel', () => {
  it('renders one slide image per product image', () => {
    renderCarousel()
    images.forEach((img) => {
      expect(screen.getByAltText(img.alt)).toBeInTheDocument()
    })
  })

  it('renders a dot button for each image', () => {
    renderCarousel()
    images.forEach((_, i) => {
      expect(screen.getByTestId(`dot-${i}`)).toBeInTheDocument()
    })
  })

  it('calls onSelect with the index when a dot is tapped', async () => {
    const user = userEvent.setup()
    const { onSelect } = renderCarousel()
    await user.click(screen.getByTestId('dot-2'))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('marks the active dot as wide (selected) and others as narrow', () => {
    renderCarousel({ activeIndex: 1 })
    expect(screen.getByTestId('dot-1').className).toContain('w-4')
    expect(screen.getByTestId('dot-0').className).toContain('w-1.5')
  })

  it('overlays an out-of-gallery variant image when overrideOverlayUrl is set', () => {
    renderCarousel({ overrideOverlayUrl: 'https://cdn.example.com/variant-only.jpg' })
    const overlay = screen
      .getAllByAltText('Chair')
      .find((el) => el.getAttribute('src') === 'https://cdn.example.com/variant-only.jpg')
    expect(overlay).toBeDefined()
  })

  it('does not throw in jsdom where scrollTo is unavailable (active dot still set)', () => {
    // activeIndex !== 0 exercises the scroll effect; clientWidth is 0 in jsdom so
    // it bails before calling scrollTo — this asserts the guard holds.
    renderCarousel({ activeIndex: 2 })
    expect(screen.getByTestId('dot-2').className).toContain('w-4')
  })
})
