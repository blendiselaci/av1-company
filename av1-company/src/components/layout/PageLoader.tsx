import { Loader2 } from 'lucide-react'

/** Suspense fallback shown while a lazy-loaded route chunk downloads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-av1-green" aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </div>
  )
}
