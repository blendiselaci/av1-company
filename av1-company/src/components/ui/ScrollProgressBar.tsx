import { motion, useReducedMotion } from 'framer-motion'
import { useScrollProgress } from '@/hooks/useScrollProgress'

export function ScrollProgressBar() {
  const progress = useScrollProgress()
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-transparent" aria-hidden="true">
      <motion.div
        className="h-full origin-left bg-[linear-gradient(90deg,#2a5736_0%,#3d7a4d_100%)]"
        animate={{ scaleX: progress }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'linear' }}
      />
    </div>
  )
}
