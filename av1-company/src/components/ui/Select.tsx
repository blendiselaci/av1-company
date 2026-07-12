import { forwardRef } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ className, error, children, ...props }, ref) => {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={error || undefined}
        className={cn(
          'w-full appearance-none rounded-xl border bg-foreground/[0.03] px-4 py-3 pr-10 text-sm text-foreground backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
          error
            ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/25'
            : 'border-foreground/15 focus:border-av1-green focus:ring-av1-green/25',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50"
      />
    </div>
  )
})

Select.displayName = 'Select'
