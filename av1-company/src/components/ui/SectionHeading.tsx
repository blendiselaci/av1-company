import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  /** Standalone pages (Gallery, Contact, ...) need this to be the page's one-and-only
   *  h1; homepage sections default to h2 since Hero already owns the page's h1. */
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  as: Heading = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' ? 'mx-auto text-center' : 'text-left', className)}>
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-widest text-av1-green">
          {eyebrow}
        </p>
      )}
      <Heading className="text-balance text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
        {title}
      </Heading>
      {subtitle && <p className="mt-4 text-balance text-lg leading-relaxed text-foreground/70">{subtitle}</p>}
    </div>
  )
}
