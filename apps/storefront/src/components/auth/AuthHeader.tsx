type AuthHeaderProps = {
  eyebrow: string
  title: string
  description?: string
}

export function AuthHeader({ eyebrow, title, description }: AuthHeaderProps) {
  return (
    <header className="mb-8 pt-4 sm:pt-6">
      <span
        className="mb-3 block text-[13px] font-bold uppercase text-[var(--color-tt-orange)] sm:text-sm"
        style={{ letterSpacing: '0.1em' }}
      >
        {eyebrow}
      </span>
      <h1 className="text-3xl font-bold leading-tight text-[var(--color-tt-ink)] sm:text-4xl">
        {title}
      </h1>
      {description ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-tt-ink-muted)]">
          {description}
        </p>
      ) : null}
    </header>
  )
}
