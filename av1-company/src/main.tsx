import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/globals.css'
import '@/lib/i18n'
import { initAnalytics } from '@/lib/analytics'
import App from './App.tsx'

// Every route renders its own <PageMeta> (see src/components/seo/PageMeta.tsx), so the
// static pre-hydration <title>/<meta description> in index.html are no longer needed
// once React takes over — drop them to avoid duplicate tags in <head>.
document.querySelectorAll('[data-default]').forEach((node) => node.remove())

// No-ops until VITE_GA_MEASUREMENT_ID is configured — see src/lib/analytics.ts.
initAnalytics()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
