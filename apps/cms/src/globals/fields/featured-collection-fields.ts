import type { Field } from 'payload'

export const featuredCollectionFields: Field[] = [
  {
    name: 'featuredCollectionTitle',
    type: 'text',
    admin: { description: 'Display title for the featured collection section' },
  },
  {
    name: 'featuredCollectionHandle',
    type: 'text',
    admin: {
      description: 'Medusa collection handle (e.g. "living-room") used to fetch products',
    },
  },
]
