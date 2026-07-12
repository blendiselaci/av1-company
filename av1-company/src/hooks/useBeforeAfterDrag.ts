import { useCallback, useRef, useState } from 'react'
import { useMotionValue, useMotionValueEvent, useSpring } from 'framer-motion'
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react'

interface UseBeforeAfterDragOptions {
  initial?: number
  step?: number
  reduceMotion?: boolean
}

/**
 * Drag logic for a before/after comparison slider.
 *
 * Position is tracked via a Framer Motion `MotionValue` (not React state), so dragging
 * updates the DOM directly on every pointer move without triggering a React re-render.
 * A small piece of state (`ariaValue`) mirrors the value only for the ARIA attribute,
 * since that has to be reflected in the render output for screen readers.
 */
export function useBeforeAfterDrag({ initial = 50, step = 5, reduceMotion = false }: UseBeforeAfterDragOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const rawPosition = useMotionValue(initial)
  const position = useSpring(
    rawPosition,
    reduceMotion ? { stiffness: 1000, damping: 100 } : { stiffness: 300, damping: 32, mass: 0.4 },
  )
  const [ariaValue, setAriaValue] = useState(initial)

  useMotionValueEvent(rawPosition, 'change', (latest) => {
    setAriaValue(latest)
  })

  const updateFromClientX = useCallback(
    (clientX: number) => {
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const ratio = (clientX - rect.left) / rect.width
      rawPosition.set(Math.min(100, Math.max(0, ratio * 100)))
    },
    [rawPosition],
  )

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true
      event.currentTarget.setPointerCapture(event.pointerId)
      updateFromClientX(event.clientX)
    },
    [updateFromClientX],
  )

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return
      updateFromClientX(event.clientX)
    },
    [updateFromClientX],
  )

  const handlePointerUp = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }, [])

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      const current = rawPosition.get()
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        rawPosition.set(Math.max(0, current - step))
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        rawPosition.set(Math.min(100, current + step))
      } else if (event.key === 'Home') {
        event.preventDefault()
        rawPosition.set(0)
      } else if (event.key === 'End') {
        event.preventDefault()
        rawPosition.set(100)
      }
    },
    [rawPosition, step],
  )

  return {
    containerRef,
    position,
    ariaValue,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleKeyDown,
  }
}
