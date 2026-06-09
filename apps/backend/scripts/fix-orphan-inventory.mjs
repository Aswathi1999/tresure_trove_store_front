#!/usr/bin/env node
/**
 * Fix "orphan" variants — those that track inventory but have NO inventory item
 * of their own (created without inventory enabled, or never linked). The admin
 * UI can't create a dedicated item for them, which forces users to link another
 * product's item on the "Manage inventory items" page → shared stock / mismatch.
 *
 * This finds every variant with no linked inventory item and creates + links a
 * dedicated one (SKU = the variant's SKU, or a generated fallback). It does NOT
 * set stock (leave that to you) and never touches variants that already have an
 * item. Idempotent: re-running only fixes whatever is still orphaned.
 *
 * Usage (PowerShell):
 *   $env:MEDUSA_BACKEND_URL="http://localhost:9000"
 *   $env:ADMIN_EMAIL="admin@treasure-trove.in"; $env:ADMIN_PASSWORD="..."
 *   node scripts/fix-orphan-inventory.mjs           # dry run (lists, no changes)
 *   node scripts/fix-orphan-inventory.mjs --apply   # actually fix
 *
 * For the deployed server set MEDUSA_BACKEND_URL to its https URL.
 */

const BASE = process.env.MEDUSA_BACKEND_URL || 'http://localhost:9000'
const EMAIL = process.env.ADMIN_EMAIL
const PASSWORD = process.env.ADMIN_PASSWORD
const APPLY = process.argv.includes('--apply')

if (!EMAIL || !PASSWORD) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD env vars.')
  process.exit(1)
}

function slug(v) {
  return String(v || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 24)
}

async function main() {
  const authRes = await fetch(`${BASE}/auth/user/emailpass`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  })
  const { token } = await authRes.json()
  if (!token) {
    console.error('Auth failed.')
    process.exit(1)
  }
  const H = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

  console.log(`[fix-orphan-inventory] ${BASE} — ${APPLY ? 'APPLY' : 'DRY RUN'}`)

  const limit = 100
  let offset = 0
  let total = Infinity
  let scanned = 0
  const orphans = []

  while (offset < total) {
    const fields =
      'id,handle,title,variants.id,variants.title,variants.sku,variants.manage_inventory,variants.inventory_items.inventory.id'
    const res = await fetch(
      `${BASE}/admin/products?limit=${limit}&offset=${offset}&fields=${encodeURIComponent(fields)}`,
      { headers: H },
    )
    const data = await res.json()
    total = data.count ?? 0
    for (const p of data.products || []) {
      for (const v of p.variants || []) {
        scanned++
        const hasItem = (v.inventory_items || []).some((ii) => ii.inventory && ii.inventory.id)
        if (v.manage_inventory && !hasItem) {
          orphans.push({
            productId: p.id,
            handle: p.handle,
            variantId: v.id,
            title: v.title,
            sku: v.sku,
          })
        }
      }
    }
    offset += limit
  }

  console.log(
    `Scanned ${scanned} variants — found ${orphans.length} orphan(s) (manage_inventory, no item).`,
  )
  for (const o of orphans) console.log(`  - ${o.handle} / ${o.title} (sku: ${o.sku ?? 'none'})`)

  if (!APPLY) {
    console.log('\nDry run only. Re-run with --apply to create dedicated inventory items.')
    return
  }

  let fixed = 0
  for (const o of orphans) {
    const sku = o.sku && o.sku.trim() ? o.sku : `${slug(o.handle)}-${o.variantId.slice(-6)}`

    // Re-link an existing item with this SKU (e.g. created earlier but unlinked)
    // instead of creating a duplicate — SKUs are unique per variant, so an item
    // with this SKU is this variant's own.
    let itemId
    const existing = await fetch(
      `${BASE}/admin/inventory-items?sku[]=${encodeURIComponent(sku)}&fields=id,sku`,
      { headers: H },
    )
    const ej = await existing.json()
    if ((ej.inventory_items || []).length > 0) {
      itemId = ej.inventory_items[0].id
    } else {
      const create = await fetch(`${BASE}/admin/inventory-items`, {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ sku }),
      })
      const cj = await create.json()
      itemId = cj.inventory_item && cj.inventory_item.id
    }
    if (!itemId) {
      console.error(`  ✗ ${o.handle}/${o.title}: could not resolve/create item for sku ${sku}`)
      continue
    }
    const link = await fetch(
      `${BASE}/admin/products/${o.productId}/variants/${o.variantId}/inventory-items`,
      {
        method: 'POST',
        headers: H,
        body: JSON.stringify({ inventory_item_id: itemId, required_quantity: 1 }),
      },
    )
    if (!link.ok) {
      console.error(
        `  ✗ ${o.handle}/${o.title}: link failed — ${(await link.text()).slice(0, 160)}`,
      )
      continue
    }
    console.log(`  ✓ ${o.handle}/${o.title} -> ${sku} (${itemId})`)
    fixed++
  }
  console.log(
    `\nDone. Fixed ${fixed}/${orphans.length}. Set stock per item in the admin (or via location-levels).`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
