import { useTranslation } from 'react-i18next'
import { PageMeta } from '@/components/seo/PageMeta'
import { JsonLd } from '@/components/seo/JsonLd'
import { ContactSection } from '@/features/contact/ContactSection'
import { ROUTES } from '@/lib/routes'
import { buildBreadcrumbSchema } from '@/lib/structuredData'

export function ContactPage() {
  const { t } = useTranslation('seo')
  const { t: tNav } = useTranslation()

  return (
    <>
      <PageMeta title={t('contact.title')} description={t('contact.description')} keywords={t('contact.keywords')} />
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: tNav('nav.home'), path: ROUTES.home },
          { name: tNav('nav.contact'), path: ROUTES.contact },
        ])}
      />
      <ContactSection />
    </>
  )
}
