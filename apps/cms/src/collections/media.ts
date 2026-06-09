import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'
import { isAuthenticated } from '../access/isAuthenticated'

const MAX_FILE_SIZE = 10_485_760 // 10MB in bytes

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    create: isAuthenticated,
    read: () => true,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  admin: {
    useAsTitle: 'alt',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize', 'createdAt'],
  },
  hooks: {
    beforeOperation: [
      async ({ operation, req }) => {
        if ((operation === 'create' || operation === 'update') && req.file) {
          if (req.file.size > MAX_FILE_SIZE) {
            throw new APIError('File size must be less than 10MB.', 400)
          }
        }
      },
    ],
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    disableLocalStorage: true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt Text',
    },
  ],
}
