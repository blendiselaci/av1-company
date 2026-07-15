import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { FacebookIcon } from '@/components/icons/FacebookIcon'

const CONTACT_ICONS: Record<string, LucideIcon> = {
  phone: Phone,
  email: Mail,
  location: MapPin,
  hours: Clock,
}

interface ContactCard {
  id: string
  label: string
  value: string
  href?: string
}

interface ContactInfoProps {
  title: string
  description: string
  cards: ContactCard[]
}

export function ContactInfo({ title, description, cards }: ContactInfoProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div>
      <h3 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{title}</h3>
      <p className="mt-4 text-base leading-relaxed text-foreground/70">{description}</p>

      <address className="mt-10 grid grid-cols-1 gap-4 not-italic sm:grid-cols-2">
        {cards.map((card, index) => {
          const Icon = CONTACT_ICONS[card.id] ?? Phone
          const content = (
            <>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-av1-green/10 text-av1-green">
                {card.id === 'facebook' ? <FacebookIcon size={20} /> : <Icon size={20} aria-hidden="true" />}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">{card.label}</p>
                <p className="mt-1 truncate text-sm font-medium text-foreground">{card.value}</p>
              </div>
            </>
          )

          const className =
            'flex items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.03] p-5 backdrop-blur-sm transition-colors duration-200 hover:border-av1-green/40'

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.5, delay: shouldReduceMotion ? 0 : index * 0.08 }}
            >
              {card.href ? (
                <a
                  href={card.href}
                  className={className}
                  {...(card.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {content}
                </a>
              ) : (
                <div className={className}>{content}</div>
              )}
            </motion.div>
          )
        })}
      </address>
    </div>
  )
}
