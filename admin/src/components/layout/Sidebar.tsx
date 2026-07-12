import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { NAV_ITEMS } from '../../lib/navigation'
import { useAuth } from '../../auth/useAuth'
import { cn } from '../../lib/utils'

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth()

  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4" aria-label="Main navigation">
      {NAV_ITEMS.filter((item) => !item.allow || (user && item.allow.includes(user.role))).map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-brand text-brand-foreground' : 'text-foreground hover:bg-background',
            )
          }
        >
          <item.icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

function SidebarBrand({ trailing }: { trailing?: ReactNode }) {
  return (
    <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand text-sm font-bold text-brand-foreground">
          A
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">AV1-Company</p>
          <p className="text-xs text-muted">Admin</p>
        </div>
      </div>
      {trailing}
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <SidebarBrand />
      <NavList />
    </aside>
  )
}

export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="absolute inset-y-0 left-0 flex w-64 flex-col bg-surface shadow-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <SidebarBrand
              trailing={
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded p-1.5 text-muted hover:bg-background hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              }
            />
            <NavList onNavigate={onClose} />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  )
}
