import type { Field } from 'payload'

export const shopByPriceFields: Field[] = [
  {
    name: 'shopByPriceHeading',
    type: 'text',
    admin: { description: 'Heading for the Shop by Price section (default: "Shop by Price")' },
  },
  {
    name: 'priceBuckets',
    type: 'array',
    admin: { description: 'Price filter tiles. Leave empty to show the built-in defaults.' },
    fields: [
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: { description: 'e.g. "Under Rs. 999"' },
      },
      {
        name: 'href',
        type: 'text',
        required: true,
        admin: { description: 'e.g. "/products?maxPrice=999"' },
      },
      {
        name: 'dark',
        type: 'checkbox',
        defaultValue: false,
        admin: { description: 'Use the dark tile styling (ink background, gold text)' },
      },
      {
        name: 'order',
        type: 'number',
        admin: { description: 'Lower numbers appear first' },
      },
    ],
  },
]
