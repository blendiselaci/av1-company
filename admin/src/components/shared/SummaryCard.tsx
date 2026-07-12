import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CardSkeleton } from '../ui/Skeleton'

interface SummaryCardProps {
  label: string
  value: number | undefined
  icon: LucideIcon
  to: string
  isLoading: boolean
}

export function SummaryCard({ label, value, icon: Icon, to, isLoading }: SummaryCardProps) {
  if (isLoading) return <CardSkeleton />

  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-brand/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl font-semibold text-foreground">{value ?? 0}</p>
        <p className="text-xs text-muted">{label}</p>
      </div>
    </Link>
  )
}
