import { env } from '../config/env'
import { logger } from '../utils/logger'
import type { ContactNotificationInput } from './email.service'

const TELEGRAM_API_BASE = 'https://api.telegram.org'

/** Instant contact-form notification via Telegram Bot API — the simplest
 *  reliable "ping my phone" channel: no SMTP relay or domain verification,
 *  just a bot token and a chat id (see README for setup: message @BotFather
 *  to create a bot, then message @userinfobot to get your numeric chat id).
 *  Both `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` must be set or this just
 *  logs instead — mirrors the EMAIL_PROVIDER=none fallback in email.service.ts. */
export async function sendTelegramNotification(input: ContactNotificationInput): Promise<void> {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    logger.info('Telegram notification skipped (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured)')
    return
  }

  const lines = [
    '📩 New contact form submission',
    `Name: ${input.firstName} ${input.lastName}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : undefined,
    input.service ? `Interested in: ${input.service}` : undefined,
    '',
    input.message,
  ].filter((line): line is string => line !== undefined)

  const url = `${TELEGRAM_API_BASE}/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: lines.join('\n') }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Telegram API responded with ${response.status}: ${body}`)
  }
}
