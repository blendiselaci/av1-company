import { useEffect } from 'react'
import type { RefObject } from 'react'

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

interface UseModalA11yOptions {
  isOpen: boolean
  onClose: () => void
  dialogRef: RefObject<HTMLElement | null>
  initialFocusRef: RefObject<HTMLElement | null>
  /** Optional — pass to also let ArrowLeft/ArrowRight navigate (e.g. lightbox prev/next). */
  onNavigate?: (direction: 1 | -1) => void
}

/**
 * Shared full-screen dialog behavior: focuses the given element on open, traps Tab
 * within the dialog, closes on Escape, and locks body scroll while open. Used by
 * GalleryLightbox and VideoModal so both stay in sync instead of drifting apart.
 */
export function useModalA11y({ isOpen, onClose, dialogRef, initialFocusRef, onNavigate }: UseModalA11yOptions) {
  useEffect(() => {
    if (!isOpen) return

    initialFocusRef.current?.focus()
    document.body.style.overflow = 'hidden'

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (onNavigate && event.key === 'ArrowRight') {
        onNavigate(1)
        return
      }
      if (onNavigate && event.key === 'ArrowLeft') {
        onNavigate(-1)
        return
      }
      if (event.key === 'Tab') {
        const container = dialogRef.current
        if (!container) return
        const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, onNavigate, dialogRef, initialFocusRef])
}
