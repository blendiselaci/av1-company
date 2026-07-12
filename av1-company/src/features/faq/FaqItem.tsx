import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FaqItem as FaqItemType } from '@/types'

interface FaqItemProps {
  item: FaqItemType
  isOpen: boolean
  onToggle: () => void
}

export function FaqItem({ item, isOpen, onToggle }: FaqItemProps) {
  const shouldReduceMotion = useReducedMotion()
  const panelId = `faq-panel-${item.id}`
  const buttonId = `faq-trigger-${item.id}`

  return (
    <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.03] backdrop-blur-sm">
      <h3>
        <button
          type="button"
          id={buttonId}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:text-av1-green focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-av1-green/40 sm:px-8 sm:py-6"
        >
          <span className="text-base font-semibold tracking-tight text-foreground sm:text-lg">{item.question}</span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-av1-green/10 text-av1-green"
          >
            <ChevronDown size={18} aria-hidden="true" />
          </motion.span>
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.01 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-6 pb-6 text-sm leading-relaxed text-foreground/70 sm:px-8 sm:pb-8">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
