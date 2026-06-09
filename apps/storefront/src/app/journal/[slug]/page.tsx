import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { BlogPost } from '@TreasureTrove/types'
import { Breadcrumb } from '@/components/ui/Breadcrumb'
import { PostDetail } from '@/components/journal/PostDetail'
import { RelatedPosts } from '@/components/journal/RelatedPosts'
import { getPostBySlug, getPosts } from '@/lib/payload'

export const revalidate = 1800

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const data = await getPosts()
    return data.docs.map((post) => ({ slug: post.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: 'Post Not Found — Treasure Trove' }
  const coverUrl = typeof post.coverImage === 'string' ? post.coverImage : post.coverImage.url
  return {
    title: `${post.title} — Treasure Trove`,
    description: post.excerpt,
    openGraph: { images: [{ url: coverUrl }] },
  }
}

export default async function JournalPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) notFound()

  const relatedPosts = (post.relatedPosts ?? []).filter(
    (p): p is BlogPost => typeof p === 'object' && p !== null,
  )

  return (
    <div>
      <div className="pt-[92px] lg:pt-[112px] bg-[var(--color-tt-surface-container)]">
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Journal', href: '/journal' },
            { label: post.title },
          ]}
        />
      </div>
      <PostDetail post={post} />
      <RelatedPosts posts={relatedPosts} />
    </div>
  )
}
