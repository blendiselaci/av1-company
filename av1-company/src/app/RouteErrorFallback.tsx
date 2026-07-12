import { isRouteErrorResponse, useRouteError } from 'react-router-dom'
import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Container } from '@/components/ui/Container'

/** Root-level fallback for react-router's `errorElement` — catches render/loader
 *  errors anywhere in the routed tree that don't have a more specific boundary. */
export function RouteErrorFallback() {
  const error = useRouteError()
  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : 'We hit an unexpected error loading this page. Please try again.'

  return (
    <Container className="flex min-h-screen flex-col items-center justify-center gap-4 py-24 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-av1-green/10 text-av1-green">
        <AlertTriangle size={26} aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
      <p className="max-w-sm text-sm leading-relaxed text-foreground/70">{message}</p>
      <button
        type="button"
        onClick={() => window.location.assign('/')}
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-av1-green px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-av1-green-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-av1-green focus-visible:ring-offset-2"
      >
        <RotateCcw size={16} aria-hidden="true" />
        Back to Home
      </button>
    </Container>
  )
}
