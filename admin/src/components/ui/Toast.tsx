import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { createPortal } from 'react-dom'
import { cn } from '../../lib/utils'
import { ToastContext, type ToastContextValue } from './toastContextInstance'

type ToastVariant = 'success' | 'error' | 'info'

interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
}

const VARIANT_ICON: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Info,
}

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: 'border-success/30 text-success',
  error: 'border-danger/30 text-danger',
  info: 'border-info/30 text-info',
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const show = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = crypto.randomUUID()
      setToasts((prev) => [...prev, { ...toast, id }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  const value = useMemo<ToastContextValue>(
    () => ({
      show,
      success: (title, description) => show({ variant: 'success', title, description }),
      error: (title, description) => show({ variant: 'error', title, description }),
      info: (title, description) => show({ variant: 'info', title, description }),
    }),
    [show],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
          aria-live="polite"
        >
          <AnimatePresence>
            {toasts.map((toast) => {
              const Icon = VARIANT_ICON[toast.variant]
              return (
                <motion.div
                  key={toast.id}
                  role="status"
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className={cn(
                    'pointer-events-auto flex items-start gap-3 rounded-lg border bg-surface p-3 shadow-lg',
                    VARIANT_CLASSES[toast.variant],
                  )}
                >
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{toast.title}</p>
                    {toast.description && <p className="mt-0.5 text-xs text-muted">{toast.description}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() => dismiss(toast.id)}
                    className="shrink-0 rounded p-0.5 text-muted hover:text-foreground"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}
