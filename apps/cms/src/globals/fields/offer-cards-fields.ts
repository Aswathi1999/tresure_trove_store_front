import type { Field } from 'payload'

export const offerCardsFields: Field[] = [
  {
    name: 'offerCards',
    type: 'array',
    admin: {
      description: 'Cards in the horizontal promo carousel between Our Collections and Bestsellers',
    },
    fields: [
      {
        name: 'badge',
        type: 'text',
        required: true,
        admin: { description: 'Eyebrow label, e.g. "FESTIVE READY"' },
      },
      {
        name: 'title',
        type: 'text',
        required: true,
        admin: { description: 'Card title, e.g. "Decor up to 30% off"' },
      },
      {
        name: 'linkLabel',
        type: 'text',
        required: true,
        admin: { description: 'CTA text, e.g. "SHOP DECOR"' },
      },
      {
        name: 'linkHref',
        type: 'text',
        required: true,
        admin: { description: 'CTA URL, e.g. "/collections/decor"' },
      },
      { name: 'image', type: 'upload', relationTo: 'media', required: true },
      {
        name: 'order',
        type: 'number',
        admin: { description: 'Lower numbers appear first' },
      },
      { name: 'enabled', type: 'checkbox', defaultValue: true },
    ],
  },
]
