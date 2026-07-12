import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, UserCircle } from 'lucide-react'
import { useAuth } from '../../auth/useAuth'
import { useOnClickOutside } from '../../hooks/useOnClickOutside'
import { cn } from '../../lib/utils'

export function UserMenu() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const menuRef = useRef<HTMLDivElement>(null)

  useOnClickOutside(menuRef, () => setIsOpen(false))

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  async function handleLogout() {
    setIsOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-foreground">
          {initials}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block font-medium text-foreground">{user.name}</span>
          <span className="block text-xs text-muted">{user.role}</span>
        </span>
        <ChevronDown className="h-4 w-4 text-muted" aria-hidden="true" />
      </button>

      <div
        role="menu"
        className={cn(
          'absolute right-0 z-30 mt-2 w-48 origin-top-right rounded-lg border border-border bg-surface py-1 shadow-lg transition-all',
          isOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0',
        )}
      >
        <Link
          to="/profile"
          role="menuitem"
          onClick={() => setIsOpen(false)}
          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background"
        >
          <UserCircle className="h-4 w-4" aria-hidden="true" />
          Profile
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger hover:bg-background"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  )
}
