export interface MockMaterial {
  id: string
  slug: string
  name: string
  origin: string
  sustainabilityRating: number
  shortDescription: string
  description: string[]
  imageUrl: string
  relatedProductSlugs: string[]
}

export interface MockMaterialProduct {
  id: string
  slug: string
  name: string
  price: string
  imageUrl: string
}

const MOCK_PRODUCTS: MockMaterialProduct[] = [
  {
    id: 'prod-001',
    slug: 'teak-dining-table',
    name: 'Ōkura Dining Table',
    price: 'Rs. 48,999',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
  },
  {
    id: 'prod-002',
    slug: 'walnut-side-table',
    name: 'Nāga Side Table',
    price: 'Rs. 18,499',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
  },
  {
    id: 'prod-003',
    slug: 'oak-lounge-chair',
    name: 'Bōshi Lounge Chair',
    price: 'Rs. 32,999',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
  },
  {
    id: 'prod-004',
    slug: 'mango-console-table',
    name: 'Āmra Console Table',
    price: 'Rs. 24,999',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
  },
  {
    id: 'prod-005',
    slug: 'rosewood-bookshelf',
    name: 'Shīsham Bookshelf',
    price: 'Rs. 39,999',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
  },
  {
    id: 'prod-006',
    slug: 'teak-bed-frame',
    name: 'Kōmyo Bed Frame',
    price: 'Rs. 56,999',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
  },
]

const MATERIALS: MockMaterial[] = [
  {
    id: 'mat-001',
    slug: 'teak',
    name: 'Teak',
    origin: 'Kerala, India',
    sustainabilityRating: 5,
    shortDescription:
      'The gold standard of Indian hardwoods — weather-resistant, naturally oiled, and built for generations.',
    description: [
      'Tectona grandis — teak — has been the preferred wood of Indian craftsmen for over a thousand years. Its natural oil content makes it resistant to moisture, termites, and warping without chemical treatment, earning it a permanent place in heirloom furniture.',
      'We source exclusively from FSC-certified forest cooperatives in Kerala and Karnataka. Every log is tracked from felling permit to finished piece, and one tree is planted for every item sold. Kiln-dried to 8–12% moisture content, our teak arrives at the workshop in perfect condition for joinery.',
      'The craftsmen in Mysore orient the grain intentionally — bookmatching table tops, matching figure across drawer fronts — so the wood itself becomes the design.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
    relatedProductSlugs: ['teak-dining-table', 'teak-bed-frame', 'oak-lounge-chair'],
  },
  {
    id: 'mat-002',
    slug: 'walnut',
    name: 'Walnut',
    origin: 'Himachal Pradesh, India',
    sustainabilityRating: 4,
    shortDescription:
      'Dark, dense, and deeply beautiful — Himalayan walnut brings a rich warmth to every space.',
    description: [
      'Juglans regia — Himalayan walnut — grows at elevations above 1,800 metres in the valleys of Himachal Pradesh and Jammu & Kashmir. Its tight, chocolate-dark grain and natural lustre have made it the prestige wood of Kashmiri artisans for centuries.',
      'Our walnut is selectively harvested from privately managed orchards whose owners replant at a 3:1 ratio. This ensures long-term canopy health while providing livelihoods to mountain farming communities.',
      'Walnut takes fine carving and joinery exceptionally well. The craftsmen in Srinagar who work it bring generations of knowledge — you will see this in the precision of mortise-and-tenon joints and the delicate patterning on drawer faces.',
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
    relatedProductSlugs: ['walnut-side-table', 'rosewood-bookshelf', 'teak-dining-table'],
  },
  {
    id: 'mat-003',
    slug: 'oak',
    name: 'Oak',
    origin: 'Uttarakhand, India',
    sustainabilityRating: 4,
    shortDescription:
      'Hardy and light-toned, Indian oak brings an understated elegance to contemporary interiors.',
    description: [
      'Quercus leucotrichophora — Himalayan oak — grows in the temperate forests of Uttarakhand and Himachal Pradesh. Lighter in tone than walnut with a more open grain, it is the wood of choice when a space calls for brightness and restraint.',
      'Our oak is sourced from van panchayat — village forest councils — who manage their woodlands under a community governance model that has sustained these forests for generations.',
      "Oak's open grain accepts oil finishes beautifully, developing a rich honey-gold patina over decades. Our craftsmen in Dehradun pair it with hand-forged iron hardware for a look that balances natural material with architectural precision.",
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
    relatedProductSlugs: ['oak-lounge-chair', 'mango-console-table', 'walnut-side-table'],
  },
  {
    id: 'mat-004',
    slug: 'mango',
    name: 'Mango',
    origin: 'Rajasthan, India',
    sustainabilityRating: 5,
    shortDescription:
      "India's most sustainable hardwood — mango trees are replanted after each harvest cycle, giving you furniture with a clear conscience.",
    description: [
      "Mangifera indica — the mango tree — is India's most abundant hardwood by volume. Once a tree stops bearing fruit after 40–50 years, it is harvested and a new sapling planted in its place. This natural lifecycle makes mango one of the most sustainable furniture woods on the planet.",
      'Our mango comes from orchards in Rajasthan and Uttar Pradesh where the harvest cycle has operated sustainably for generations. No virgin forests are cleared; every piece of mango furniture comes from a tree that lived a full, productive life.',
      "Mango's bold, interlocking grain — often showing dramatic waves and figure — makes each piece genuinely unique. Our craftsmen in Jodhpur sand and oil it to a fine finish that highlights the natural variation rather than concealing it.",
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
    relatedProductSlugs: ['mango-console-table', 'teak-dining-table', 'oak-lounge-chair'],
  },
  {
    id: 'mat-005',
    slug: 'rosewood',
    name: 'Rosewood',
    origin: 'Karnataka, India',
    sustainabilityRating: 3,
    shortDescription:
      "India's most prized cabinet wood — dense, fragrant, and the material behind India's greatest furniture heritage.",
    description: [
      'Dalbergia latifolia — Indian rosewood or shīsham — is among the densest and most beautiful woods in the world. Its deep purple-brown heartwood, interlocked grain, and natural fragrance have made it the wood of maharajas and master craftsmen alike.',
      'We source only from government-licensed timber depots holding CITES-compliant documentation. All our rosewood is reclaimed or from FSC-certified plantation growth — we do not source from old-growth forests. This is why rosewood carries our only rating below 4.',
      "Rosewood's extreme density means it takes years to properly season. Our craftsmen in Mysore — some of the finest rosewood workers remaining in India — shape it with hand tools and finish it with shellac and natural oils that deepen its already extraordinary colour.",
    ],
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
    relatedProductSlugs: ['rosewood-bookshelf', 'walnut-side-table', 'teak-bed-frame'],
  },
]

export function getAllMaterials(): MockMaterial[] {
  return MATERIALS
}

export function getMaterialBySlug(slug: string): MockMaterial | null {
  return MATERIALS.find((m) => m.slug === slug) ?? null
}

export function getAllMaterialSlugs(): string[] {
  return MATERIALS.map((m) => m.slug)
}

export function getRelatedProducts(slugs: string[]): MockMaterialProduct[] {
  return slugs.flatMap((slug) => {
    const product = MOCK_PRODUCTS.find((p) => p.slug === slug)
    return product ? [product] : []
  })
}
