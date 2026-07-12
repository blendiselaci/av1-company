import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { buildWhatsAppUrl } from '@/config/contact'

/** WhatsApp's own glyph (simple-icons "whatsapp" path) — the recognizable
 *  brand mark, not a generic chat-bubble icon. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  )
}

/** Global floating "chat on WhatsApp" CTA, mounted once in RootLayout so it
 *  persists across every public route. See ScrollToTopButton (mounted
 *  alongside it) — its bottom offset was raised to sit above this button
 *  instead of overlapping it. */
export function WhatsAppButton() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const label = t('whatsapp.label')
  const href = buildWhatsAppUrl(t('whatsapp.message'))

  return (
    <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
      {!shouldReduceMotion && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[#25D366]"
          animate={{ scale: [1, 1.5, 1], opacity: [0.55, 0, 0.55] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        />
      )}

      <motion.a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        title={label}
        initial={{ opacity: 0, scale: 0.6, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 0.5,
          delay: shouldReduceMotion ? 0 : 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex h-14 w-14 items-center justify-center gap-3 rounded-full bg-[#075E54] text-white shadow-2xl shadow-black/30 transition-colors hover:bg-[#0A6E62] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 sm:w-auto sm:justify-start sm:px-5"
      >
        <WhatsAppIcon className="h-7 w-7 shrink-0 text-[#25D366]" />
        <span className="hidden whitespace-nowrap text-sm font-semibold sm:inline">{label}</span>
      </motion.a>
    </div>
  )
}
