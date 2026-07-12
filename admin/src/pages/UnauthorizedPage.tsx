import { Link } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import { Button } from '../components/ui/Button'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <ShieldAlert className="h-12 w-12 text-warning" aria-hidden="true" />
      <div>
        <h1 className="text-lg font-semibold text-foreground">You don't have access to this page</h1>
        <p className="mt-1 text-sm text-muted">This section is restricted to administrators.</p>
      </div>
      <Button onClick={() => window.history.back()} variant="secondary">
        Go back
      </Button>
      <Link to="/" className="text-sm text-brand hover:underline">
        Return to dashboard
      </Link>
    </div>
  )
}
