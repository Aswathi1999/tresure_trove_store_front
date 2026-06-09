import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { generateFileURL } from './lib/generate-file-url'
import { Media } from './collections/media'
import { BlogPosts } from './collections/blog-posts'
import { MaterialStories } from './collections/material-stories'
import { Users } from './collections/users'
import { HomepageContent } from './globals/HomepageContent'

export default buildConfig({
  serverURL: process.env['PAYLOAD_PUBLIC_SERVER_URL'] ?? 'http://localhost:3001',
  secret: process.env['PAYLOAD_SECRET']!,
  db: postgresAdapter({
    pool: {
      connectionString: process.env['DATABASE_URI']!,
    },
    schemaName: 'payload',
    // Opt-out of dev-mode schema push (e.g. when running one-off tooling/seeds)
    // so it never prompts to drop drifting tables. Default behaviour unchanged.
    ...(process.env['PAYLOAD_DISABLE_PUSH'] === 'true' ? { push: false } : {}),
  }),
  editor: lexicalEditor({}),
  collections: [Users, Media, BlogPosts, MaterialStories],
  globals: [HomepageContent],
  plugins: [
    s3Storage({
      enabled: !!(process.env['AWS_ACCESS_KEY_ID'] && process.env['AWS_SECRET_ACCESS_KEY']),
      collections: {
        media: { generateFileURL },
      },
      bucket: process.env['S3_BUCKET'] ?? 'treasuretrove-media',
      config: {
        credentials: {
          accessKeyId: process.env['AWS_ACCESS_KEY_ID'] ?? '',
          secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
        },
        region: process.env['AWS_REGION'] ?? 'auto',
        endpoint: process.env['S3_ENDPOINT'],
        forcePathStyle: true,
      },
    }),
  ],
  typescript: {
    outputFile: '../../packages/types/src/payload-types.ts',
  },
  admin: {
    user: 'users',
  },
})
