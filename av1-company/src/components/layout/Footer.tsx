import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, Phone } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { FacebookIcon } from '@/components/icons/FacebookIcon'
import { NAV_ITEMS, ROUTES } from '@/lib/routes'
import { COMPANY_INFO, SOCIAL_LINKS } from '@/lib/seo'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  const facebookUrl = SOCIAL_LINKS[0]

  return (
    <footer className="border-t border-foreground/10 bg-background">
      <Container className="py-12">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <span className="text-lg font-bold tracking-tight text-foreground">AV1-Company</span>
            <p className="mt-3 text-sm text-foreground/70">{t('footer.tagline')}</p>

            <div className="mt-5 flex flex-col gap-2.5">
              <a
                href={`tel:${COMPANY_INFO.phone}`}
                className="flex items-center gap-2.5 text-sm text-foreground/70 transition-colors hover:text-av1-green"
              >
                <Phone size={16} aria-hidden="true" />
                {COMPANY_INFO.phoneDisplay}
              </a>
              <a
                href={`mailto:${COMPANY_INFO.email}`}
                className="flex items-center gap-2.5 text-sm text-foreground/70 transition-colors hover:text-av1-green"
              >
                <Mail size={16} aria-hidden="true" />
                {COMPANY_INFO.email}
              </a>
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-sm text-foreground/70 transition-colors hover:text-av1-green"
                >
                  <FacebookIcon size={16} />
                  Facebook
                </a>
              )}
            </div>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-av1-green"
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-foreground/10 pt-6 text-sm text-foreground/70 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} AV1-Company. {t('footer.rights')}
          </p>
          <NavLink to={ROUTES.privacy} className="font-medium transition-colors hover:text-av1-green">
            {t('footer.privacyLink')}
          </NavLink>
        </div>
      </Container>
    </footer>
  )
}
