import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EmptyState } from '@/components/ui/EmptyState'
import { PageLoader } from '@/components/layout/PageLoader'
import { FaqItem } from '@/features/faq/FaqItem'
import { useFaqItems } from '@/features/faq/useFaqItems'

export function FaqSection() {
  const { t } = useTranslation('faq')
  const shouldReduceMotion = useReducedMotion()
  const { items, isLoading, isError, retry } = useFaqItems()
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <section className="border-t border-foreground/5 bg-background py-24 sm:py-32">
      <Container>
        <SectionHeading eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

        {isLoading ? (
          <PageLoader />
        ) : isError ? (
          <div className="mx-auto mt-14 max-w-3xl">
            <EmptyState title={t('error.title')} message={t('error.message')} retryLabel={t('error.retry')} onRetry={retry} />
          </div>
        ) : items.length > 0 ? (
          <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-4">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{
                  duration: shouldReduceMotion ? 0.01 : 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.06,
                }}
              >
                <FaqItem
                  item={item}
                  isOpen={(openId ?? items[0]?.id) === item.id}
                  onToggle={() => setOpenId((current) => (current === item.id ? null : item.id))}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-3xl">
            <EmptyState title={t('empty.title')} message={t('empty.message')} />
          </div>
        )}
      </Container>
    </section>
  )
}
