import type { Field } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const brandPhilosophyFields: Field[] = [
  {
    name: 'brandPhilosophyEyebrow',
    type: 'text',
    admin: { description: 'Small label above the heading (e.g. "MONSOON READY")' },
  },
  { name: 'brandPhilosophyHeading', type: 'text' },
  { name: 'brandPhilosophyBody', type: 'richText', editor: lexicalEditor({}) },
  { name: 'brandPhilosophyImage', type: 'upload', relationTo: 'media' },
  { name: 'brandPhilosophyCtaText', type: 'text' },
  { name: 'brandPhilosophyCtaLink', type: 'text' },
]
