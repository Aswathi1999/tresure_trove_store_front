import Image from 'next/image'
import type {
  LexicalContent,
  LexicalNode,
  LexicalTextNode,
  LexicalLinkNode,
  LexicalElementNode,
  LexicalUploadNode,
} from '@/lib/payload.mock'

function renderText(node: LexicalTextNode): React.ReactNode {
  let content: React.ReactNode = node.text
  const fmt = node.format ?? 0
  if (fmt & 2) content = <em>{content}</em>
  if (fmt & 1) content = <strong>{content}</strong>
  return content
}

function renderLink(node: LexicalLinkNode, key: string): React.ReactNode {
  return (
    <a
      key={key}
      href={node.url}
      target={node.newTab ? '_blank' : undefined}
      rel={node.newTab ? 'noopener noreferrer' : undefined}
      className="text-[var(--color-tt-orange)] underline-offset-2 hover:underline"
    >
      {node.children.map((child, i) => renderText(child as LexicalTextNode))}
    </a>
  )
}

function renderNode(node: LexicalNode, key: string): React.ReactNode {
  if (node.type === 'text') return <span key={key}>{renderText(node as LexicalTextNode)}</span>

  if (node.type === 'link') return renderLink(node as LexicalLinkNode, key)

  if (node.type === 'upload') {
    const upload = node as LexicalUploadNode
    return (
      <div key={key} className="my-8 relative w-full aspect-video overflow-hidden rounded-sm">
        <Image
          src={upload.value.url}
          alt={upload.value.alt}
          fill
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>
    )
  }

  const el = node as LexicalElementNode
  const children = el.children.map((child, i) => renderNode(child as LexicalNode, `${key}-${i}`))

  if (el.type === 'heading') {
    const tag = el.tag ?? 'h2'
    const headingClass =
      tag === 'h2'
        ? 'text-2xl font-bold text-[var(--color-tt-ink)] mt-10 mb-4'
        : tag === 'h3'
          ? 'text-xl font-semibold text-[var(--color-tt-ink)] mt-8 mb-3'
          : 'text-lg font-semibold text-[var(--color-tt-ink)] mt-6 mb-2'
    if (tag === 'h2')
      return (
        <h2 key={key} className={headingClass}>
          {children}
        </h2>
      )
    if (tag === 'h3')
      return (
        <h3 key={key} className={headingClass}>
          {children}
        </h3>
      )
    return (
      <h4 key={key} className={headingClass}>
        {children}
      </h4>
    )
  }

  if (el.type === 'paragraph') {
    return (
      <p key={key} className="text-base leading-relaxed text-[var(--color-tt-outline)] mb-5">
        {children}
      </p>
    )
  }

  if (el.type === 'list') {
    return el.listType === 'number' ? (
      <ol
        key={key}
        className="list-decimal list-inside space-y-2 mb-5 text-[var(--color-tt-outline)]"
      >
        {children}
      </ol>
    ) : (
      <ul key={key} className="list-disc list-inside space-y-2 mb-5 text-[var(--color-tt-outline)]">
        {children}
      </ul>
    )
  }

  if (el.type === 'listitem') {
    return (
      <li key={key} className="text-base leading-relaxed">
        {children}
      </li>
    )
  }

  if (el.type === 'quote') {
    return (
      <blockquote
        key={key}
        className="border-l-4 border-[var(--color-tt-gold)] pl-6 py-2 my-8 italic text-lg text-[var(--color-tt-ink-muted)] leading-relaxed"
      >
        {children}
      </blockquote>
    )
  }

  return <div key={key}>{children}</div>
}

interface RichTextRendererProps {
  content: LexicalContent
}

export function RichTextRenderer({ content }: RichTextRendererProps) {
  return (
    <div className="prose-custom">
      {content.root.children.map((node, i) => renderNode(node, `node-${i}`))}
    </div>
  )
}
