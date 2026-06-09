import type { Field } from 'payload'

export const heroFields: Field[] = [
  // ── Hero carousel (left 65% on desktop, full-width on mobile) ──────────────
  {
    name: 'heroSlides',
    type: 'array',
    admin: {
      description:
        'Slides in the main hero carousel. Leave empty to show the built-in default slides.',
    },
    fields: [
      {
        name: 'badge',
        type: 'text',
        required: true,
        admin: { description: 'Eyebrow label, e.g. "FESTIVE EDIT"' },
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        admin: { description: 'Headline shown on the slide' },
      },
      {
        name: 'subtitle',
        type: 'textarea',
        admin: { description: 'Supporting line (desktop only)' },
      },
      {
        name: 'ctaLabel',
        type: 'text',
        admin: { description: 'Button text, e.g. "SHOP THE EDIT"' },
      },
      {
        name: 'ctaHref',
        type: 'text',
        admin: { description: 'Button link, e.g. "/collections"' },
      },
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      {
        name: 'order',
        type: 'number',
        admin: { description: 'Lower numbers appear first' },
      },
    ],
  },
  // ── Legacy single-hero fields ──────────────────────────────────────────────
  // Superseded by heroSlides above and no longer rendered. Retained so existing
  // stored data and the schema are untouched; safe to remove in a later migration.
  {
    name: 'heroHeadline',
    type: 'text',
    required: true,
    defaultValue: 'Crafted for Living',
    admin: { description: 'Legacy — superseded by Hero Slides. Not rendered.' },
  },
  { name: 'heroSubtext', type: 'text', admin: { description: 'Legacy — not rendered.' } },
  { name: 'heroCtaLabel', type: 'text', admin: { description: 'Legacy — not rendered.' } },
  { name: 'heroCtaLink', type: 'text', admin: { description: 'Legacy — not rendered.' } },
  {
    name: 'heroBackgroundImage',
    type: 'upload',
    relationTo: 'media',
    admin: { description: 'Legacy — not rendered.' },
  },
  // ── Editor's Pick (right 35% on desktop) ───────────────────────────────────
  {
    name: 'heroEditorPickTitle',
    type: 'text',
    admin: { description: "Title shown on the Editor's Pick card (right panel of desktop hero)" },
  },
  {
    name: 'heroEditorPickLink',
    type: 'text',
    admin: { description: "Link for the Editor's Pick card" },
  },
  {
    name: 'heroEditorPickImage',
    type: 'upload',
    relationTo: 'media',
    admin: { description: "Background image for the Editor's Pick card" },
  },
]
