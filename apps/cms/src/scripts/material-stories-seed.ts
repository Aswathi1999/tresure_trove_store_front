/* eslint-disable no-console */
import type { getPayload } from 'payload'

type Payload = Awaited<ReturnType<typeof getPayload>>

type WoodType = 'teak' | 'walnut' | 'oak' | 'mango' | 'rosewood'

export type SeedMaterial = {
  woodType: WoodType
  origin: string
  sustainabilityRating: number
  paragraphs: string[]
  filename: string
  alt: string
  imageUrl: string
}

// Editorial copy kept in sync with the storefront fallback
// (apps/storefront/src/lib/payload.ts → DEFAULT_MATERIAL_STORIES).
export const MATERIALS: SeedMaterial[] = [
  {
    woodType: 'teak',
    origin: 'Kerala, India',
    sustainabilityRating: 5,
    paragraphs: [
      'Tectona grandis — teak — has been the preferred wood of Indian craftsmen for over a thousand years. Its natural oil content makes it resistant to moisture, termites, and warping without chemical treatment, earning it a permanent place in heirloom furniture.',
      'We source exclusively from FSC-certified forest cooperatives in Kerala and Karnataka. Every log is tracked from felling permit to finished piece, and one tree is planted for every item sold. Kiln-dried to 8–12% moisture content, our teak arrives at the workshop in perfect condition for joinery.',
      'The craftsmen in Mysore orient the grain intentionally — bookmatching table tops, matching figure across drawer fronts — so the wood itself becomes the design.',
    ],
    filename: 'material-teak.jpg',
    alt: 'Teak wood grain',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
  },
  {
    woodType: 'walnut',
    origin: 'Himachal Pradesh, India',
    sustainabilityRating: 4,
    paragraphs: [
      'Juglans regia — Himalayan walnut — grows at elevations above 1,800 metres in the valleys of Himachal Pradesh and Jammu & Kashmir. Its tight, chocolate-dark grain and natural lustre have made it the prestige wood of Kashmiri artisans for centuries.',
      'Our walnut is selectively harvested from privately managed orchards whose owners replant at a 3:1 ratio. This ensures long-term canopy health while providing livelihoods to mountain farming communities.',
      'Walnut takes fine carving and joinery exceptionally well. The craftsmen in Srinagar who work it bring generations of knowledge — you will see this in the precision of mortise-and-tenon joints and the delicate patterning on drawer faces.',
    ],
    filename: 'material-walnut.jpg',
    alt: 'Walnut wood grain',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
  },
  {
    woodType: 'oak',
    origin: 'Uttarakhand, India',
    sustainabilityRating: 4,
    paragraphs: [
      'Quercus leucotrichophora — Himalayan oak — grows in the temperate forests of Uttarakhand and Himachal Pradesh. Lighter in tone than walnut with a more open grain, it is the wood of choice when a space calls for brightness and restraint.',
      'Our oak is sourced from van panchayat — village forest councils — who manage their woodlands under a community governance model that has sustained these forests for generations.',
      "Oak's open grain accepts oil finishes beautifully, developing a rich honey-gold patina over decades. Our craftsmen in Dehradun pair it with hand-forged iron hardware for a look that balances natural material with architectural precision.",
    ],
    filename: 'material-oak.jpg',
    alt: 'Oak wood grain',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
  },
  {
    woodType: 'mango',
    origin: 'Rajasthan, India',
    sustainabilityRating: 5,
    paragraphs: [
      "Mangifera indica — the mango tree — is India's most abundant hardwood by volume. Once a tree stops bearing fruit after 40–50 years, it is harvested and a new sapling planted in its place. This natural lifecycle makes mango one of the most sustainable furniture woods on the planet.",
      'Our mango comes from orchards in Rajasthan and Uttar Pradesh where the harvest cycle has operated sustainably for generations. No virgin forests are cleared; every piece of mango furniture comes from a tree that lived a full, productive life.',
      "Mango's bold, interlocking grain — often showing dramatic waves and figure — makes each piece genuinely unique. Our craftsmen in Jodhpur sand and oil it to a fine finish that highlights the natural variation rather than concealing it.",
    ],
    filename: 'material-mango.jpg',
    alt: 'Mango wood grain',
    // The original aida-public asset for mango 404s; use a stable wood-tone photo.
    imageUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200&q=80',
  },
  {
    woodType: 'rosewood',
    origin: 'Karnataka, India',
    sustainabilityRating: 3,
    paragraphs: [
      'Dalbergia latifolia — Indian rosewood or shīsham — is among the densest and most beautiful woods in the world. Its deep purple-brown heartwood, interlocked grain, and natural fragrance have made it the wood of maharajas and master craftsmen alike.',
      'We source only from government-licensed timber depots holding CITES-compliant documentation. All our rosewood is reclaimed or from FSC-certified plantation growth — we do not source from old-growth forests. This is why rosewood carries our only rating below 4.',
      "Rosewood's extreme density means it takes years to properly season. Our craftsmen in Mysore — some of the finest rosewood workers remaining in India — shape it with hand tools and finish it with shellac and natural oils that deepen its already extraordinary colour.",
    ],
    filename: 'material-rosewood.jpg',
    alt: 'Rosewood wood grain',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
  },
]

// Build a minimal Lexical rich-text value the storefront's
// extractParagraphTexts() reader understands (root → paragraph → text).
export function buildRichText(paragraphs: string[]) {
  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          {
            type: 'text',
            text,
            format: 0,
            detail: 0,
            mode: 'normal' as const,
            style: '',
            version: 1,
          },
        ],
      })),
    },
  }
}

async function ensureMedia(
  payload: Payload,
  material: SeedMaterial,
): Promise<string | number | null> {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: material.filename } },
    limit: 1,
  })
  if (existing.docs.length > 0 && existing.docs[0]) {
    return existing.docs[0].id
  }

  const res = await fetch(material.imageUrl)
  if (!res.ok) {
    console.warn(`[seed] image download failed (HTTP ${res.status}) for ${material.filename}`)
    return null
  }
  const buffer = Buffer.from(await res.arrayBuffer())
  const mimetype = res.headers.get('content-type') ?? 'image/jpeg'

  const created = await payload.create({
    collection: 'media',
    data: { alt: material.alt },
    file: { data: buffer, mimetype, name: material.filename, size: buffer.length },
  })
  return created.id
}

export type SeedResult = {
  created: string[]
  updated: string[]
  skipped: string[]
}

export async function seedMaterialStories(payload: Payload): Promise<SeedResult> {
  const result: SeedResult = { created: [], updated: [], skipped: [] }

  for (const material of MATERIALS) {
    const mediaId = await ensureMedia(payload, material)
    if (!mediaId) {
      result.skipped.push(material.woodType)
      continue
    }

    const data = {
      woodType: material.woodType,
      origin: material.origin,
      sustainabilityRating: material.sustainabilityRating,
      featuredImage: mediaId,
      description: buildRichText(material.paragraphs),
      publishedAt: new Date().toISOString(),
      _status: 'published' as const,
    }

    const existing = await payload.find({
      collection: 'material-stories',
      where: { woodType: { equals: material.woodType } },
      limit: 1,
    })

    if (existing.docs.length > 0 && existing.docs[0]) {
      await payload.update({ collection: 'material-stories', id: existing.docs[0].id, data })
      result.updated.push(material.woodType)
    } else {
      await payload.create({ collection: 'material-stories', data })
      result.created.push(material.woodType)
    }
  }

  return result
}
