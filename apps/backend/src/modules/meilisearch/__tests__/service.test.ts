const mockIndex = {
  updateSearchableAttributes: jest.fn().mockResolvedValue({}),
  updateDisplayedAttributes: jest.fn().mockResolvedValue({}),
  updateRankingRules: jest.fn().mockResolvedValue({}),
  addDocuments: jest.fn().mockResolvedValue({}),
  deleteDocuments: jest.fn().mockResolvedValue({}),
  search: jest.fn().mockResolvedValue({ hits: [], estimatedTotalHits: 0 }),
}

const mockMeilisearchInstance = {
  index: jest.fn().mockReturnValue(mockIndex),
}

jest.mock('meilisearch', () => ({
  Meilisearch: jest.fn().mockImplementation(() => mockMeilisearchInstance),
}))

import MeilisearchModuleService from '../service'
import type { ProductDocument } from '../service'

const BASE_OPTIONS = {
  host: 'http://127.0.0.1:7700',
  apiKey: 'test-master-key',
  productIndexName: 'products',
}

function makeService(options = BASE_OPTIONS) {
  return new MeilisearchModuleService({}, options)
}

const MOCK_PRODUCT: ProductDocument = {
  id: 'prod_01',
  title: 'ŌKURA LOUNGE CHAIR',
  handle: 'okura-lounge-chair',
  thumbnail: 'https://cdn.example.com/chair.jpg',
  description: 'Handcrafted teak lounge chair',
  collection_id: 'col_01',
  collection_title: 'SEATING',
  min_price: 28500000,
  max_price: 28500000,
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('MeilisearchModuleService', () => {
  describe('constructor', () => {
    it('throws when host is missing', () => {
      expect(() => makeService({ ...BASE_OPTIONS, host: '' })).toThrow(
        'MeiliSearch module requires host, apiKey, and productIndexName options',
      )
    })

    it('throws when apiKey is missing', () => {
      expect(() => makeService({ ...BASE_OPTIONS, apiKey: '' })).toThrow(
        'MeiliSearch module requires host, apiKey, and productIndexName options',
      )
    })

    it('throws when productIndexName is missing', () => {
      expect(() => makeService({ ...BASE_OPTIONS, productIndexName: '' })).toThrow(
        'MeiliSearch module requires host, apiKey, and productIndexName options',
      )
    })

    it('initialises the MeiliSearch client with host and apiKey', () => {
      const { Meilisearch } = jest.requireMock('meilisearch')
      makeService()
      expect(Meilisearch).toHaveBeenCalledWith({
        host: BASE_OPTIONS.host,
        apiKey: BASE_OPTIONS.apiKey,
      })
    })
  })

  describe('setupIndex', () => {
    it('sets searchable attributes with title first for ranking priority', async () => {
      const service = makeService()
      await service.setupIndex()
      expect(mockIndex.updateSearchableAttributes).toHaveBeenCalledWith([
        'title',
        'handle',
        'description',
        'collection_title',
      ])
    })

    it('sets all required displayed attributes', async () => {
      const service = makeService()
      await service.setupIndex()
      const [attrs] = mockIndex.updateDisplayedAttributes.mock.calls[0] as [string[]]
      expect(attrs).toEqual(
        expect.arrayContaining([
          'id',
          'title',
          'handle',
          'thumbnail',
          'description',
          'collection_id',
          'collection_title',
          'min_price',
          'max_price',
        ]),
      )
    })

    it('sets ranking rules with standard MeiliSearch relevance order', async () => {
      const service = makeService()
      await service.setupIndex()
      expect(mockIndex.updateRankingRules).toHaveBeenCalledWith([
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness',
      ])
    })

    it('uses the configured productIndexName', async () => {
      const service = makeService({ ...BASE_OPTIONS, productIndexName: 'my-products' })
      await service.setupIndex()
      expect(mockMeilisearchInstance.index).toHaveBeenCalledWith('my-products')
    })
  })

  describe('indexProducts', () => {
    it('calls addDocuments with products and id as primary key', async () => {
      const service = makeService()
      await service.indexProducts([MOCK_PRODUCT])
      expect(mockIndex.addDocuments).toHaveBeenCalledWith([MOCK_PRODUCT], { primaryKey: 'id' })
    })

    it('indexes multiple products in a single call', async () => {
      const service = makeService()
      const second = { ...MOCK_PRODUCT, id: 'prod_02', title: 'HANA DINING TABLE' }
      await service.indexProducts([MOCK_PRODUCT, second])
      expect(mockIndex.addDocuments).toHaveBeenCalledWith([MOCK_PRODUCT, second], {
        primaryKey: 'id',
      })
    })

    it('skips addDocuments call when given an empty array', async () => {
      const service = makeService()
      await service.indexProducts([])
      expect(mockIndex.addDocuments).not.toHaveBeenCalled()
    })

    it('preserves null fields on the document', async () => {
      const service = makeService()
      const nullish: ProductDocument = {
        ...MOCK_PRODUCT,
        thumbnail: null,
        description: null,
        collection_id: null,
        collection_title: null,
        min_price: null,
        max_price: null,
      }
      await service.indexProducts([nullish])
      expect(mockIndex.addDocuments).toHaveBeenCalledWith([nullish], { primaryKey: 'id' })
    })
  })

  describe('deleteProducts', () => {
    it('calls deleteDocuments with the given ids', async () => {
      const service = makeService()
      await service.deleteProducts(['prod_01', 'prod_02'])
      expect(mockIndex.deleteDocuments).toHaveBeenCalledWith(['prod_01', 'prod_02'])
    })

    it('skips deleteDocuments call when given an empty array', async () => {
      const service = makeService()
      await service.deleteProducts([])
      expect(mockIndex.deleteDocuments).not.toHaveBeenCalled()
    })
  })

  describe('search', () => {
    it('searches the product index with the given query', async () => {
      const service = makeService()
      await service.search('lounge chair')
      expect(mockIndex.search).toHaveBeenCalledWith('lounge chair', { limit: 20 })
    })

    it('uses default limit of 20', async () => {
      const service = makeService()
      await service.search('chair')
      const [, opts] = mockIndex.search.mock.calls[0] as [string, { limit: number }]
      expect(opts.limit).toBe(20)
    })

    it('accepts a custom limit for autocomplete use case', async () => {
      const service = makeService()
      await service.search('chair', 5)
      expect(mockIndex.search).toHaveBeenCalledWith('chair', { limit: 5 })
    })

    it('handles an empty query without throwing', async () => {
      const service = makeService()
      await expect(service.search('')).resolves.not.toThrow()
      expect(mockIndex.search).toHaveBeenCalledWith('', { limit: 20 })
    })

    it('handles special characters in the query without throwing', async () => {
      const service = makeService()
      const specialQuery = '!@#$%^&*() chair "teak" <>'
      await expect(service.search(specialQuery)).resolves.not.toThrow()
      expect(mockIndex.search).toHaveBeenCalledWith(specialQuery, { limit: 20 })
    })

    it('returns the raw MeiliSearch response', async () => {
      const mockResult = { hits: [{ id: 'prod_01', title: 'Chair' }], estimatedTotalHits: 1 }
      mockIndex.search.mockResolvedValueOnce(mockResult)
      const service = makeService()
      const result = await service.search('chair')
      expect(result).toEqual(mockResult)
    })
  })
})
