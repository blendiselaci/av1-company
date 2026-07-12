import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import '@/styles/globals.css'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider } from '@/auth/AuthContext'
import { ToastProvider } from '@/components/ui/Toast'
import { applyInitialTheme } from '@/hooks/useDarkMode'
import App from './App'

applyInitialTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Applies to every motion/AnimatePresence component in the tree — honors
        the OS-level prefers-reduced-motion setting without needing each
        individual animated component (Modal, Toast, MobileSidebar, ...) to
        check it itself. */}
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
