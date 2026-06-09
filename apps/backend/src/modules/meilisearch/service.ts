import { Meilisearch } from 'meilisearch'
import { MedusaError } from '@medusajs/framework/utils'

type MeilisearchOptions = {
  host: string
  apiKey: string
  productIndexName: string
}

export type ProductDocument = {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  description: string | null
  collection_id: string | null
  collection_title: string | null
  min_price: number | null
  max_price: number | null
}

export default class MeilisearchModuleService {
  private client: Meilisearch
  private options: MeilisearchOptions

  constructor(_: Record<string, unknown>, options: MeilisearchOptions) {
    if (!options.host || !options.apiKey || !options.productIndexName) {
      throw new MedusaError(
        MedusaError.Types.INVALID_ARGUMENT,
        'MeiliSearch module requires host, apiKey, and productIndexName options',
      )
    }
    this.client = new Meilisearch({ host: options.host, apiKey: options.apiKey })
    this.options = options
  }

  private get productIndex() {
    return this.client.index(this.options.productIndexName)
  }

  // Configure index settings — call once on initial setup
  async setupIndex(): Promise<void> {
    const index = this.productIndex
    await index.updateSearchableAttributes(['title', 'handle', 'description', 'collection_title'])
    await index.updateDisplayedAttributes([
      'id',
      'title',
      'handle',
      'thumbnail',
      'description',
      'collection_id',
      'collection_title',
      'min_price',
      'max_price',
    ])
    // Title match ranked above description via searchableAttributes order
    await index.updateRankingRules(['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'])
  }

  async indexProducts(products: ProductDocument[]): Promise<void> {
    if (!products.length) return
    await this.productIndex.addDocuments(products, { primaryKey: 'id' })
  }

  async deleteProducts(ids: string[]): Promise<void> {
    if (!ids.length) return
    await this.productIndex.deleteDocuments(ids)
  }

  async search(query: string, limit = 20) {
    return this.productIndex.search(query, { limit })
  }
}
