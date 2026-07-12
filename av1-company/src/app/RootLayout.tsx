import { Suspense, useEffect, useMemo } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { PageLoader } from '@/components/layout/PageLoader'
import { ScrollToTopButton } from '@/components/layout/ScrollToTopButton'
import { WhatsAppButton } from '@/components/common/WhatsAppButton'
import { ScrollProgressBar } from '@/components/ui/ScrollProgressBar'
import { JsonLd } from '@/components/seo/JsonLd'
import { trackPageView } from '@/lib/analytics'
import { ROUTES } from '@/lib/routes'
import { cn } from '@/lib/utils'
import { buildLocalBusinessSchema, buildOrganizationSchema, buildWebsiteSchema } from '@/lib/structuredData'

export function RootLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const isHome = location.pathname === ROUTES.home
  const shouldReduceMotion = useReducedMotion()
  const element = useOutlet()

  // Organization/LocalBusiness/WebSite identity holds for every page, so it's rendered
  // once here rather than duplicated per route.
  const organizationSchema = useMemo(() => buildOrganizationSchema(), [])
  const localBusinessSchema = useMemo(() => buildLocalBusinessSchema(), [])
  const websiteSchema = useMemo(() => buildWebsiteSchema(), [])

  useEffect(() => {
    window.scrollTo({ top: 0 })
    trackPageView(location.pathname)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <JsonLd data={organizationSchema} />
      <JsonLd data={localBusinessSchema} />
      <JsonLd data={websiteSchema} />

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-av1-green focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        {t('header.skipToContent')}
      </a>

      <ScrollProgressBar />
      <Header />

      <main id="main-content" className={cn('flex-1', !isHome && 'pt-20')}>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {element}
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>

      <Footer />
      <ScrollToTopButton />
      <WhatsAppButton />
    </div>
  )
}
