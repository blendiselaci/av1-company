import { createContext } from 'react'

export interface ToastContextValue {
  show: (toast: { variant: 'success' | 'error' | 'info'; title: string; description?: string }) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
