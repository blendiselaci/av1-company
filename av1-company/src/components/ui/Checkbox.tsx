import { forwardRef } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: boolean
  children: ReactNode
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, error, children, id, ...props }, ref) => {
    return (
      <label htmlFor={id} className={cn('flex cursor-pointer select-none items-start gap-3', className)}>
        <span className="relative mt-0.5 h-5 w-5 shrink-0">
          <input
            ref={ref}
            id={id}
            type="checkbox"
            aria-invalid={error || undefined}
            className="peer absolute inset-0 h-full w-full cursor-pointer opacity-0"
            {...props}
          />
          <span
            aria-hidden="true"
            className={cn(
              'pointer-events-none absolute inset-0 rounded-md border bg-foreground/[0.03] backdrop-blur-sm transition-colors duration-200 peer-checked:border-av1-green peer-checked:bg-av1-green peer-focus-visible:ring-2 peer-focus-visible:ring-av1-green/40 peer-focus-visible:ring-offset-2',
              error ? 'border-red-500/60' : 'border-foreground/25',
            )}
          />
          <Check
            size={14}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto scale-0 text-white transition-transform duration-150 peer-checked:scale-100"
          />
        </span>
        <span className="text-sm leading-relaxed text-foreground/70">{children}</span>
      </label>
    )
  },
)

Checkbox.displayName = 'Checkbox'
