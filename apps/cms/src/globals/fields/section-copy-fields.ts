import type { Field } from 'payload'

// Editorial copy for the headings/eyebrows that wrap the dynamic product,
// collection, category, and blog rows. Leave any field blank to keep the
// storefront's built-in default text.
export const sectionCopyFields: Field[] = [
  // ── Bestsellers ─────────────────────────────────────────────────────────
  {
    name: 'bestsellersTitle',
    type: 'text',
    admin: { description: 'Bestsellers section heading (default: "Bestsellers")' },
  },
  { name: 'bestsellersSubtitle', type: 'text' },
  { name: 'bestsellersViewAllLabel', type: 'text' },
  { name: 'bestsellersViewAllHref', type: 'text' },
  // ── New Arrivals ────────────────────────────────────────────────────────
  {
    name: 'newArrivalsTitle',
    type: 'text',
    admin: { description: 'New Arrivals section heading (default: "New Arrivals")' },
  },
  { name: 'newArrivalsSubtitle', type: 'text' },
  { name: 'newArrivalsViewAllLabel', type: 'text' },
  { name: 'newArrivalsViewAllHref', type: 'text' },
  // ── Our Collections ───────────────────────────────────────────────────────
  {
    name: 'collectionsHeading',
    type: 'text',
    admin: { description: 'Heading above the collections grid (default: "Our Collections")' },
  },
  { name: 'collectionsSubtitle', type: 'text' },
  // ── Shop by Category ────────────────────────────────────────────────────
  { name: 'categoryEyebrow', type: 'text', admin: { description: 'Default: "Browse"' } },
  {
    name: 'categoryHeading',
    type: 'text',
    admin: { description: 'Default: "Shop by Category"' },
  },
  { name: 'categorySubtitle', type: 'text' },
  // ── From Our Journal ──────────────────────────────────────────────────────
  { name: 'journalEyebrow', type: 'text', admin: { description: 'Default: "Journal"' } },
  {
    name: 'journalHeading',
    type: 'text',
    admin: { description: 'Default: "From Our Journal"' },
  },
  { name: 'journalSubtitle', type: 'text' },
]
