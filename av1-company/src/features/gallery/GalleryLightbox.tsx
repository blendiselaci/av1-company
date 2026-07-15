import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { LazyImage } from '@/components/ui/LazyImage'
import { useModalA11y } from '@/hooks/useModalA11y'
import { CATEGORY_FALLBACK_ICON } from '@/lib/categoryIcons'
import type { GalleryItem } from '@/types'

const SWIPE_THRESHOLD = 60

interface LightboxImageProps {
  item: GalleryItem
}

function LightboxImage({ item }: LightboxImageProps) {
  const [errored, setErrored] = useState(false)
  const Icon = CATEGORY_FALLBACK_ICON

  if (errored) {
    return (
      <div className="flex h-[60vh] w-full max-w-3xl items-center justify-center rounded-xl bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]">
        <Icon className="h-20 w-20 text-white/20" aria-hidden="true" />
      </div>
    )
  }

  return (
    <LazyImage
      src={item.image}
      alt={item.title}
      fit="contain"
      draggable={false}
      onError={() => setErrored(true)}
      className="max-h-[70vh] w-auto max-w-full select-none rounded-xl object-contain"
    />
  )
}

interface GalleryLightboxProps {
  items: GalleryItem[]
  getLabel: (categoryId: string | null | undefined) => string
  activeIndex: number | null
  onClose: () => void
  onNavigate: (direction: 1 | -1) => void
  closeLabel: string
  nextLabel: string
  previousLabel: string
  ofLabel: string
}

export function GalleryLightbox({
  items,
  getLabel,
  activeIndex,
  onClose,
  onNavigate,
  closeLabel,
  nextLabel,
  previousLabel,
  ofLabel,
}: GalleryLightboxProps) {
  const shouldReduceMotion = useReducedMotion()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const isOpen = activeIndex !== null
  const item = activeIndex !== null ? items[activeIndex] : null

  useModalA11y({ isOpen, onClose, dialogRef, initialFocusRef: closeButtonRef, onNavigate })

  function handleDragEnd(_event: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    if (info.offset.x <= -SWIPE_THRESHOLD) {
      onNavigate(1)
    } else if (info.offset.x >= SWIPE_THRESHOLD) {
      onNavigate(-1)
    }
  }

  const dialog = item ? (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      className="fixed inset-0 z-[100] flex flex-col bg-black/95"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex items-center justify-between p-4 sm:p-6">
        <p className="text-sm font-medium text-white/70">
          {activeIndex !== null ? activeIndex + 1 : 0} {ofLabel} {items.length}
        </p>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={24} />
        </button>
      </div>

      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-6 sm:px-16"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose()
        }}
      >
        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate(-1)}
            aria-label={previousLabel}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:left-4"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <motion.div
          key={item.id}
          drag={items.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.5}
          onDragEnd={handleDragEnd}
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="touch-pan-y"
        >
          <LightboxImage item={item} />
        </motion.div>

        {items.length > 1 && (
          <button
            type="button"
            onClick={() => onNavigate(1)}
            aria-label={nextLabel}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white sm:right-4"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

      <div className="px-6 pb-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-av1-green-light">
          {getLabel(item.categoryId)}
        </p>
        <p className="mt-1 text-lg font-semibold text-white">{item.title}</p>
      </div>
    </div>
  ) : null

  if (shouldReduceMotion) {
    return dialog
  }

  return (
    <AnimatePresence>
      {item && (
        <motion.div key="gallery-lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {dialog}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
