import { useTranslation } from 'react-i18next'
import { PageMeta } from '@/components/seo/PageMeta'
import { Hero } from '@/features/home/Hero'
import { AboutSection } from '@/features/about/AboutSection'
import { CompanyStats } from '@/features/home/CompanyStats'
import { ServicesPreview } from '@/features/services/ServicesPreview'
import { ProjectsSection } from '@/features/projects/ProjectsSection'
import { BeforeAfterSection } from '@/features/before-after/BeforeAfterSection'
import { GallerySection } from '@/features/gallery/GallerySection'
import { VideoSection } from '@/features/video/VideoSection'
import { TestimonialsSection } from '@/features/testimonials/TestimonialsSection'
import { TrustSection } from '@/features/trust/TrustSection'
import { FaqSection } from '@/features/faq/FaqSection'
import { CtaSection } from '@/features/cta/CtaSection'

export function HomePage() {
  const { t } = useTranslation('seo')

  return (
    <>
      <PageMeta title={t('home.title')} description={t('home.description')} keywords={t('home.keywords')} />
      <Hero />
      <AboutSection />
      <CompanyStats />
      <ServicesPreview />
      <ProjectsSection />
      <BeforeAfterSection />
      <GallerySection />
      <VideoSection />
      <TestimonialsSection />
      <TrustSection />
      <FaqSection />
      <CtaSection />
    </>
  )
}
