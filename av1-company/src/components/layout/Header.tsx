import { useEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, Moon, Sun, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/LinkButton'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { HEADER_NAV_ITEMS, ROUTES } from '@/lib/routes'
import { useDarkMode } from '@/hooks/useDarkMode'
import { useScrolled } from '@/hooks/useScrolled'
import { cn } from '@/lib/utils'
import logo from '@/assets/logo-av1-header.jpg'

export function Header() {
  const { t } = useTranslation()
  const { isDark, toggle } = useDarkMode()
  const { pathname } = useLocation()
  const isHome = pathname === ROUTES.home
  const scrolled = useScrolled(40)
  const transparent = isHome && !scrolled
  const shouldReduceMotion = useReducedMotion()

  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  // Close the mobile menu on browser back/forward navigation (in-menu link clicks already call closeMenu()).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isOpen) return

    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  function closeMenu() {
    setIsOpen(false)
    menuButtonRef.current?.focus()
  }

  const mobileMenuBody = (
    <>
      <Container className="flex h-20 shrink-0 items-center justify-between">
        <span className="text-lg font-bold tracking-tight">AV1-Company</span>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMenu}
          aria-label={t('header.closeMenu')}
          className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={24} />
        </button>
      </Container>

      <nav className="flex flex-1 flex-col items-start justify-center gap-1 px-8">
        {HEADER_NAV_ITEMS.map((item, index) => (
          <motion.div
            key={item.path}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: shouldReduceMotion ? 0 : 0.15 + index * 0.06, duration: shouldReduceMotion ? 0.01 : 0.4 }}
          >
            <NavLink
              to={item.path}
              end={item.path === ROUTES.home}
              onClick={closeMenu}
              className={({ isActive }) =>
                cn(
                  'block py-3 text-3xl font-semibold tracking-tight transition-colors',
                  isActive ? 'text-av1-green-light' : 'text-white hover:text-av1-green-light',
                )
              }
            >
              {t(item.labelKey)}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <Container className="flex shrink-0 flex-col gap-6 pb-10">
        <div className="flex items-center gap-6">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggle}
            aria-label={t('header.toggleTheme')}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        <LinkButton to={ROUTES.contact} variant="primary" size="lg" onClick={closeMenu} className="w-full">
          {t('header.ctaContact')}
        </LinkButton>
      </Container>
    </>
  )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 h-20 transition-colors duration-300',
        transparent ? 'bg-transparent' : 'bg-av1-dark/95 shadow-[0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md',
      )}
    >
      <Container className="flex h-full items-center justify-between">
        <NavLink to={ROUTES.home} className="flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10 rounded-full object-cover" />
          <span className="text-lg font-bold tracking-tight text-white">AV1-Company</span>
        </NavLink>

        <nav className="hidden items-center gap-8 lg:flex">
          {HEADER_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === ROUTES.home}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium tracking-wide transition-colors',
                  isActive ? 'text-white' : 'text-white/70 hover:text-white',
                )
              }
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggle}
            aria-label={t('header.toggleTheme')}
            className="rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <LinkButton to={ROUTES.contact} variant="primary" size="sm">
            {t('header.ctaContact')}
          </LinkButton>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label={t('header.openMenu')}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
        >
          <Menu size={24} />
        </button>
      </Container>

      {shouldReduceMotion ? (
        isOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('header.openMenu')}
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-av1-dark text-white lg:hidden"
          >
            {mobileMenuBody}
          </div>
        )
      ) : (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t('header.openMenu')}
              className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-av1-dark text-white lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {mobileMenuBody}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </header>
  )
}
