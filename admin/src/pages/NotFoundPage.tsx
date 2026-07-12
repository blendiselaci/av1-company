import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <FileQuestion className="h-12 w-12 text-muted" aria-hidden="true" />
      <div>
        <h1 className="text-lg font-semibold text-foreground">Page not found</h1>
        <p className="mt-1 text-sm text-muted">The page you're looking for doesn't exist.</p>
      </div>
      <Link to="/" className="text-sm text-brand hover:underline">
        Return to dashboard
      </Link>
    </div>
  )
}
