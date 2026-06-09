export interface MockHeroContent {
  headline: string
  subtext: string
  ctaText: string
  ctaHref: string
  imageUrl: string
  editorPickTitle: string
  editorPickHref: string
}

export interface MockBlogPost {
  id: string
  title: string
  excerpt: string
  coverImageUrl: string
  publishDate: string
  slug: string
}

export interface MockBrandPhilosophyContent {
  eyebrow: string
  headline: string
  body: string
  ctaText: string
  ctaHref: string
  imageUrl: string
}

export async function getHeroContent(): Promise<MockHeroContent | null> {
  return {
    headline: 'Modern Heirlooms,\nHandcrafted in India',
    subtext:
      'Discover our curated collection of luxury home décor, crafted by Indian artisans for the modern home.',
    ctaText: 'SHOP NEW ARRIVALS',
    ctaHref: '/products',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
    editorPickTitle: 'The Lighting Edit',
    editorPickHref: '/collections/lighting',
  }
}

export async function getMarqueeText(): Promise<string[]> {
  return [
    'HANDCRAFTED IN INDIA',
    'FREE SHIPPING OVER RS. 999',
    '7-DAY RETURNS',
    'SECURE PAYMENTS',
    'NEW ARRIVALS EVERY WEEK',
    'ARTISAN QUALITY',
    'COD AVAILABLE',
  ]
}

export async function getBlogPreviews(): Promise<MockBlogPost[]> {
  return [
    {
      id: 'blog-001',
      title: 'The Art of Handcrafted Brass',
      excerpt:
        'Explore the centuries-old tradition of brass craftsmanship in India and how our artisans are keeping this heritage alive in modern home décor.',
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
      publishDate: 'April 15, 2026',
      slug: 'the-art-of-handcrafted-brass',
    },
    {
      id: 'blog-002',
      title: 'Styling Your Outdoor Space',
      excerpt:
        'Transform your balcony, terrace, or garden into a serene retreat with our guide to outdoor styling using planters, lanterns, and natural materials.',
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
      publishDate: 'April 8, 2026',
      slug: 'styling-your-outdoor-space',
    },
    {
      id: 'blog-003',
      title: 'Monsoon Home Refresh',
      excerpt:
        'Beat the monsoon blues with these seasonal styling tips — earthy terracotta, warm textures, and indoor greens to make your home cosy and vibrant.',
      coverImageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
      publishDate: 'March 29, 2026',
      slug: 'monsoon-home-refresh',
    },
  ]
}

export interface MockBlogPostSummary {
  id: string
  title: string
  slug: string
  excerpt: string
  content: unknown
  coverImage: string
  publishedAt: string
  author: string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

const mockFullPosts: MockBlogPostSummary[] = [
  {
    id: 'blog-001',
    title: 'The Art of Handcrafted Brass',
    slug: 'the-art-of-handcrafted-brass',
    excerpt:
      'Explore the centuries-old tradition of brass craftsmanship in India and how our artisans are keeping this heritage alive in modern home décor.',
    content: null,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
    publishedAt: '2026-04-15T00:00:00.000Z',
    author: 'Treasure Trove Editorial',
    status: 'published',
    createdAt: '2026-04-15T00:00:00.000Z',
    updatedAt: '2026-04-15T00:00:00.000Z',
  },
  {
    id: 'blog-002',
    title: 'Styling Your Outdoor Space',
    slug: 'styling-your-outdoor-space',
    excerpt:
      'Transform your balcony, terrace, or garden into a serene retreat with our guide to outdoor styling using planters, lanterns, and natural materials.',
    content: null,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
    publishedAt: '2026-04-08T00:00:00.000Z',
    author: 'Treasure Trove Editorial',
    status: 'published',
    createdAt: '2026-04-08T00:00:00.000Z',
    updatedAt: '2026-04-08T00:00:00.000Z',
  },
  {
    id: 'blog-003',
    title: 'Monsoon Home Refresh',
    slug: 'monsoon-home-refresh',
    excerpt:
      'Beat the monsoon blues with these seasonal styling tips — earthy terracotta, warm textures, and indoor greens to make your home cosy and vibrant.',
    content: null,
    coverImage:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
    publishedAt: '2026-03-29T00:00:00.000Z',
    author: 'Treasure Trove Editorial',
    status: 'published',
    createdAt: '2026-03-29T00:00:00.000Z',
    updatedAt: '2026-03-29T00:00:00.000Z',
  },
]

export async function getPosts(
  page = 1,
  _limit = 10,
): Promise<{
  docs: MockBlogPostSummary[]
  totalDocs: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}> {
  return {
    docs: mockFullPosts,
    totalDocs: mockFullPosts.length,
    page,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: page > 1,
  }
}

export async function getPostBySlug(slug: string): Promise<MockBlogPostSummary | null> {
  return mockFullPosts.find((p) => p.slug === slug) ?? null
}

export async function getBrandPhilosophy(): Promise<MockBrandPhilosophyContent | null> {
  return {
    eyebrow: 'MONSOON READY',
    headline: 'Outdoor Planters from Rs. 1,499',
    body: 'Bring nature home with our hand-thrown terracotta and glazed ceramic planters — built to weather every season. From compact balcony pots to statement floor planters, every piece is crafted by artisans in Rajasthan.',
    ctaText: 'SHOP OUTDOOR',
    ctaHref: '/collections/outdoor',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
  }
}

export type LexicalFormat = 0 | 1 | 2 | 3 | 4 | 8 | 16

export interface LexicalTextNode {
  type: 'text'
  text: string
  format?: LexicalFormat
}

export interface LexicalLinkNode {
  type: 'link'
  url: string
  newTab?: boolean
  children: LexicalTextNode[]
}

export interface LexicalUploadNode {
  type: 'upload'
  value: { url: string; alt: string; width?: number; height?: number }
}

export interface LexicalElementNode {
  type: 'heading' | 'paragraph' | 'list' | 'listitem' | 'quote'
  tag?: 'h1' | 'h2' | 'h3' | 'h4'
  listType?: 'bullet' | 'number'
  children: Array<LexicalTextNode | LexicalLinkNode | LexicalElementNode>
}

export type LexicalNode = LexicalTextNode | LexicalLinkNode | LexicalUploadNode | LexicalElementNode

export interface LexicalContent {
  root: {
    children: LexicalNode[]
  }
}

export interface MockBlogPostFull {
  id: string
  slug: string
  title: string
  excerpt: string
  coverImageUrl: string
  publishedAt: string
  publishDate: string
  author: { name: string; role: string }
  readTime: string
  category: string
  content: LexicalContent
  relatedSlugs: string[]
}

const FULL_POSTS: MockBlogPostFull[] = [
  {
    id: 'blog-001',
    slug: 'the-art-of-handcrafted-brass',
    title: 'The Art of Handcrafted Brass',
    excerpt:
      'Explore the centuries-old tradition of brass craftsmanship in India and how our artisans are keeping this heritage alive in modern home décor.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
    publishedAt: '2026-04-15T08:00:00.000Z',
    publishDate: 'April 15, 2026',
    author: { name: 'Priya Nair', role: 'Head of Craft & Culture' },
    readTime: '6 min read',
    category: 'Craft Stories',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'A Tradition Forged in Fire' }],
          },
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Brass has been central to Indian homes for over ' },
              { type: 'text', text: 'three thousand years', format: 1 },
              {
                type: 'text',
                text: '. From temple lamps to kitchen vessels, it carries the memory of generations.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'The Dhokra Technique' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our artisans in Bastar use the ancient ',
              },
              { type: 'text', text: 'lost-wax casting method', format: 2 },
              {
                type: 'text',
                text: ' — each piece sculpted in beeswax, encased in clay, and fired until the metal flows into perfect form.',
              },
            ],
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Each piece takes 3–5 days to complete' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'No two objects are ever identical' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Finished by hand with natural beeswax polish' }],
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: "When you place a brass lamp in your home, you are placing a piece of our family's story there.",
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Caring for Your Brass' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A simple wipe with a soft cloth keeps brass radiant. Avoid harsh chemicals — the natural patina that develops over years is a mark of authenticity, not imperfection.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Discover our full brass collection at ' },
              {
                type: 'link',
                url: '/collections/brass',
                children: [{ type: 'text', text: 'Treasure Trove Brass' }],
              },
              { type: 'text', text: '.' },
            ],
          },
        ],
      },
    },
    relatedSlugs: ['the-teak-story', 'rattan-revival', 'bedroom-sanctuary-guide'],
  },
  {
    id: 'blog-002',
    slug: 'styling-your-outdoor-space',
    title: 'Styling Your Outdoor Space',
    excerpt:
      'Transform your balcony, terrace, or garden into a serene retreat with our guide to outdoor styling using planters, lanterns, and natural materials.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
    publishedAt: '2026-04-08T08:00:00.000Z',
    publishDate: 'April 8, 2026',
    author: { name: 'Aditya Sharma', role: 'Interior Stylist' },
    readTime: '5 min read',
    category: 'Styling Guides',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Your Outdoor Space Deserves a Story' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'A balcony or terrace is often the most personal space in a home — yet it is the most neglected. With the right pieces, it becomes a sanctuary.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Start with Levels' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Use ',
              },
              { type: 'text', text: 'tall floor planters', format: 1 },
              {
                type: 'text',
                text: ', mid-height furniture, and low lanterns to create visual rhythm. The eye moves best when there is variation in height.',
              },
            ],
          },
          {
            type: 'list',
            listType: 'number',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Anchor the space with a statement planter' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Layer with a woven outdoor rug for warmth' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Add string lights or brass lanterns at dusk' }],
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'Outdoors is not a different room — it is an extension of your living intention.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Materials That Weather Well' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Choose teak, powder-coated iron, or weather-sealed rattan. Terracotta planters develop a beautiful efflorescence over seasons — embrace the change.',
              },
            ],
          },
        ],
      },
    },
    relatedSlugs: ['monsoon-home-refresh', 'rattan-revival', 'the-teak-story'],
  },
  {
    id: 'blog-003',
    slug: 'monsoon-home-refresh',
    title: 'Monsoon Home Refresh',
    excerpt:
      'Beat the monsoon blues with these seasonal styling tips — earthy terracotta, warm textures, and indoor greens to make your home cosy and vibrant.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
    publishedAt: '2026-03-29T08:00:00.000Z',
    publishDate: 'March 29, 2026',
    author: { name: 'Meera Krishnan', role: 'Lifestyle Editor' },
    readTime: '4 min read',
    category: 'Seasonal Living',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Embrace the Rain Season' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: "The monsoon is India's most romantic season. Your home should reflect that — warm, layered, and alive with texture and scent.",
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Earthy Tones First' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Swap out cool linens for ',
              },
              { type: 'text', text: 'terracotta, ochre, and forest green', format: 1 },
              {
                type: 'text',
                text: '. These ground the home and mirror the season outside.',
              },
            ],
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Terracotta vases on window sills' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Warm-toned cotton throws on sofas' }],
              },
              {
                type: 'listitem',
                children: [
                  { type: 'text', text: 'Brass diyas and tea-light holders for evenings' },
                ],
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'Let the rain soundtrack your home — soft lamps, warm chai, and objects that feel alive.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Indoor plants thrive in monsoon humidity. Add a ',
              },
              { type: 'text', text: 'peace lily or pothos', format: 2 },
              {
                type: 'text',
                text: ' in a hand-thrown ceramic pot — they clean the air and bring the garden indoors.',
              },
            ],
          },
        ],
      },
    },
    relatedSlugs: ['styling-your-outdoor-space', 'bedroom-sanctuary-guide', 'rattan-revival'],
  },
  {
    id: 'blog-004',
    slug: 'the-teak-story',
    title: 'The Teak Story',
    excerpt:
      'How we source sustainable teak from managed forests in South India, and why this ancient wood remains the gold standard for heirloom furniture.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
    publishedAt: '2026-03-18T08:00:00.000Z',
    publishDate: 'March 18, 2026',
    author: { name: 'Rajan Pillai', role: 'Sustainability Lead' },
    readTime: '7 min read',
    category: 'Materials',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Why Teak Endures' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Tectona grandis — teak — has been the preferred wood of Indian craftsmen for centuries. Its natural oil content makes it ',
              },
              { type: 'text', text: 'resistant to moisture, termites, and warping', format: 1 },
              { type: 'text', text: ' without chemical treatment.' },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Our Sourcing Commitment' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'We work exclusively with FSC-certified forest cooperatives in Kerala and Karnataka. Every log we purchase is tracked from felling permit to finished piece.',
              },
            ],
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'FSC-certified timber only' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'One tree planted for every piece sold' }],
              },
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Kiln-dried to 8–12% moisture for stability' }],
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'A teak table is not furniture. It is a decision to keep something beautiful for fifty years.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'The Grain That Tells a Story' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Each board carries the rings of its years. Our craftsmen orient the grain intentionally — matching figure across drawer fronts, bookmatching table tops — so the wood becomes the design.',
              },
            ],
          },
        ],
      },
    },
    relatedSlugs: ['the-art-of-handcrafted-brass', 'rattan-revival', 'bedroom-sanctuary-guide'],
  },
  {
    id: 'blog-005',
    slug: 'rattan-revival',
    title: 'Rattan Revival',
    excerpt:
      'Natural materials are back at the heart of interior design. We explore why rattan, cane, and seagrass belong in the modern Indian home.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
    publishedAt: '2026-03-05T08:00:00.000Z',
    publishDate: 'March 5, 2026',
    author: { name: 'Priya Nair', role: 'Head of Craft & Culture' },
    readTime: '5 min read',
    category: 'Materials',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'The Return of the Natural' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'After decades of synthetic materials dominating interiors, homes are breathing again. Rattan, cane, and seagrass bring ',
              },
              { type: 'text', text: 'warmth, texture, and an honest imperfection', format: 1 },
              { type: 'text', text: ' that no resin can replicate.' },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Rattan vs Cane — Know the Difference' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Rattan is the solid vine; cane is the outer peel of the rattan palm, woven into grids. Both are ',
              },
              { type: 'text', text: 'stronger than they look', format: 2 },
              { type: 'text', text: ' and surprisingly durable in Indian climates.' },
            ],
          },
          {
            type: 'list',
            listType: 'bullet',
            children: [
              {
                type: 'listitem',
                children: [{ type: 'text', text: 'Use rattan chairs in living and dining rooms' }],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Cane panel headboards bring texture to bedrooms',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'Seagrass baskets for storage that doubles as décor',
                  },
                ],
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'Natural materials age like people do — they become more interesting with time.',
              },
            ],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Our rattan collection is handwoven by artisans in Assam who have been working the material for three generations.',
              },
            ],
          },
        ],
      },
    },
    relatedSlugs: ['the-teak-story', 'styling-your-outdoor-space', 'monsoon-home-refresh'],
  },
  {
    id: 'blog-006',
    slug: 'bedroom-sanctuary-guide',
    title: 'Bedroom Sanctuary Guide',
    excerpt:
      'Your bedroom should be your most intentional room. This guide walks you through layering, lighting, and material choices for a restful retreat.',
    coverImageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
    publishedAt: '2026-02-20T08:00:00.000Z',
    publishDate: 'February 20, 2026',
    author: { name: 'Aditya Sharma', role: 'Interior Stylist' },
    readTime: '6 min read',
    category: 'Styling Guides',
    content: {
      root: {
        children: [
          {
            type: 'heading',
            tag: 'h2',
            children: [{ type: 'text', text: 'Design for Rest, Not Performance' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'The bedroom is the one room where you are not performing for anyone. It should be designed for ',
              },
              { type: 'text', text: 'your nervous system, not your Instagram feed', format: 2 },
              { type: 'text', text: '.' },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'The Layered Bed' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Start with a quality mattress, then layer: base sheet, duvet, throw, and two or three decorative cushions. The secret is ',
              },
              { type: 'text', text: 'varying texture, not matching colour', format: 1 },
              { type: 'text', text: '.' },
            ],
          },
          {
            type: 'list',
            listType: 'number',
            children: [
              {
                type: 'listitem',
                children: [
                  { type: 'text', text: 'Choose natural fabrics — cotton, linen, or wool' },
                ],
              },
              {
                type: 'listitem',
                children: [
                  { type: 'text', text: 'Keep lighting warm: 2700K or lower colour temperature' },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'One bedside lamp per person for asymmetric softness',
                  },
                ],
              },
              {
                type: 'listitem',
                children: [
                  {
                    type: 'text',
                    text: 'A single piece of art at eye level from the pillow',
                  },
                ],
              },
            ],
          },
          {
            type: 'quote',
            children: [
              {
                type: 'text',
                text: 'Sleep is the most important design requirement. Everything else serves it.',
              },
            ],
          },
          {
            type: 'heading',
            tag: 'h3',
            children: [{ type: 'text', text: 'Materials for Calm' }],
          },
          {
            type: 'paragraph',
            children: [
              {
                type: 'text',
                text: 'Teak and walnut headboards, ceramic table lamps, and hand-knotted wool rugs — these materials absorb sound and light in ways that create a genuinely restful atmosphere.',
              },
            ],
          },
        ],
      },
    },
    relatedSlugs: ['the-art-of-handcrafted-brass', 'monsoon-home-refresh', 'the-teak-story'],
  },
]

export function getBlogPostBySlug(slug: string): MockBlogPostFull | null {
  return FULL_POSTS.find((p) => p.slug === slug) ?? null
}

export function getAllBlogSlugs(): string[] {
  return FULL_POSTS.map((p) => p.slug)
}

export function getRelatedBlogPosts(slugs: string[]): MockBlogPostFull[] {
  return slugs.flatMap((slug) => {
    const post = getBlogPostBySlug(slug)
    return post ? [post] : []
  })
}

// ── Material Stories ──────────────────────────────────────────────────────────

export type WoodType = 'teak' | 'walnut' | 'oak' | 'mango' | 'rosewood'

export interface MockMaterialStory {
  id: string
  title: string
  slug: string
  woodType: WoodType
  origin: string
  sustainabilityRating: number
  shortDescription: string
  description: string[]
  featuredImage: { url: string; alt: string }
}

const MATERIAL_STORIES: MockMaterialStory[] = [
  {
    id: 'mat-001',
    title: 'Teak',
    slug: 'teak',
    woodType: 'teak',
    origin: 'Kerala, India',
    sustainabilityRating: 5,
    shortDescription:
      'The gold standard of Indian hardwoods — weather-resistant, naturally oiled, and built for generations.',
    description: [
      'Tectona grandis — teak — has been the preferred wood of Indian craftsmen for over a thousand years. Its natural oil content makes it resistant to moisture, termites, and warping without chemical treatment, earning it a permanent place in heirloom furniture.',
      'We source exclusively from FSC-certified forest cooperatives in Kerala and Karnataka. Every log is tracked from felling permit to finished piece, and one tree is planted for every item sold. Kiln-dried to 8–12% moisture content, our teak arrives at the workshop in perfect condition for joinery.',
      'The craftsmen in Mysore orient the grain intentionally — bookmatching table tops, matching figure across drawer fronts — so the wood itself becomes the design.',
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
      alt: 'Close-up of teak wood grain',
    },
  },
  {
    id: 'mat-002',
    title: 'Walnut',
    slug: 'walnut',
    woodType: 'walnut',
    origin: 'Himachal Pradesh, India',
    sustainabilityRating: 4,
    shortDescription:
      'Dark, dense, and deeply beautiful — Himalayan walnut brings a rich warmth to every space.',
    description: [
      'Juglans regia — Himalayan walnut — grows at elevations above 1,800 metres in the valleys of Himachal Pradesh and Jammu & Kashmir. Its tight, chocolate-dark grain and natural lustre have made it the prestige wood of Kashmiri artisans for centuries.',
      'Our walnut is selectively harvested from privately managed orchards whose owners replant at a 3:1 ratio. This ensures long-term canopy health while providing livelihoods to mountain farming communities.',
      'Walnut takes fine carving and joinery exceptionally well. The craftsmen in Srinagar who work it bring generations of knowledge — you will see this in the precision of mortise-and-tenon joints and the delicate patterning on drawer faces.',
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCANOptNKLqqXac6npIqILD4NXdVoZuS08iNpILkUUEnZZkfGFDYmwTK_A2Sfpw0P7dIGUKXXiECV-HU8ZLtkZDwiQwlQdbPl5ctax5hE24RGTIdiDqQFtX68qtGy4mIIciNgpowYqjojjmd6CCJoLxMlpo7aPunhpVZeujaMzV7Sh5Bw_mg8a27hc_ZDpwRtgLkKvtiK2RQIzSGYnBka9Rhho_aTrnf-Vn6NO2VnYFXVVYBLobHZqk7KagK86xsEN2fU3HygrddwVP',
      alt: 'Walnut wood texture with rich dark grain',
    },
  },
  {
    id: 'mat-003',
    title: 'Oak',
    slug: 'oak',
    woodType: 'oak',
    origin: 'Uttarakhand, India',
    sustainabilityRating: 4,
    shortDescription:
      'Hardy and light-toned, Indian oak brings an understated elegance to contemporary interiors.',
    description: [
      'Quercus leucotrichophora — Himalayan oak — grows in the temperate forests of Uttarakhand and Himachal Pradesh. Lighter in tone than walnut with a more open grain, it is the wood of choice when a space calls for brightness and restraint.',
      'Our oak is sourced from van panchayat — village forest councils — who manage their woodlands under a community governance model that has sustained these forests for generations.',
      "Oak's open grain accepts oil finishes beautifully, developing a rich honey-gold patina over decades. Our craftsmen in Dehradun pair it with hand-forged iron hardware for a look that balances natural material with architectural precision.",
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkYIW7WnD35xo1SzVpNpF9klYWBBOi3OYjVfF3AKea1IhwRKTqqYzZMKIhwEqobeRb5Amsj3A3cwHcZIExhx5wedBn_tql3r72PoHjFYPtTdNABlgl_dnHFSu57YOmYKQI_Grh4GhIt_M_p6L-ZE4PMDO8e_3p9suLllqm9w4477QnK4FQpcx7Uer_QGCK5NP6VQUrkM7OYtV9MQ5TREDfL_s0b3lXHnc1kbP-nNSnAaNfSm9ddeoGbszhS4xRLUswFM3C-O5WF3q6',
      alt: 'Light-toned oak wood with open grain',
    },
  },
  {
    id: 'mat-004',
    title: 'Mango',
    slug: 'mango',
    woodType: 'mango',
    origin: 'Rajasthan, India',
    sustainabilityRating: 5,
    shortDescription:
      "India's most sustainable hardwood — mango trees are replanted after each harvest cycle, giving you furniture with a clear conscience.",
    description: [
      "Mangifera indica — the mango tree — is India's most abundant hardwood by volume. Once a tree stops bearing fruit after 40–50 years, it is harvested and a new sapling planted in its place. This natural lifecycle makes mango one of the most sustainable furniture woods on the planet.",
      'Our mango comes from orchards in Rajasthan and Uttar Pradesh where the harvest cycle has operated sustainably for generations. No virgin forests are cleared; every piece of mango furniture comes from a tree that lived a full, productive life.',
      "Mango's bold, interlocking grain — often showing dramatic waves and figure — makes each piece genuinely unique. Our craftsmen in Jodhpur sand and oil it to a fine finish that highlights the natural variation rather than concealing it.",
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAhILr_TMU7gK1FkE4QBKh8SZ4dGRE7YdTL9Ei_llHiN7E9xpfpxX7oDNGF0JQTD1ny86CRCtuQhfPs8F_j7olgLIgF5rKesHG71NBtAQNuBgwXJLuJWhWlqPVkV2tI05MX7ykW_P2HrjyDjoMaWbsNylz2D9uv47xASlBrHE5Bb--XJtdMULP2u14bOUdhnCwVLJzWXL5w9kONBFUGTuamx7UyhWT9Ebk_piS0_ZivVfDxvWbljY4IOTY2-aiaZMnL4smzkvsqR786b',
      alt: 'Mango wood with dramatic interlocking grain',
    },
  },
  {
    id: 'mat-005',
    title: 'Rosewood',
    slug: 'rosewood',
    woodType: 'rosewood',
    origin: 'Karnataka, India',
    sustainabilityRating: 3,
    shortDescription:
      "India's most prized cabinet wood — dense, fragrant, and the material behind India's greatest furniture heritage.",
    description: [
      'Dalbergia latifolia — Indian rosewood or shīsham — is among the densest and most beautiful woods in the world. Its deep purple-brown heartwood, interlocked grain, and natural fragrance have made it the wood of maharajas and master craftsmen alike.',
      'We source only from government-licensed timber depots holding CITES-compliant documentation. All our rosewood is reclaimed or from FSC-certified plantation growth — we do not source from old-growth forests. This is why rosewood carries our only rating below 4.',
      "Rosewood's extreme density means it takes years to properly season. Our craftsmen in Mysore — some of the finest rosewood workers remaining in India — shape it with hand tools and finish it with shellac and natural oils that deepen its already extraordinary colour.",
    ],
    featuredImage: {
      url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrgvJND8ap_jOP_2oWq8CWVTPSJsruDul6JebEsM5O-FVgiCUzbExLlBvedjGTk7Mqo6oFHCObcnY_gZUAdKyLC_HjdtKfENCtHDWk-wbfb58i5ketMKUeMxpARNrAxe30kzV0UbzGgHTQGgP-VysOkhxrCbugpLsFH0BvJgOQDMppV0LJpTZhEVbWj3DG0gBZCTguyAQ6f1A85ZwgDj0rYSPAxdnc6Bd_EMqYYVNu-z195ErQqe4fUhM3tMgjRQYaNyGutxvbrdml',
      alt: 'Deep purple-brown rosewood with interlocked grain',
    },
  },
]

export function getMaterialStories(): MockMaterialStory[] {
  return MATERIAL_STORIES
}

export function getMaterialStoryBySlug(slug: string): MockMaterialStory | null {
  return MATERIAL_STORIES.find((m) => m.slug === slug) ?? null
}

export function getAllMaterialStorySlugs(): string[] {
  return MATERIAL_STORIES.map((m) => m.slug)
}

// ── Media Documents ───────────────────────────────────────────────────────────

export interface MockPayloadMediaDoc {
  id: string
  url: string
  filename: string
  alt: string
  width: number
  height: number
}

export const mockMediaDoc: MockPayloadMediaDoc = {
  id: 'media-001',
  url: '/media/okura-lounge-chair.jpg',
  filename: 'okura-lounge-chair.jpg',
  alt: 'Ōkura Lounge Chair in teak with black woven seat, front view',
  width: 1200,
  height: 900,
}

export const mockMediaDocs: MockPayloadMediaDoc[] = [
  mockMediaDoc,
  {
    id: 'media-002',
    url: '/media/brass-lamp-collection.jpg',
    filename: 'brass-lamp-collection.jpg',
    alt: 'Handcrafted brass table lamp with woven shade',
    width: 800,
    height: 1000,
  },
  {
    id: 'media-003',
    url: '/media/teak-dining-table.jpg',
    filename: 'teak-dining-table.jpg',
    alt: 'Solid teak dining table with bench seating for six',
    width: 1400,
    height: 933,
  },
]
