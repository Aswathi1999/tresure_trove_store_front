// Product types mirror Medusa v2 SDK types
// The source of truth is the Medusa JS SDK — these are convenience re-exports

export interface ProductVariant {
  id: string
  title: string
  sku: string | null
  inventory_quantity: number
  prices: ProductPrice[]
  options: Record<string, string>
}

export interface ProductPrice {
  id: string
  amount: number
  currency_code: string
}

export interface Product {
  id: string
  title: string
  handle: string
  description: string | null
  thumbnail: string | null
  images: Array<{ url: string }>
  variants: ProductVariant[]
  collection_id: string | null
  tags: Array<{ value: string }>
  created_at: string
  updated_at: string
}

export interface ProductCollection {
  id: string
  title: string
  handle: string
  products?: Product[]
}
