import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface FormPageLayoutProps {
  title: string
  backTo: string
  children: ReactNode
}

export function FormPageLayout({ title, backTo, children }: FormPageLayoutProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link to={backTo} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back
      </Link>
      <h1 className="text-xl font-semibold text-foreground">{title}</h1>
      <div className="rounded-xl border border-border bg-surface p-5">{children}</div>
    </div>
  )
}
