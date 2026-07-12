import { motion, useReducedMotion } from 'framer-motion'
import { Eye, Target } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Container } from '@/components/ui/Container'

export function MissionVisionSection() {
  const { t } = useTranslation('about')
  const shouldReduceMotion = useReducedMotion()

  const cards = [
    { id: 'mission', icon: Target, title: t('mission.title'), description: t('mission.description') },
    { id: 'vision', icon: Eye, title: t('vision.title'), description: t('vision.description') },
  ]

  return (
    <section className="border-t border-foreground/5 bg-background py-20 sm:py-24">
      <Container>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {cards.map(({ id, icon: Icon, title, description }, index) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : index * 0.1 }}
              className="rounded-2xl border border-foreground/10 bg-foreground/[0.02] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-av1-green/30 hover:shadow-lg hover:shadow-black/5"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-av1-green/10 text-av1-green">
                <Icon size={24} aria-hidden="true" />
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-foreground/70">{description}</p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  )
}
