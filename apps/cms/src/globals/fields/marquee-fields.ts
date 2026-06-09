import type { Field } from 'payload'

export const marqueeFields: Field[] = [
  {
    name: 'marqueeItems',
    type: 'array',
    fields: [
      { name: 'text', type: 'text', required: true },
      {
        name: 'order',
        type: 'number',
        admin: { description: 'Lower numbers appear first' },
      },
    ],
  },
]
