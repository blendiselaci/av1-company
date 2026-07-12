import { Compass } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { LinkButton } from '@/components/ui/LinkButton'
import { PageMeta } from '@/components/seo/PageMeta'
import { ROUTES } from '@/lib/routes'

export function NotFoundPage() {
  const { t } = useTranslation('common')
  const { t: tSeo } = useTranslation('seo')

  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center gap-6 py-24 text-center">
      <PageMeta title={tSeo('notFound.title')} description={tSeo('notFound.description')} noIndex />

      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-av1-green/10 text-av1-green">
        <Compass size={30} aria-hidden="true" />
      </span>

      <p className="text-sm font-semibold uppercase tracking-widest text-av1-green">404</p>
      <h1 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {t('notFound.title')}
      </h1>
      <p className="max-w-md text-base leading-relaxed text-foreground/70">{t('notFound.message')}</p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
        <LinkButton to={ROUTES.home} variant="primary" size="lg">
          {t('notFound.backHome')}
        </LinkButton>
        <LinkButton to={ROUTES.contact} variant="outline" size="lg">
          {t('notFound.contactUs')}
        </LinkButton>
      </div>
    </Container>
  )
}
