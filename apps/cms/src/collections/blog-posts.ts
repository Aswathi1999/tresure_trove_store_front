import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidateBlogPost } from '../hooks/revalidate-blog-post'
import { revalidateStorefront } from '../hooks/revalidate-storefront'
import { isAuthenticated } from '../access/isAuthenticated'

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')

const generateSlugFromTitle: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' && data.title && !data.slug) {
    return { ...data, slug: slugify(data.title as string) }
  }
  return data
}

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  versions: {
    drafts: true,
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status', 'publishedAt'],
  },
  hooks: {
    beforeChange: [generateSlugFromTitle],
    afterChange: [revalidateBlogPost],
    // Deletions always revalidate (even a deleted draft whose published version
    // was still live), so a removed post disappears from the storefront.
    afterDelete: [revalidateStorefront('blog')],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      editor: lexicalEditor({}),
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tags',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'author',
      type: 'text',
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      relationTo: 'blog-posts',
      hasMany: true,
      maxRows: 3,
      label: 'Related Posts',
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: { position: 'sidebar' },
    },
  ],
}
