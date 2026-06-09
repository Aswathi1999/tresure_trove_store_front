import type { Media } from './media'

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: unknown // Lexical rich text JSON
  coverImage: Media | string
  tags?: Array<{ tag: string }>
  author?: string
  relatedPosts?: Array<BlogPost | string>
  publishedAt?: string
  _status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}

export interface MaterialStory {
  id: string
  title: string
  slug: string
  material: string
  excerpt: string
  content: unknown // Lexical rich text JSON
  coverImage: Media | string
  status: 'draft' | 'published'
  createdAt: string
  updatedAt: string
}
