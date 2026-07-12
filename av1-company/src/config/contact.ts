import { COMPANY_INFO } from '@/lib/seo'

/** WhatsApp click-to-chat config. `VITE_WHATSAPP_NUMBER` overrides the
 *  default company phone (see lib/seo.ts) — set it if WhatsApp support runs
 *  through a different line. wa.me needs digits only (country code first,
 *  no leading '+', no spaces): https://faq.whatsapp.com/general/chats/how-to-use-click-to-chat */
const rawNumber = (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? COMPANY_INFO.phone
export const WHATSAPP_NUMBER = rawNumber.replace(/[^\d]/g, '')

export function buildWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
