import type { Metadata } from 'next'
import Image from 'next/image'
import { MapPin, Phone, Mail, MessageCircle } from 'lucide-react'
import { ContactForm } from '@/components/contact/ContactForm'

export const dynamic = 'force-static'

export const metadata: Metadata = {
  title: 'Contact Us — Treasure Trove',
  description: 'Get in touch with the Treasure Trove team. We reply within one business day.',
}

// Contact channels — kept here so the display text and the link target stay in sync.
const PHONE_DISPLAY = '+91 (80) 4567 8900'
const PHONE_TEL = 'tel:+918045678900' // E.164, no spaces/punctuation
const EMAIL = 'concierge@treasuretrove.in'
const WHATSAPP_CHAT_URL = 'https://wa.me/918045678900'
const ADDRESS = 'No. 42, Heritage Mews, Whitefield Main Road, Bengaluru, Karnataka 560066'
const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`

export default function ContactPage() {
  return (
    <div className="pt-[92px] lg:pt-[112px]" data-testid="contact-page">
      {/* Hero Band — premium dark band with a soft gold glow */}
      <section
        className="relative overflow-hidden px-6 py-10 md:py-12 text-center"
        style={{
          backgroundColor: 'var(--color-tt-ink)',
          backgroundImage:
            'radial-gradient(ellipse 70% 75% at 50% -15%, rgba(213,198,143,0.20), transparent 70%)',
        }}
      >
        {/* Faint decorative rings in the top-right for depth */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 -right-12 w-56 h-56 rounded-full border border-white/[0.05]"
        />

        <div className="relative max-w-2xl mx-auto flex flex-col items-center">
          {/* Eyebrow framed by short gold rules */}
          <div className="flex items-center gap-3 mb-6">
            <span className="h-px w-8 bg-[var(--color-tt-gold)]/50" />
            <p className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-gold)]">
              We&apos;re here to help
            </p>
            <span className="h-px w-8 bg-[var(--color-tt-gold)]/50" />
          </div>

          <h1
            className="text-4xl md:text-6xl font-bold text-white text-balance"
            style={{ letterSpacing: '-0.02em' }}
          >
            Contact <span className="text-[var(--color-tt-gold)]">Us</span>
          </h1>

          {/* Gold divider accent */}
          <span className="mt-6 h-[3px] w-16 rounded-full bg-[var(--color-tt-gold)]" />

          <p className="mt-6 text-base md:text-lg text-white/65 max-w-xl mx-auto text-balance leading-relaxed">
            Questions about an order, a product, or a bulk enquiry? Our concierge replies within one
            business day.
          </p>
        </div>
      </section>

      {/* Form + Info Grid — on the warm surface so the white form card has contrast */}
      <section
        className="px-6 md:px-16 py-12 md:py-16"
        style={{ backgroundColor: 'var(--color-tt-surface)' }}
      >
        <div className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left: Contact Form — 7 cols */}
          <div className="lg:col-span-7" data-testid="contact-form-section">
            <ContactForm />
          </div>

          {/* Right: Light info panel — 5 cols */}
          <div className="lg:col-span-5" data-testid="contact-info-section">
            <div className="h-full rounded-lg p-8 md:p-10 flex flex-col bg-[var(--color-tt-surface-container)] border border-[var(--color-tt-outline-variant)]/40 shadow-[0_20px_40px_rgba(31,27,22,0.03)]">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--color-tt-ink)]">
                  Reach us directly
                </h2>
                <p className="text-sm text-[var(--color-tt-ink-muted)] mt-2 leading-relaxed">
                  Prefer to talk? Our team is available across every channel below.
                </p>
              </div>

              <div className="mt-7 flex-1 divide-y divide-[var(--color-tt-outline-variant)]/50">
                {/* Visit Us — links to Google Maps directions */}
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-visit"
                  aria-label="Get directions to our Bengaluru flagship"
                  className="group flex items-start gap-4 py-5 first:pt-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tt-gold)]/50 rounded-sm"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--color-tt-gold)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-tt-gold)]/35 transition-colors">
                    <MapPin size={18} strokeWidth={1.75} className="text-[var(--color-tt-gold)]" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink)] group-hover:text-[var(--color-tt-gold)] transition-colors">
                      Visit Us
                    </h3>
                    <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1.5 leading-relaxed">
                      No. 42, Hèritage Mews, Whitefield Main Road, Bengaluru, Karnataka 560066
                    </p>
                    <p className="text-xs text-[var(--color-tt-outline)] mt-2">
                      Mon – Sat: 10 AM – 8 PM · Sun: 11 AM – 6 PM
                    </p>
                  </div>
                </a>

                {/* Call Us — dials the number */}
                <a
                  href={PHONE_TEL}
                  data-testid="contact-call"
                  aria-label={`Call us at ${PHONE_DISPLAY}`}
                  className="group flex items-center gap-4 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tt-gold)]/50 rounded-sm"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--color-tt-gold)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-tt-gold)]/35 transition-colors">
                    <Phone size={18} strokeWidth={1.75} className="text-[var(--color-tt-gold)]" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink)]">
                      Call Us
                    </h3>
                    <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1 group-hover:text-[var(--color-tt-gold)] transition-colors">
                      {PHONE_DISPLAY}
                    </p>
                  </div>
                </a>

                {/* Email Us — opens the mail client */}
                <a
                  href={`mailto:${EMAIL}`}
                  data-testid="contact-email"
                  aria-label={`Email us at ${EMAIL}`}
                  className="group flex items-center gap-4 py-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tt-gold)]/50 rounded-sm"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--color-tt-gold)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-tt-gold)]/35 transition-colors">
                    <Mail size={18} strokeWidth={1.75} className="text-[var(--color-tt-gold)]" />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink)]">
                      Email Us
                    </h3>
                    <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1 break-all group-hover:text-[var(--color-tt-gold)] transition-colors">
                      {EMAIL}
                    </p>
                  </div>
                </a>

                {/* Live Chat — opens WhatsApp chat */}
                <a
                  href={WHATSAPP_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="contact-chat"
                  aria-label="Start a chat with us on WhatsApp"
                  className="group flex items-start gap-4 py-5 last:pb-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-tt-gold)]/50 rounded-sm"
                >
                  <span className="w-10 h-10 rounded-full bg-[var(--color-tt-gold)]/20 flex items-center justify-center shrink-0 group-hover:bg-[var(--color-tt-gold)]/35 transition-colors">
                    <MessageCircle
                      size={18}
                      strokeWidth={1.75}
                      className="text-[var(--color-tt-gold)]"
                    />
                  </span>
                  <div>
                    <h3 className="text-xs font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink)] group-hover:text-[var(--color-tt-gold)] transition-colors">
                      Live Chat
                    </h3>
                    <p className="text-sm text-[var(--color-tt-ink-muted)] mt-1">
                      Chat with our experts on WhatsApp for instant support.
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section
        className="w-full h-[400px] relative overflow-hidden group"
        style={{ backgroundColor: 'var(--color-tt-surface-container)' }}
        data-testid="contact-map"
      >
        <Image
          src="https://images.unsplash.com/photo-1524813686514-a57563d77965?w=1920&q=80"
          alt="Aerial view of the city around the Treasure Trove flagship in Bengaluru"
          fill
          sizes="100vw"
          className="object-cover grayscale brightness-90 group-hover:grayscale-0 transition-all duration-1000"
        />
        <a
          href={MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="contact-map-link"
          aria-label="Open Treasure Trove, Bengaluru in Google Maps"
          className="absolute inset-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-tt-gold)]"
        >
          <div
            className="px-8 py-6 rounded-sm shadow-xl flex items-center gap-4 transition-transform duration-300 group-hover:scale-[1.03]"
            style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)' }}
            data-testid="contact-map-card"
          >
            <div className="w-12 h-12 rounded-full bg-[var(--color-tt-gold)] flex items-center justify-center shrink-0">
              <MapPin size={18} strokeWidth={2} className="text-[var(--color-tt-ink)]" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-widest-ui uppercase text-[var(--color-tt-ink-muted)]">
                Our Flagship
              </p>
              <p className="font-bold text-[var(--color-tt-ink)]">Treasure Trove, Bengaluru</p>
              <p className="text-[11px] font-semibold text-[var(--color-tt-gold)] mt-1">
                View on Google Maps →
              </p>
            </div>
          </div>
        </a>
      </section>
    </div>
  )
}
