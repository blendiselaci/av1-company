import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, error, ...props }, ref) => {
  return (
    <input
      ref={ref}
      aria-invalid={error || undefined}
      className={cn(
        'w-full rounded-xl border bg-foreground/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-foreground/40 backdrop-blur-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
        error
          ? 'border-red-500/60 focus:border-red-500 focus:ring-red-500/25'
          : 'border-foreground/15 focus:border-av1-green focus:ring-av1-green/25',
        className,
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'
