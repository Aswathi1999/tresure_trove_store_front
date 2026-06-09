import type { Field } from 'payload'

export const trustBadgesFields: Field[] = [
  {
    name: 'trustBadges',
    type: 'array',
    admin: {
      description: 'Trust signals row below the hero. Leave empty to show the built-in defaults.',
    },
    fields: [
      {
        name: 'icon',
        type: 'select',
        required: true,
        defaultValue: 'truck',
        options: [
          { label: 'Truck (shipping)', value: 'truck' },
          { label: 'Returns', value: 'returns' },
          { label: 'Lock (secure payments)', value: 'lock' },
          { label: 'Banknote (cash on delivery)', value: 'cod' },
        ],
      },
      {
        name: 'label',
        type: 'text',
        required: true,
        admin: { description: 'Bold label, e.g. "Free Shipping"' },
      },
      {
        name: 'sub',
        type: 'text',
        admin: { description: 'Supporting line, e.g. "On orders over Rs. 999"' },
      },
      {
        name: 'order',
        type: 'number',
        admin: { description: 'Lower numbers appear first' },
      },
    ],
  },
]
