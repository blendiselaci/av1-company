import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

interface PrivacySection {
  id: string
  heading: string
  body: string
}

export function PrivacyPolicyPage() {
  const { t } = useTranslation('privacy')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()
  const sections = t('sections', { returnObjects: true }) as PrivacySection[]

  return (
    <Container className="py-16 sm:py-24">
      <PageMeta title={tSeo('privacy.title')} description={tSeo('privacy.description')} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: tNav('nav.home'), path: ROUTES.home },
          { name: tNav('footer.privacyLink'), path: ROUTES.privacy },
        ])}
      />

      <SectionHeading as="h1" align="left" eyebrow={t('eyebrow')} title={t('title')} />

      <article className="mx-auto mt-10 max-w-3xl">
        <p className="text-sm font-medium text-foreground/70">{t('lastUpdated')}</p>
        <p className="mt-6 text-base leading-relaxed text-foreground/70">{t('intro')}</p>

        <div className="mt-12 flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.id} aria-labelledby={section.id}>
              <h2 id={section.id} className="text-xl font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>
              <p className="mt-3 text-base leading-relaxed text-foreground/70">{section.body}</p>
            </section>
          ))}
        </div>
      </article>
    </Container>
  )
}
