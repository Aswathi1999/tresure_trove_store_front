import Image from 'next/image'
import { Instagram } from 'lucide-react'
import { NewsletterForm } from './NewsletterForm'
import { BottomTabBar } from './BottomTabBar'
import { HomeLogoLink } from './HomeLogoLink'
import { FooterLink } from './FooterLink'
import logoImg from '@/assets/logo.jpg'

// ── Social icons (Pinterest & WhatsApp not in Lucide) ─────────────────────

function WhatsAppIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
    </svg>
  )
}

// ── Link data ──────────────────────────────────────────────────────────────

const SHOP_LINKS = [
  { label: 'All Products', href: '/products' },
  { label: 'New Arrivals', href: '/collections/new-arrivals' },
  { label: 'Bestsellers', href: '/collections/bestsellers' },
  { label: 'Sale & Offers', href: '/collections/sale' },
]

const JOURNAL_LINKS = [
  { label: 'Journal', href: '/journal' },
  { label: 'Materials', href: '/materials' },
  { label: 'Craftsmanship', href: '/craftsmanship' },
]

const COMPANY_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Careers', href: '/careers' },
  { label: 'Privacy Policy', href: '/policies/privacy', desktopOnly: true },
  { label: 'Terms of Service', href: '/policies/terms', desktopOnly: true },
]

const SOCIAL = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: () => <Instagram size={15} /> },
  { label: 'WhatsApp', href: 'https://wa.me', Icon: WhatsAppIcon },
  { label: 'Pinterest', href: 'https://pinterest.com', Icon: PinterestIcon },
]

const PAYMENT_METHODS = ['VISA', 'MC', 'UPI', 'RAZORPAY']

// ── Reusable footer column ─────────────────────────────────────────────────

function FooterColumn({
  title,
  links,
}: {
  title: string
  links: { label: string; href: string; desktopOnly?: boolean }[]
}) {
  return (
    <div>
      <h4 className="text-[var(--color-tt-gold)] text-[13px] sm:text-[14px] font-bold tracking-[0.3em] uppercase mb-3 sm:mb-5">
        {title}
      </h4>
      <ul className="flex flex-col gap-2.5 sm:gap-3.5">
        {links.map(({ label, href, desktopOnly }) => (
          <li key={label} className={desktopOnly ? 'hidden lg:list-item' : undefined}>
            <FooterLink
              href={href}
              className="text-white/80 text-[16px] sm:text-[17px] hover:text-[var(--color-tt-gold)] transition-colors duration-200"
            >
              {label}
            </FooterLink>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ── Footer ─────────────────────────────────────────────────────────────────

export function Footer() {
  return (
    <footer data-testid="footer" className="bg-[var(--color-tt-rose)]">
      {/* ── Newsletter strip ── */}
      <div data-testid="footer-newsletter" className="border-b border-white/10">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="shrink-0">
            <p className="text-[var(--color-tt-gold)] text-[12px] font-bold tracking-[0.3em] uppercase mb-1">
              Stay Inspired
            </p>
            <h3 className="text-white text-xl font-bold leading-snug">
              Get 10% off your first order
            </h3>
            <p className="text-white/70 text-[15px] mt-1">
              New arrivals, styling tips, and exclusive offers.
            </p>
          </div>
          <div className="w-full lg:w-[420px]">
            <NewsletterForm variant="desktop" />
          </div>
        </div>
      </div>

      {/* ── Main columns ── */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 pt-10 lg:pt-12 pb-8 lg:pb-10">
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-5 lg:gap-12">
          {/* Brand — 2 cols wide on desktop, full row on mobile */}
          <div className="lg:col-span-2">
            <HomeLogoLink aria-label="Treasure Trove home" className="inline-block mb-4 group">
              <div className="w-[52px] h-[52px] rounded-full border-2 border-[var(--color-tt-gold)] bg-white/95 overflow-hidden flex items-center justify-center group-hover:border-white transition-colors duration-300">
                <Image
                  src={logoImg}
                  alt="Treasure Trove"
                  height={40}
                  width={40}
                  className="w-full h-full object-contain"
                />
              </div>
            </HomeLogoLink>

            <p className="text-white/60 text-[12px] font-bold tracking-[0.3em] uppercase mb-2">
              Treasure Trove Atelier
            </p>
            <p className="text-white/80 text-[17px] leading-relaxed mb-5 max-w-[280px]">
              Crafted for Living — luxury home décor by Indian artisans.
            </p>

            {/* Social icons */}
            <div className="flex gap-2.5">
              {SOCIAL.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex w-9 h-9 items-center justify-center rounded-full border border-white/20 text-white/50 hover:border-[var(--color-tt-gold)] hover:text-[var(--color-tt-gold)] transition-all duration-200"
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns on phone: Shop fills the left column (it has the most
              items), Journal stacked above Company on the right. From sm up,
              all three columns sit side-by-side; on lg they take cols 3-5. */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 sm:gap-8 lg:col-span-3 lg:grid-cols-3">
            <div className="row-span-2 sm:row-span-1">
              <FooterColumn title="Shop" links={SHOP_LINKS} />
            </div>
            <FooterColumn title="Journal" links={JOURNAL_LINKS} />
            <FooterColumn title="Company" links={COMPANY_LINKS} />
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div data-testid="footer-bottom-bar" className="border-t border-white/10 pb-16 lg:pb-0">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 lg:py-5 flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
          {/* Copyright */}
          <p className="text-white/65 text-[13px] tracking-wide text-center lg:text-left">
            © 2026 Treasure Trove Atelier. All rights reserved.&nbsp;&nbsp;·&nbsp;&nbsp;Made in
            India
          </p>

          {/* Payment method badges */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {PAYMENT_METHODS.map((method) => (
              <span
                key={method}
                className="px-2.5 py-1 border border-white/25 text-white/65 text-[11px] font-bold tracking-[0.12em] rounded-sm"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>

      <BottomTabBar />
    </footer>
  )
}
