/* eslint-disable no-console */
import { getPayload } from 'payload'
import config from '../payload.config'
import { seedMaterialStories } from './material-stories-seed'

async function main(): Promise<void> {
  const payload = await getPayload({ config })
  console.log('Seeding material stories…')
  const { created, updated, skipped } = await seedMaterialStories(payload)
  console.log(
    `\n✓ Done. created: [${created.join(', ')}], updated: [${updated.join(', ')}], skipped: [${skipped.join(', ')}]`,
  )
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
