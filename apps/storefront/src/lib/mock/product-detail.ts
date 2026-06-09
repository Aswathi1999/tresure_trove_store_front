export interface ProductImage {
  id: string
  url: string
  alt: string
}

export interface ProductVariant {
  id: string
  title: string
  material: string
  size: string
  finish: string
  price: number // paise
  originalPrice?: number // paise
  inventory: number
  available: boolean
  sku: string
}

export interface RelatedProduct {
  id: string
  handle: string
  title: string
  category: string
  price: number // paise
  imageUrl: string
  badge?: string
  badgeVariant?: 'orange' | 'brown' | 'gold'
}

export interface ProductDetail {
  id: string
  handle: string
  title: string
  subtitle: string
  category: string
  categorySlug: string
  badge?: string
  description: string
  detailText: string
  images: ProductImage[]
  variants: ProductVariant[]
  options: {
    materials: string[]
    sizes: string[]
    finishes: string[]
    finishColors: Record<string, string>
  }
  specifications: Array<{ label: string; value: string }>
  careInstructions: string[]
  rating: number
  reviewCount: number
  materialStorySlug?: string
  related: RelatedProduct[]
}

// ── Image bank ────────────────────────────────────────────────────────────────

const IMG = {
  main: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1ZhKjMff2JSX1Ve5P9jaPtYYHpEJUV95wueqqbWBTLoXi70mZGhlHvhAG2MQAo7z8SB47kU_nGqd61JgtAkeuSpJu4eHFngbDceY_1O_NAUqC1kSefy8mDD36wxC1nUWzxAma58QVBP6aI_orZ1rS0VlgYa5pc-4yCuFTzq0aJ0cLTVhcBnr6KVBPQrKJKcKHG7LWgtcMlMEhCehcODuFt7RPfaUrR_wvbaCLLW0qs6ex5tocG_TEPCOt1uUxgvYIDSslG8HVKMk9mWfoUT0-gzAKQALK7rzOpCr9F8qmdZudlmzymdn4bJkT',
  detail:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCdUfpQ46TGyl4JIYNcQd9FBtR7UJnS47AlNaTZBYbXQCNoirUJ47fwKJ4p4zGegu43J9AdFyXcrXlNbxve7ZTKpUWgFnRK8-Q7EZuW0zDBCyK3G1HwxU83U-w2s--2u48HqSuMW7kRXYvJ0YEAyQ-sX0jeSFBJhGSro-Ia8IY406nUW9TSAlY_dxmvXZ_1FVYEA9pKCv-vVdEF3Zshkt-jLEEzmEZydGwFzqDoOqaJwut79J7sfHivbVepCqQGuon6BhmedM6SpQCy',
  lifestyle:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAY3XxqVzQtoDD9N9LDSmmA8F_1Y_BZlEDU_6ftrzusjxIzgJkaC0-bz_Oi6ypXUPvBFPrdcRYxRDI_hzPETTNKJ8J4pLUC32NTDy4GTr2gY1Jon0iy7mxlCRRVU2pdGkWYDzCHLn3SD9cNE-43ZQYlz6W5iTOIhSK0pid2rx3Lnf2EgsnvqUevWLJ3TGnOiK2eJn-t-stM1-TadxkCwT8Fo0b1OLgbV7NYPINjg9ctHapcrsIe2LYfFhnbNkzeHPCQiBwHj_OAezgo',
  cord: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDyJzXxARJO5562vhYqbpiMIQ_jOnDow_NhvfnZCrlHTzB-rm6NXnGCqIKZpbyHLpHD1QhbrWp9A6YlpKkHkwGFTyEze9ezO-BqNz9cWSPbYPggKw4U4CkEsk59VXg0Og9zTuThdvbKUUbP5OiJNupgOZaUgAo0sUFp1dxKPuL_J7RPfaUrR_wvbaCLLW0qs6ex5tocG_TEPCOt1uUxgvYIDSslG8HVKMk9mWfoUT0-gzAKQALK7rzOpCr9F8qmdZudlmzymdn4bJkT',
  mood: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBSd3erH7Vu6di3QhM2TbUldH96jvd8x55L5_JsLoq8XdnEP8JrqeL9YO7tjUcFgegHSHn5-RbleGZwa-V_jV0KCu10jy05snhilq98si55ZzRNzVGFBmE7q8IbEWJuInK--1pXcM1BDVkVEFU83eh2eSA4KHxZzV9Zup8a6qxRdk0dHKmyRNXRVuytYkI0bV16tMmYRy6MOdfEphPv04YkmpxHUiZok8oLpl1yZDU85t0_zG_cRHQ_e6Q8jtik-Vcy2A7_3KcjFyO',
  vase: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSaHWM2h6LD6Kfq0P8-HdCqhgdBbqOesSuif5jfKY_DdKoXuKN-fUPb5Sznr-dbORh2GK8XHysBAk-TYiFVXahK6yL2PAgV3z71d4nO2j7iFu00xIUlDfC4cTDevWOJ8UFAhrLnajrGRzftOD9htNqkTgv6wvXqy0rnKPlCzCjPn2ZCFo3LsaliCfkUfgDsNKyQi0so4XkOaaq3vimeGRE_-hEcPVR8WEoC5--m2Vu3LW8WKUI891ADrq0yMWChV2wG4BqCRxjDJfw',
  chair:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCvSd8mYijOrCinmXHuM0Xh87oN5sfVm7lQ6L6whCTZlJCRkRdNCOWcEtH-wLQApuTfzjc0DF1c_83fvyF1BN9P-BpKN87kTwD1vF9qH5EcM5krth0vLMJ8PACz8mrl7JYbX-RwRrc6fy5HpUsaYZUd5VfbHO_rOzrFi_s3xfE9pQwuZOc-zU4LZKvO8tuOa_u-XNMhqZHZ9jTq-zGBgckzABbsg2b_K5ScpE8iEl6SHTVyxe4r7FZ4oF7RGTAFmgrMUjgkWfKL042D',
  clock:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBr0r_rzIXN2b22JRgRJQ4tHQjaCLDhcQm-bCnyRuRQLF8Ls5fkys7KR70xbXWkU-dDl1QZWz2rxqxG3jGl39_JYCXgnVCe_jNzGMLdFpjV5VZP97onQ64gNnGUDbSIO0C-Lj3X06axyrolQxXblCh4L_hZ-i61L09wR0uLKKH3kSDJ_26aWxjIij_KrAv67zQbhz11ZFtKUNnLskk1AAstJUZL7VvxRBv8AOKVDHrzp1j-UDnJl055mGYW4cV4_aOXRjXn9QYlLLN6',
  candle:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDAU1TXpwtVqtu5NXipSNP3z5WAc9lXpJL_hwTZHVJM-10kY_F6R2hqH-w2qk1za1dJgLatHpE5A2aEHIpxbqJVDE2UOHSJt4Li5XpVyAhWF9ty13QVA8LJV2pPokKUONd2yPPCobIsc-Lvq1DzUznnfQ0eQE5ahctxRZdVNyhWenuBz_xjBc0Vkaa2hK02ViV7xgapv_UAstMVFKPuGEUm_9b8tqSroa2uhgu47MuybYrdVaTSor4MX2HCdGUD11TR2WX_8IczSxg3',
  floor:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDI2zbRov651h2oQK2oCo9m26Z32mX1gCmlDV2etBqrLTF5-bSjFnpZ6_R10PRet3SVicSZ81aFF1eHYx-D21it7Tgc1NiF1cePxqgcTsun_VzsAwvn4dVh4_3BQ1TLcKWXubdp-NQ7PC-XkfWEs_o5bXUcheFo_lC0Fk2GIOXPn4zkYss6OkZN2yWJ9mAe9ZuOxU24mINqRqzlKbATUob72iqyqBgi9Zoq6XZR4x52I4CvsT4ySskw7JIbDGzOw6MnASLIfCRjAv-U',
  chandelier:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBZJwIcx9Bv60V4j6Pou_HljQuPqajaIQRmW0aCNGsS5nDMzDTquuT4ovfUWBdybesXdg15hysSiU0PudcBHWAB3PbXZNYXUNX-oeBTv20PzDXmCSEHjYdaswpn7MSCrAypoHJ9MXkc6t4eemUJQzDu1bTJhYrJjKmRq4ZFl2Qz-oUZQG-c0L7sg03-WOUIvtZs89O4KBIlWb6e8kovEB69u3050SF8kRRHu9HEkXmeWpUebf0omn8BTha3fsYgIQunyI0zIxtA7SWk',
} as const

// ── Mock dataset ──────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: ProductDetail[] = [
  {
    id: 'prod-halden-lamp',
    handle: 'halden-brass-pendant-lamp',
    title: 'Halden Brass Pendant Lamp',
    subtitle: 'Hand-hammered solid brass with adjustable cord',
    category: 'Indoor Lighting',
    categorySlug: 'indoor-lighting',
    badge: 'Bestseller',
    description:
      'Inspired by Scandinavian minimalism fused with mid-century industrialism, the Halden Brass Pendant Lamp is a testament to timeless craftsmanship. Each piece is hand-hammered from solid brass, resulting in a unique texture that diffuses light with a soft, ambient warmth.',
    detailText:
      'Designed to be a focal point in any modern home, the lamp features a clean conical silhouette and an antique brass patina that only grows more beautiful with time. Perfect for illuminating dining tables, kitchen islands, or intimate reading nooks.',
    images: [
      {
        id: 'img-1',
        url: IMG.main,
        alt: 'Studio shot of Halden Brass Pendant Lamp against clean white background',
      },
      {
        id: 'img-2',
        url: IMG.detail,
        alt: 'Close up of antique brass pendant lamp showing intricate hammered metal texture',
      },
      {
        id: 'img-3',
        url: IMG.lifestyle,
        alt: 'Lifestyle shot of lamp hanging over a minimalist wooden dining table',
      },
      {
        id: 'img-4',
        url: IMG.cord,
        alt: 'Detail of the lamp ceiling mount and braided cord in antique brass finish',
      },
      {
        id: 'img-5',
        url: IMG.mood,
        alt: 'Mood shot of brass pendant lamp illuminating a dark corner with warm amber glow',
      },
    ],
    variants: [
      {
        id: 'var-ab-s',
        title: 'Antique Brass / S',
        material: 'Solid Brass',
        size: 'S',
        finish: 'Antique Brass',
        price: 1249900,
        originalPrice: 1599900,
        inventory: 12,
        available: true,
        sku: 'HALDEN-AB-S',
      },
      {
        id: 'var-ab-m',
        title: 'Antique Brass / M',
        material: 'Solid Brass',
        size: 'M',
        finish: 'Antique Brass',
        price: 1499900,
        originalPrice: 1899900,
        inventory: 5,
        available: true,
        sku: 'HALDEN-AB-M',
      },
      {
        id: 'var-ab-l',
        title: 'Antique Brass / L',
        material: 'Solid Brass',
        size: 'L',
        finish: 'Antique Brass',
        price: 1799900,
        originalPrice: 2299900,
        inventory: 2,
        available: true,
        sku: 'HALDEN-AB-L',
      },
      {
        id: 'var-ps-s',
        title: 'Polished Silver / S',
        material: 'Solid Brass',
        size: 'S',
        finish: 'Polished Silver',
        price: 1299900,
        originalPrice: 1599900,
        inventory: 8,
        available: true,
        sku: 'HALDEN-PS-S',
      },
      {
        id: 'var-ps-m',
        title: 'Polished Silver / M',
        material: 'Solid Brass',
        size: 'M',
        finish: 'Polished Silver',
        price: 1549900,
        originalPrice: 1899900,
        inventory: 0,
        available: false,
        sku: 'HALDEN-PS-M',
      },
      {
        id: 'var-ps-l',
        title: 'Polished Silver / L',
        material: 'Solid Brass',
        size: 'L',
        finish: 'Polished Silver',
        price: 1849900,
        originalPrice: 2299900,
        inventory: 3,
        available: true,
        sku: 'HALDEN-PS-L',
      },
      {
        id: 'var-mb-s',
        title: 'Matte Black / S',
        material: 'Solid Brass',
        size: 'S',
        finish: 'Matte Black',
        price: 1199900,
        originalPrice: 1499900,
        inventory: 15,
        available: true,
        sku: 'HALDEN-MB-S',
      },
      {
        id: 'var-mb-m',
        title: 'Matte Black / M',
        material: 'Solid Brass',
        size: 'M',
        finish: 'Matte Black',
        price: 1449900,
        originalPrice: 1799900,
        inventory: 7,
        available: true,
        sku: 'HALDEN-MB-M',
      },
      {
        id: 'var-mb-l',
        title: 'Matte Black / L',
        material: 'Solid Brass',
        size: 'L',
        finish: 'Matte Black',
        price: 1749900,
        originalPrice: 2199900,
        inventory: 1,
        available: true,
        sku: 'HALDEN-MB-L',
      },
    ],
    options: {
      materials: ['Solid Brass'],
      sizes: ['S', 'M', 'L'],
      finishes: ['Antique Brass', 'Polished Silver', 'Matte Black'],
      finishColors: {
        'Antique Brass': '#D4AF37',
        'Polished Silver': '#C0C0C0',
        'Matte Black': '#1A1A1A',
      },
    },
    specifications: [
      { label: 'Material', value: 'Solid Brass, Textile Cord' },
      { label: 'Finish', value: 'Antique Hand-Hammered' },
      { label: 'Dimensions (S)', value: '10" W × 12" H (Shade Only)' },
      { label: 'Cord Length', value: '6 ft (Adjustable)' },
      { label: 'Bulb Type', value: 'E27 / LED Compatible (not incl.)' },
      { label: 'Weight', value: '2.4 kg' },
    ],
    careInstructions: [
      'Use a soft, dry lint-free cloth for regular dusting. Avoid chemical cleaners as they may damage the antique patina.',
      'For a deeper clean, a damp cloth with mild soap may be used; dry immediately with a fresh cloth to prevent water spots.',
      'The brass will naturally age over time; use a quality brass polish once a year if you prefer a brighter look.',
    ],
    rating: 4.8,
    reviewCount: 128,
    materialStorySlug: 'why-we-use-brass',
    related: [
      {
        id: 'rp-1',
        handle: 'mesa-earth-vase',
        title: 'Mesa Earth Vase',
        category: 'Ceramics',
        price: 480000,
        imageUrl: IMG.vase,
      },
      {
        id: 'rp-2',
        handle: 'nordic-accent-chair',
        title: 'Nordic Accent Chair',
        category: 'Furniture',
        price: 2450000,
        imageUrl: IMG.chair,
        badge: 'New Arrival',
        badgeVariant: 'brown',
      },
      {
        id: 'rp-3',
        handle: 'gilded-desk-clock',
        title: 'Gilded Desk Clock',
        category: 'Decor',
        price: 225000,
        imageUrl: IMG.clock,
      },
      {
        id: 'rp-4',
        handle: 'eclipse-candle-trio',
        title: 'Eclipse Candle Trio',
        category: 'Home Fragrance',
        price: 349900,
        imageUrl: IMG.candle,
      },
      {
        id: 'rp-5',
        handle: 'luna-floor-lamp',
        title: 'Luna Floor Lamp',
        category: 'Lighting',
        price: 1820000,
        imageUrl: IMG.floor,
      },
      {
        id: 'rp-6',
        handle: 'orbital-chandelier',
        title: 'Orbital Chandelier',
        category: 'Lighting',
        price: 4500000,
        imageUrl: IMG.chandelier,
      },
    ],
  },
]

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  await Promise.resolve() // simulate async
  return MOCK_PRODUCTS.find((p) => p.handle === handle) ?? null
}
