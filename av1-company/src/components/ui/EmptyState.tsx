import type { LucideIcon } from 'lucide-react'
import { Inbox, RotateCcw } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message: string
  retryLabel?: string
  onRetry?: () => void
  className?: string
}

/** Shared empty/error placeholder — used when a filtered list has no results,
 *  or a section fails to load and offers a retry action. */
export function EmptyState({ icon: Icon = Inbox, title, message, retryLabel, onRetry, className }: EmptyStateProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-foreground/15 bg-foreground/[0.02] px-6 py-16 text-center',
        className,
      )}
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-av1-green/10 text-av1-green">
        <Icon size={26} aria-hidden="true" />
      </span>
      <div>
        <p className="text-base font-semibold text-foreground">{title}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-foreground/70">{message}</p>
      </div>
      {retryLabel && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-5 py-2.5 text-sm font-medium text-foreground/80 transition-all duration-200 hover:-translate-y-0.5 hover:border-av1-green hover:text-av1-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-av1-green focus-visible:ring-offset-2"
        >
          <RotateCcw size={16} aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </motion.div>
  )
}
