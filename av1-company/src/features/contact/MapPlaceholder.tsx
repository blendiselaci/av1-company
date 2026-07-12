import { MapPin, ExternalLink } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

interface MapPlaceholderProps {
  addressLabel: string
  address: string
  buttonLabel: string
}

export function MapPlaceholder({ addressLabel, address, buttonLabel }: MapPlaceholderProps) {
  const shouldReduceMotion = useReducedMotion()
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: shouldReduceMotion ? 0.01 : 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-2xl border border-foreground/10"
    >
      <div
        aria-hidden="true"
        className="relative flex h-72 w-full items-center justify-center bg-[linear-gradient(160deg,#2a5736_0%,#1c1d1f_100%)] bg-[length:100%_100%] sm:h-80"
        style={{
          backgroundImage:
            'linear-gradient(160deg,#2a5736 0%,#1c1d1f 100%), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 40px)',
          backgroundBlendMode: 'overlay',
        }}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-av1-green shadow-lg">
          <MapPin size={26} aria-hidden="true" />
        </span>
      </div>

      <div className="flex flex-col gap-4 border-t border-foreground/10 bg-foreground/[0.03] p-6 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-foreground/70">{addressLabel}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{address}</p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-av1-green px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-av1-green-dark"
        >
          {buttonLabel}
          <ExternalLink size={16} aria-hidden="true" />
        </a>
      </div>
    </motion.div>
  )
}
