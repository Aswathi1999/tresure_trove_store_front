/* eslint-disable no-console */
import { getPayload } from 'payload'
import config from '../payload.config'

type SeedCard = {
  badge: string
  title: string
  linkLabel: string
  linkHref: string
  filename: string
  alt: string
  imageUrl: string
}

const OFFER_CARDS: SeedCard[] = [
  {
    badge: 'FESTIVE READY',
    title: 'Decor up to 30% off',
    linkLabel: 'SHOP DECOR',
    linkHref: '/collections/decor',
    filename: 'offer-1-festive-decor.jpg',
    alt: 'Festive decor under warm light',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBng-6O8h79tXp6sCk6iLfPPtRBzOMnq22E6Lb7zdDwZjfMzkDhwCNztPgVDy4kQAhDYqK0thbBgRgbaRFtb48fvnLKEeNA_bcosdC7XomWBKGUED31Zmq0mj9a-RPM5I76k_krBj2LHr5LeWAOmL-wBskaKMmAKRar79mZfVsLmSPq8Kj-k8EsodoQ-pDDHryaJK3g0gUFReVVn7FNtzA6NHaBoNsoVRt5A9W0JEY9qGcDFnPEfcD8pQqYIjvbQG6S20haVB7TzbTO',
  },
  {
    badge: 'NEW IN',
    title: 'Tableware & Table Linen',
    linkLabel: 'SHOP DINING',
    linkHref: '/collections/kitchen-dining',
    filename: 'offer-2-tableware-linen.jpg',
    alt: 'Tableware and table linens',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA0OO-AYw6Aulio_GFYgHhvGhDh86aKTB0IXUtqFlMuBfZSTewhL9EhoMqGU0E1YV0aam0SFZkcswoUd3inIGKjvdIsJTsC4gWgO6eWie_xjdEdhzUvgQy_hqC5MMeM-8O6BrprmdBcum3d7jnVFEKMi0RvG9zuUnfKGXHi55WN0k_Aeze5kGuKJViNQtpkR5N9LLieSthLMdSEHAAhI5EESQnDs96reQMU3B88PX7JWn9SFPr0xflZ08fgrcUo69qSk1HVuFvk8G_8',
  },
  {
    badge: "EDITOR'S EDIT",
    title: 'Indoor Lighting from ₹2,499',
    linkLabel: 'SHOP LIGHTING',
    linkHref: '/collections/lighting',
    filename: 'offer-3-indoor-lighting.jpg',
    alt: 'Indoor pendant lighting',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAp8sIRwMdlq8bI2dABToQ1JKNajky_Ddq4NKJeuAUFTp8rlW3R1qBs_RL0wcTZnJ_bMbOs_z9sbjre0Dy7GtQVC1A8lVWbN6TanpLpztft5zmdljcNPEF64hXCfeECG3kvy_9btLv4wXhoUs4ty9Ce14NTMYW9JAQ2YakO7oXpzRZxvmvLJsVxxN60Q9xLdPAlwNUsu8SPgY0IAlYcJJ4K6Hg8eDcWCmPHgHR6ICBM_1F54_yIXUckLKfDXZiA0PlL8v0E7fVv3Tmu',
  },
  {
    badge: 'MONSOON READY',
    title: 'Outdoor Planters from ₹1,499',
    linkLabel: 'SHOP OUTDOOR',
    linkHref: '/collections/outdoor',
    filename: 'offer-4-outdoor-planters.jpg',
    alt: 'Outdoor planters on a patio',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
  },
  {
    badge: 'SLOW LIVING',
    title: 'Organic Bed & Bath Linens',
    linkLabel: 'SHOP BED & BATH',
    linkHref: '/collections/bed-bath',
    filename: 'offer-5-bed-bath-linens.jpg',
    alt: 'Organic bed and bath linens',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAqG7MR5h1mr-EBbdHy2Odr2pLQ44kM4f2jchyRdGFgkD4bxap3qguWJczX3gdzA0ftuQP0UFGST5GVUUQFkptay25S0Ndz1F7PxLnDDxBqcLWUq7IUqZalAtjFeaXTeahiJmrF5Kb6M5sREY9MEOQB-90vQ7BYOZmAMgYt9_CrOCSJYq1uEHVHKQyuDhkJIxw5mUiGxp08p2WWMak8A-wZ0hhAD1FpuntHq0uohrjzf8VTK8RPCyI8Zl9vZ1vnvow8xW1wPwpSzYYP',
  },
  {
    badge: 'BAR CART',
    title: 'Glassware under ₹999',
    linkLabel: 'SHOP GLASSWARE',
    linkHref: '/collections/bar-glassware',
    filename: 'offer-6-glassware.jpg',
    alt: 'Crystal glassware on a bar cart',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDy_B7Co2pnY-mp5n4crXHR2pAzCDWPWL5UV23yPNf4gfL1GxilYTvcQmQtX5o1kVe5vXHp7fQMdndfc0qLSbn8TaS_r85qhDW6ay8jJREQg3EGs8Fer6lyNUvm6MljAo26Hc_FIlAzRErACASCj0xyOmbdkBBvd1n9gpBiP6uz6pNpKe0sghle55twrT_wHjvQfer25tIYJ1ZpmPjOaKwi_zlBA5bNBfwCmXFxk0R2W7IKT-vL1Cbd2fkT9L6Jiw7uAUX7u7cy6aVK',
  },
]

async function ensureMedia(
  payload: Awaited<ReturnType<typeof getPayload>>,
  card: SeedCard,
): Promise<string | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: card.filename } },
    limit: 1,
  })

  if (existing.docs.length > 0 && existing.docs[0]) {
    console.log(`  • media already exists for ${card.filename} — reusing`)
    return String(existing.docs[0].id)
  }

  console.log(`  • downloading ${card.imageUrl.slice(0, 80)}…`)
  const res = await fetch(card.imageUrl)
  if (!res.ok) {
    console.warn(`  ! download failed (HTTP ${res.status}) — skipping ${card.filename}`)
    return null
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const mimetype = res.headers.get('content-type') ?? 'image/jpeg'

  const created = await payload.create({
    collection: 'media',
    data: { alt: card.alt },
    file: {
      data: buffer,
      mimetype,
      name: card.filename,
      size: buffer.length,
    },
  })

  console.log(`  ✓ uploaded ${card.filename} (id: ${created.id})`)
  return String(created.id)
}

async function seedOfferCards(): Promise<void> {
  const payload = await getPayload({ config })

  console.log('Seeding offer cards into homepage-content global…')
  const seeded: Array<{
    badge: string
    title: string
    linkLabel: string
    linkHref: string
    image: string
    order: number
    enabled: boolean
  }> = []

  for (let i = 0; i < OFFER_CARDS.length; i++) {
    const card = OFFER_CARDS[i]!
    console.log(`[${i + 1}/${OFFER_CARDS.length}] ${card.badge} — ${card.title}`)
    const mediaId = await ensureMedia(payload, card)
    if (!mediaId) continue
    seeded.push({
      badge: card.badge,
      title: card.title,
      linkLabel: card.linkLabel,
      linkHref: card.linkHref,
      image: mediaId,
      order: i,
      enabled: true,
    })
  }

  if (seeded.length === 0) {
    console.error('No offer cards could be seeded (all image downloads failed).')
    process.exit(1)
  }

  await payload.updateGlobal({
    slug: 'homepage-content',
    data: { offerCards: seeded },
  })

  console.log(`\n✓ Wrote ${seeded.length} offer card(s) to homepage-content.`)
}

seedOfferCards()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
