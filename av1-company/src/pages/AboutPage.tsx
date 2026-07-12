import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { OurStorySection } from '@/features/about/OurStorySection'
import { MissionVisionSection } from '@/features/about/MissionVisionSection'
import { ValuesSection } from '@/features/about/ValuesSection'
import { TrustSection } from '@/features/trust/TrustSection'
import { CompanyStats } from '@/features/home/CompanyStats'
import { CtaSection } from '@/features/cta/CtaSection'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

export function AboutPage() {
  const { t } = useTranslation('about')
  const { t: tSeo } = useTranslation('seo')
  const { t: tNav } = useTranslation()

  return (
    <>
      <PageMeta title={tSeo('about.title')} description={tSeo('about.description')} keywords={tSeo('about.keywords')} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: tNav('nav.home'), path: ROUTES.home },
          { name: tNav('nav.about'), path: ROUTES.about },
        ])}
      />

      <section className="bg-background py-16 sm:py-24">
        <Container>
          <SectionHeading as="h1" eyebrow={t('intro.eyebrow')} title={t('intro.title')} subtitle={t('intro.lead')} />
        </Container>
      </section>

      <OurStorySection />
      <MissionVisionSection />
      <ValuesSection />
      <TrustSection />
      <CompanyStats />
      <CtaSection />
    </>
  )
}
