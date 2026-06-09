import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateStorefront } from '../hooks/revalidate-storefront'
import { isAuthenticated } from '../access/isAuthenticated'

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

const generateSlugFromWoodType: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && data.woodType && !data.slug) {
    return { ...data, slug: slugify(data.woodType as string) }
  }
  return data
}

export const MaterialStories: CollectionConfig = {
  slug: 'material-stories',
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  versions: {
    drafts: true,
  },
  admin: {
    useAsTitle: 'woodType',
    defaultColumns: ['woodType', 'slug', 'origin', 'sustainabilityRating', 'publishedAt'],
  },
  hooks: {
    beforeChange: [generateSlugFromWoodType],
    afterChange: [revalidateStorefront('material')],
    afterDelete: [revalidateStorefront('material')],
  },
  fields: [
    {
      name: 'woodType',
      type: 'select',
      required: true,
      unique: true,
      options: [
        { label: 'Teak', value: 'teak' },
        { label: 'Walnut', value: 'walnut' },
        { label: 'Oak', value: 'oak' },
        { label: 'Mango', value: 'mango' },
        { label: 'Rosewood', value: 'rosewood' },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'sustainabilityRating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      admin: { position: 'sidebar' },
    },
    {
      name: 'origin',
      type: 'text',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date(),
      admin: { position: 'sidebar', hidden: false },
    },
  ],
}
