/**
 * Seed script — 5 sample Treasure Trove luxury furniture products.
 *
 * Run with:
 *   pnpm db:seed-products
 *
 * Prices are in smallest currency unit: paise (INR) and cents (USD).
 * Each product gets a "draft" status so it must be published from the Admin UI.
 * Re-running is safe — existing handles are skipped by the bulk import workflow.
 */

import type { ExecArgs } from '@medusajs/framework/types'
import { bulkImportProductsWorkflow, type BulkImportRow } from '../workflows/bulk-import-products'

const SAMPLE_PRODUCTS: BulkImportRow[] = [
  // ── 1. Ōkura Lounge Chair ─────────────────────────────────────────────────
  {
    title: 'Ōkura Lounge Chair',
    handle: 'okura-lounge-chair',
    description:
      'A sculptural lounge chair hand-carved from sustainably sourced teak. Mortise-and-tenon joinery, no metal fasteners. Cushion in natural linen.',
    variant_sku: 'OKR-TEAK-SM',
    price_inr: 14500000, // ₹1,45,000
    price_usd: 175000, // $1,750
    stock: 4,
    material: 'Teak',
    size: 'Small',
    finish: 'Natural',
    wood_type: 'teak',
    dimensions: '72x80x85 cm',
    warranty: '10 years structural, 2 years upholstery',
  },
  {
    title: 'Ōkura Lounge Chair',
    handle: 'okura-lounge-chair',
    description:
      'A sculptural lounge chair hand-carved from sustainably sourced teak. Mortise-and-tenon joinery, no metal fasteners. Cushion in natural linen.',
    variant_sku: 'OKR-TEAK-LG',
    price_inr: 16500000, // ₹1,65,000
    price_usd: 200000, // $2,000
    stock: 3,
    material: 'Teak',
    size: 'Large',
    finish: 'Natural',
    wood_type: 'teak',
    dimensions: '82x90x92 cm',
    warranty: '10 years structural, 2 years upholstery',
  },
  {
    title: 'Ōkura Lounge Chair',
    handle: 'okura-lounge-chair',
    description:
      'A sculptural lounge chair hand-carved from sustainably sourced teak. Mortise-and-tenon joinery, no metal fasteners. Cushion in natural linen.',
    variant_sku: 'OKR-TEAK-LG-DARK',
    price_inr: 17000000, // ₹1,70,000
    price_usd: 205000, // $2,050
    stock: 2,
    material: 'Teak',
    size: 'Large',
    finish: 'Dark',
    wood_type: 'teak',
    dimensions: '82x90x92 cm',
    warranty: '10 years structural, 2 years upholstery',
  },

  // ── 2. Kayu Dining Table ──────────────────────────────────────────────────
  {
    title: 'Kayu Dining Table',
    handle: 'kayu-dining-table',
    description:
      'Live-edge walnut dining table with a hand-finished oil treatment. Each slab is unique — grain patterns vary. Hairpin steel legs in matte black.',
    variant_sku: 'KYU-WALNUT-4S',
    price_inr: 32000000, // ₹3,20,000
    price_usd: 385000, // $3,850
    stock: 2,
    material: 'Walnut',
    size: '4-Seater',
    finish: 'Natural',
    wood_type: 'walnut',
    dimensions: '160x90x76 cm',
    warranty: '15 years structural',
  },
  {
    title: 'Kayu Dining Table',
    handle: 'kayu-dining-table',
    description:
      'Live-edge walnut dining table with a hand-finished oil treatment. Each slab is unique — grain patterns vary. Hairpin steel legs in matte black.',
    variant_sku: 'KYU-WALNUT-6S',
    price_inr: 42000000, // ₹4,20,000
    price_usd: 505000, // $5,050
    stock: 2,
    material: 'Walnut',
    size: '6-Seater',
    finish: 'Natural',
    wood_type: 'walnut',
    dimensions: '210x95x76 cm',
    warranty: '15 years structural',
  },
  {
    title: 'Kayu Dining Table',
    handle: 'kayu-dining-table',
    description:
      'Live-edge walnut dining table with a hand-finished oil treatment. Each slab is unique — grain patterns vary. Hairpin steel legs in matte black.',
    variant_sku: 'KYU-WALNUT-8S',
    price_inr: 55000000, // ₹5,50,000
    price_usd: 660000, // $6,600
    stock: 1,
    material: 'Walnut',
    size: '8-Seater',
    finish: 'Natural',
    wood_type: 'walnut',
    dimensions: '260x100x76 cm',
    warranty: '15 years structural',
  },

  // ── 3. Sova Bed Frame ─────────────────────────────────────────────────────
  {
    title: 'Sova Bed Frame',
    handle: 'sova-bed-frame',
    description:
      'Low-profile platform bed in solid white oak with a hand-rubbed natural oil finish. Slat base included — no box spring required. Headboard height 90 cm.',
    variant_sku: 'SVA-OAK-QUEEN',
    price_inr: 22000000, // ₹2,20,000
    price_usd: 265000, // $2,650
    stock: 5,
    material: 'Oak',
    size: 'Queen',
    finish: 'Natural',
    wood_type: 'oak',
    dimensions: '170x210x90 cm',
    warranty: '10 years structural',
  },
  {
    title: 'Sova Bed Frame',
    handle: 'sova-bed-frame',
    description:
      'Low-profile platform bed in solid white oak with a hand-rubbed natural oil finish. Slat base included — no box spring required. Headboard height 90 cm.',
    variant_sku: 'SVA-OAK-KING',
    price_inr: 26000000, // ₹2,60,000
    price_usd: 315000, // $3,150
    stock: 4,
    material: 'Oak',
    size: 'King',
    finish: 'Natural',
    wood_type: 'oak',
    dimensions: '200x215x90 cm',
    warranty: '10 years structural',
  },

  // ── 4. Arashi Coffee Table ────────────────────────────────────────────────
  {
    title: 'Arashi Coffee Table',
    handle: 'arashi-coffee-table',
    description:
      'Solid mango wood coffee table with an asymmetric edge profile. Each piece is finished by hand using non-toxic linseed oil. Subtle grain movement across the surface.',
    variant_sku: 'ARS-MANGO-SM',
    price_inr: 8500000, // ₹85,000
    price_usd: 102000, // $1,020
    stock: 8,
    material: 'Mango',
    size: 'Small',
    finish: 'Light',
    wood_type: 'mango',
    dimensions: '90x55x40 cm',
    warranty: '5 years structural',
  },
  {
    title: 'Arashi Coffee Table',
    handle: 'arashi-coffee-table',
    description:
      'Solid mango wood coffee table with an asymmetric edge profile. Each piece is finished by hand using non-toxic linseed oil. Subtle grain movement across the surface.',
    variant_sku: 'ARS-MANGO-LG',
    price_inr: 11500000, // ₹1,15,000
    price_usd: 138000, // $1,380
    stock: 6,
    material: 'Mango',
    size: 'Large',
    finish: 'Light',
    wood_type: 'mango',
    dimensions: '120x65x42 cm',
    warranty: '5 years structural',
  },

  // ── 5. Nishi Bookshelf ────────────────────────────────────────────────────
  {
    title: 'Nishi Bookshelf',
    handle: 'nishi-bookshelf',
    description:
      'Freestanding bookshelf in Indian rosewood (sheesham). Open shelves with adjustable peg positions. Rich reddish-brown grain deepens with age.',
    variant_sku: 'NSH-ROSEWOOD-3T',
    price_inr: 9500000, // ₹95,000
    price_usd: 114000, // $1,140
    stock: 6,
    material: 'Rosewood',
    size: '3-Tier',
    finish: 'Natural',
    wood_type: 'rosewood',
    dimensions: '90x35x120 cm',
    warranty: '10 years structural',
  },
  {
    title: 'Nishi Bookshelf',
    handle: 'nishi-bookshelf',
    description:
      'Freestanding bookshelf in Indian rosewood (sheesham). Open shelves with adjustable peg positions. Rich reddish-brown grain deepens with age.',
    variant_sku: 'NSH-ROSEWOOD-5T',
    price_inr: 14000000, // ₹1,40,000
    price_usd: 168000, // $1,680
    stock: 4,
    material: 'Rosewood',
    size: '5-Tier',
    finish: 'Natural',
    wood_type: 'rosewood',
    dimensions: '90x35x190 cm',
    warranty: '10 years structural',
  },
]

export default async function seedProducts({ container }: ExecArgs) {
  console.log(
    `[seed-products] Seeding ${new Set(SAMPLE_PRODUCTS.map((r) => r.handle)).size} products (${SAMPLE_PRODUCTS.length} variants)…`,
  )

  const { result } = await bulkImportProductsWorkflow(container).run({
    input: { rows: SAMPLE_PRODUCTS },
  })

  console.log('[seed-products] Done.')
  console.log(`  Created : ${result.created.join(', ') || '—'}`)
  console.log(`  Updated : ${result.updated.join(', ') || '—'}`)
  console.log(`  Skipped : ${result.skipped.join(', ') || '—'}`)

  if (result.failed.length > 0) {
    console.error('[seed-products] Failures:')
    for (const f of result.failed) {
      console.error(`  ${f.handle}: ${f.error}`)
    }
    process.exitCode = 1
  }
}
