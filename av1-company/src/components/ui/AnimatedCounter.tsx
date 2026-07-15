import { useEffect, useRef, useState } from 'react'
import { animate, useInView, useReducedMotion } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  /** Decimal places to animate/display (e.g. 1 for a "4.9" rating). Defaults to 0 (whole numbers). */
  decimals?: number
  duration?: number
  className?: string
}

export function AnimatedCounter({ value, suffix = '', decimals = 0, duration = 1.6, className }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-10% 0px' })
  const shouldReduceMotion = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!isInView) return

    if (shouldReduceMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value)
      return
    }

    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Number(latest.toFixed(decimals))),
    })

    return () => controls.stop()
  }, [isInView, value, duration, shouldReduceMotion, decimals])

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString('sq-AL', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}
