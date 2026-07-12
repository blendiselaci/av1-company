import { useState } from 'react'
import type { MouseEvent } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  buttonBaseClass,
  buttonSizeClass,
  buttonVariantClass,
  type ButtonSize,
  type ButtonVariant,
} from '@/lib/buttonVariants'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

interface RippleLinkProps extends LinkProps {
  variant?: ButtonVariant
  size?: ButtonSize
}

/** A LinkButton with a Material-style click ripple. Reuses the shared button
 *  style tokens so it stays visually identical to LinkButton at rest. */
export function RippleLink({ className, variant = 'primary', size = 'md', onClick, ...props }: RippleLinkProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    const rect = event.currentTarget.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height) * 1.6
    const id = Date.now()
    setRipples((current) => [
      ...current,
      { id, x: event.clientX - rect.left - size / 2, y: event.clientY - rect.top - size / 2, size },
    ])
    onClick?.(event)
  }

  return (
    <Link
      className={cn(buttonBaseClass, buttonVariantClass[variant], buttonSizeClass[size], 'relative overflow-hidden', className)}
      onClick={handleClick}
      {...props}
    >
      {props.children}
      <span className="pointer-events-none absolute inset-0" aria-hidden="true">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.35, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              onAnimationComplete={() => setRipples((current) => current.filter((r) => r.id !== ripple.id))}
              className="absolute rounded-full bg-current"
              style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
            />
          ))}
        </AnimatePresence>
      </span>
    </Link>
  )
}
