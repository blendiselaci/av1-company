import { Fragment } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/navigation'

interface Crumb {
  label: string
  to?: string
}

/** Derives breadcrumbs from the URL rather than each page declaring its own —
 *  every resource follows the same `/resource`, `/resource/new`, `/resource/:id`
 *  shape, so one generic reader covers all of them. */
function buildCrumbs(pathname: string): Crumb[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return [{ label: 'Dashboard' }]

  const topPath = `/${segments[0]}`
  const navItem = NAV_ITEMS.find((item) => item.path === topPath)
  const crumbs: Crumb[] = [{ label: 'Dashboard', to: '/' }]

  if (navItem) {
    crumbs.push({ label: navItem.label, to: segments.length > 1 ? topPath : undefined })
  }

  if (segments.length > 1) {
    const last = segments[segments.length - 1]
    crumbs.push({ label: last === 'new' ? 'New' : 'Edit' })
  }

  return crumbs
}

export function Breadcrumbs() {
  const { pathname } = useLocation()
  const crumbs = buildCrumbs(pathname)

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block">
      <ol className="flex items-center gap-1.5 text-sm text-muted">
        {crumbs.map((crumb, index) => (
          <Fragment key={`${crumb.label}-${index}`}>
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />}
            <li>
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={index === crumbs.length - 1 ? 'page' : undefined} className="text-foreground">
                  {crumb.label}
                </span>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  )
}
