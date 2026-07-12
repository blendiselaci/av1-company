/**
 * Google Analytics (GA4) integration point — inert until VITE_GA_MEASUREMENT_ID
 * is set. No tracking ID is committed here; add one to a local .env (see
 * .env.example) or the hosting provider's env config before it does anything.
 *
 * Usage once a measurement ID is configured: call `initAnalytics()` once from
 * main.tsx, and `trackPageView(pathname)` from RootLayout's route-change
 * effect (see the `window.scrollTo` effect already there).
 */

const MEASUREMENT_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ?? ''

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export const isAnalyticsEnabled = MEASUREMENT_ID.length > 0

/** Injects the gtag.js script and initializes GA4. No-ops if no measurement
 *  ID is configured, so this is always safe to call unconditionally. */
export function initAnalytics(): void {
  if (!isAnalyticsEnabled || typeof document === 'undefined') return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  // send_page_view disabled — this is an SPA, so page views are tracked
  // explicitly per route change via trackPageView() instead.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })
}

export function trackPageView(path: string): void {
  if (!isAnalyticsEnabled || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: path })
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (!isAnalyticsEnabled || typeof window.gtag !== 'function') return
  window.gtag('event', name, params)
}
