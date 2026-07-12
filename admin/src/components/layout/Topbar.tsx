import { Menu, Moon, Sun } from 'lucide-react'
import { Breadcrumbs } from './Breadcrumbs'
import { UserMenu } from './UserMenu'
import { useDarkMode } from '../../hooks/useDarkMode'

export function Topbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-surface px-4 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="rounded-lg p-2 text-foreground hover:bg-background lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggle}
          className="rounded-lg p-2 text-foreground hover:bg-background"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        </button>
        <UserMenu />
      </div>
    </header>
  )
}
