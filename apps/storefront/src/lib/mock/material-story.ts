export interface MaterialStory {
  slug: string
  title: string
  excerpt: string
  href: string
}

const MOCK_STORIES: MaterialStory[] = [
  {
    slug: 'why-we-use-brass',
    title: 'The Timeless Allure of Brass',
    excerpt:
      'Brass has been a symbol of permanence and warmth for centuries. Discover why every piece in our metalwork collection is hand-finished by master artisans in Rajasthan.',
    href: '/stories/why-we-use-brass',
  },
  {
    slug: 'teak-wood-story',
    title: 'Teak: The Wood That Endures',
    excerpt:
      'Sourced from responsibly managed forests in Myanmar, our teak carries the warmth of natural grain and a density that promises generations of use.',
    href: '/stories/teak-wood-story',
  },
]

export async function getMaterialStory(slug: string): Promise<MaterialStory | null> {
  await Promise.resolve()
  return MOCK_STORIES.find((s) => s.slug === slug) ?? null
}
