import { useCallback, useRef, useState } from 'react'

/**
 * Shared state for "click a grid item to open it in a fullscreen overlay" patterns
 * (gallery lightbox, video modal): tracks which index is active and restores focus
 * to the trigger element when the overlay closes.
 */
export function useMediaOverlay(itemCount: number) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const lastFocusedRef = useRef<HTMLElement | null>(null)

  const open = useCallback((index: number) => {
    lastFocusedRef.current = document.activeElement as HTMLElement
    setActiveIndex(index)
  }, [])

  const close = useCallback(() => {
    setActiveIndex(null)
    lastFocusedRef.current?.focus()
  }, [])

  /** Dismiss without restoring focus — for cases like a filter change, where the
   *  triggering element (a filter tab) already retains focus on its own. */
  const reset = useCallback(() => {
    setActiveIndex(null)
  }, [])

  const navigate = useCallback(
    (direction: 1 | -1) => {
      setActiveIndex((current) => {
        if (current === null) return current
        return (current + direction + itemCount) % itemCount
      })
    },
    [itemCount],
  )

  return { activeIndex, open, close, reset, navigate }
}
