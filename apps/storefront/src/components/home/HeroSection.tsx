import Image from 'next/image'
import Link from 'next/link'
import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'
import type { HeroContent } from '@/lib/payload'

interface HeroSectionProps {
  content: HeroContent | null
  slides?: HeroSlide[]
}

const EDITOR_PICK_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD2A_bMriIenjXbc-TJUVi6Ly3AhLTwFvsdFpO6Hkj2lr3KFA-76ucKvz4VoBiEbVLqZmna8Ndz_bLE-UQBGWAbTVsEfavlltqefslhjn_wyKmLxGYF8McsyHjvx9GGPZnhYcIt2AyxzYTnae89Xb1481u-RUo1suRg66wXsh0uJeD3GWx1q_74va8yuSUiiAG9qHdP_2z5PyQxrZVvNx6D9HN30c1n4MN0YvpN2SvRmasoAowMSzOVdldbg_Qsg1bWSLgcunW9-jVZ'

export function HeroSection({ content, slides }: HeroSectionProps) {
  const editorPickTitle = content?.editorPickTitle ?? "Editor's Pick"
  const editorPickHref = content?.editorPickHref ?? '/collections'
  const editorPickImage = content?.editorPickImageUrl || EDITOR_PICK_IMAGE

  return (
    <section aria-label="Hero">
      {/* Desktop Hero */}
      <div className="hidden lg:flex h-[540px] w-full">
        {/* Left — Carousel 65% */}
        <div className="relative flex-[65] overflow-hidden h-full">
          <HeroCarousel size="desktop" slides={slides} />
        </div>

        {/* Right — Editor's Pick 35% */}
        <div className="relative flex-[35] overflow-hidden">
          <Image
            src={editorPickImage}
            alt="Editor's pick — lighting collection"
            fill
            priority
            sizes="35vw"
            className="object-cover"
          />
          {/* Bottom card overlay — gradient scrim keeps the image visible while
              the white text stays legible over the photo. */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-5 pt-14 pb-4">
            <p className="text-white text-[14px] font-bold tracking-widest mb-1.5 drop-shadow-md [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              EDITOR&apos;S PICK
            </p>
            <p className="text-white text-xl font-bold mb-2.5 drop-shadow [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              {editorPickTitle}
            </p>
            <Link
              href={editorPickHref}
              className="text-white text-sm font-bold tracking-widest drop-shadow [text-shadow:0_1px_3px_rgba(0,0,0,0.9)] hover:text-[var(--color-tt-orange)] transition-colors"
            >
              EXPLORE →
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Hero */}
      <div className="lg:hidden mx-4 mt-7 mb-4 flex flex-col gap-4">
        <HeroCarousel size="mobile" slides={slides} />

        {/* Mobile Editor's Pick */}
        <Link
          href={editorPickHref}
          className="relative block w-full aspect-square overflow-hidden rounded-lg"
          aria-label={`Editor's Pick — ${editorPickTitle}`}
        >
          {/* Anchor to the top so portrait images aren't cropped at the top —
              the bottom crop sits under the text gradient below. */}
          <Image
            src={editorPickImage}
            alt="Editor's pick"
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-4 pt-12 pb-3">
            <p className="text-white text-[15px] font-bold tracking-widest mb-1 drop-shadow-md [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
              EDITOR&apos;S PICK
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-white text-base font-bold leading-snug truncate drop-shadow [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                {editorPickTitle}
              </p>
              <span className="text-white text-[13px] font-bold tracking-widest whitespace-nowrap drop-shadow [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]">
                EXPLORE →
              </span>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}
