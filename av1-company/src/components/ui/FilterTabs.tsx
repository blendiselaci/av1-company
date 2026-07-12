import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FilterTabsProps {
  filters: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
  layoutId: string
}

/** Generic sliding-pill filter bar. Give each usage a unique `layoutId` so independent
 *  filter bars rendered on the same page don't share the same animated pill. */
export function FilterTabs({ filters, active, onChange, layoutId }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
      {filters.map((filter) => {
        const isActive = filter.key === active
        return (
          <button
            key={filter.key}
            type="button"
            onClick={() => onChange(filter.key)}
            aria-pressed={isActive}
            className={cn(
              'relative rounded-full px-5 py-2 text-sm font-medium transition-colors',
              isActive ? 'text-white' : 'text-foreground/70 hover:text-foreground',
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-av1-green"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </button>
        )
      })}
    </div>
  )
}
