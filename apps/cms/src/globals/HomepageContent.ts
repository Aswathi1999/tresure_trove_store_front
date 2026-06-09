import type { GlobalConfig } from 'payload'
import { revalidateStorefront } from '../hooks/revalidate-storefront'
import { heroFields } from './fields/hero-fields'
import { marqueeFields } from './fields/marquee-fields'
import { offerCardsFields } from './fields/offer-cards-fields'
import { trustBadgesFields } from './fields/trust-badges-fields'
import { shopByPriceFields } from './fields/shop-by-price-fields'
import { featuredCollectionFields } from './fields/featured-collection-fields'
import { sectionCopyFields } from './fields/section-copy-fields'
import { brandPhilosophyFields } from './fields/brand-philosophy-fields'

export const HomepageContent: GlobalConfig = {
  slug: 'homepage-content',
  access: {
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    livePreview: {
      url: () => `${process.env['STOREFRONT_URL'] ?? 'http://localhost:3000'}`,
    },
  },
  hooks: {
    afterChange: [revalidateStorefront('homepage')],
  },
  fields: [
    ...heroFields,
    ...marqueeFields,
    ...offerCardsFields,
    ...trustBadgesFields,
    ...shopByPriceFields,
    ...featuredCollectionFields,
    ...sectionCopyFields,
    ...brandPhilosophyFields,
  ],
}
