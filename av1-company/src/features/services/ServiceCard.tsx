import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Droplet, Droplets, Fence, Layers, Mountain, Sprout, TreePine, TrendingUp, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { LazyImage } from '@/components/ui/LazyImage'
import { LinkButton } from '@/components/ui/LinkButton'
import { serviceDetailRoute } from '@/lib/routes'
import type { ServiceItem } from '@/types'

const SERVICE_ICONS: Record<string, LucideIcon> = {
  yards: TreePine,
  fences: Fence,
  pools: Waves,
  stairs: TrendingUp,
  fountains: Droplets,
  walls: Layers,
  'stone-walls': Mountain,
  basin: Droplet,
  grass: Sprout,
  drainage: Droplet,
}

interface ServiceCardProps {
  service: ServiceItem
  ctaLabel: string
  index: number
}

export function ServiceCard({ service, ctaLabel, index }: ServiceCardProps) {
  const shouldReduceMotion = useReducedMotion()
  const [errored, setErrored] = useState(false)
  const Icon = SERVICE_ICONS[service.icon] ?? TreePine

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.6, delay: shouldReduceMotion ? 0 : index * 0.08 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-foreground/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)]">
        {service.image && !errored ? (
          <LazyImage
            src={service.image}
            alt={service.title}
            onError={() => setErrored(true)}
            imgClassName="group-hover:scale-110"
          />
        ) : (
          <Icon
            className="absolute inset-0 m-auto h-16 w-16 text-white/20 transition-transform duration-500 group-hover:scale-110"
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold tracking-tight text-foreground">{service.title}</h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-foreground/70">{service.description}</p>
        <LinkButton to={serviceDetailRoute(service.slug)} variant="outline" size="sm" className="mt-6 gap-2 self-start">
          {ctaLabel}
          <ArrowRight size={16} />
        </LinkButton>
      </div>
    </motion.div>
  )
}
