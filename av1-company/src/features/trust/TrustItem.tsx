import type { LucideIcon } from 'lucide-react'

interface TrustItemProps {
  icon: LucideIcon
  title: string
  description: string
}

export function TrustItem({ icon: Icon, title, description }: TrustItemProps) {
  return (
    <div className="flex h-full flex-col items-center rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-av1-green/30 hover:shadow-lg hover:shadow-black/5 sm:items-start sm:text-left">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-av1-green/10 text-av1-green">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-foreground/70">{description}</p>
    </div>
  )
}
