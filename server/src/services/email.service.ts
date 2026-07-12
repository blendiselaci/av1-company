import { env } from '../config/env'
import { logger } from '../utils/logger'

export interface EmailMessage {
  to: string
  from: string
  subject: string
  text: string
}

/** Single integration point for outbound email (today: just the contact-form
 *  admin notification). `EMAIL_PROVIDER=none` (the default) logs instead of
 *  sending — no credentials are configured anywhere in this repo, matching
 *  how Cloudinary ships with placeholder values until a real account exists.
 *  Wiring up Resend or SMTP later means implementing the two branches below
 *  and setting `EMAIL_PROVIDER` + that provider's env vars — every caller of
 *  `sendEmail` stays unchanged. See src/utils/monitoring.ts for the same
 *  pattern applied to error reporting. */
async function sendEmail(message: EmailMessage): Promise<void> {
  switch (env.EMAIL_PROVIDER) {
    case 'resend':
      // TODO: const { Resend } = await import('resend'); await new Resend(env.RESEND_API_KEY).emails.send({...})
      logger.warn('EMAIL_PROVIDER=resend but sending is not yet implemented — logging instead', { to: message.to })
      break
    case 'smtp':
      // TODO: const nodemailer = await import('nodemailer'); await nodemailer.createTransport({ host: env.SMTP_HOST, ... }).sendMail({...})
      logger.warn('EMAIL_PROVIDER=smtp but sending is not yet implemented — logging instead', { to: message.to })
      break
    case 'none':
    default:
      break
  }

  logger.info('Email notification (not actually sent — configure EMAIL_PROVIDER)', {
    to: message.to,
    from: message.from,
    subject: message.subject,
  })
}

export interface ContactNotificationInput {
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  service?: string | null
  message: string
}

/** Notifies the team inbox of a new contact-form submission. Deliberately
 *  fire-and-forget from the caller's perspective (see contact.service.ts) —
 *  a broken/unconfigured email provider must never fail the actual form
 *  submission, which is already durably stored in the database by the time
 *  this runs. */
export async function sendContactNotification(input: ContactNotificationInput): Promise<void> {
  const lines = [
    `New contact form submission from ${input.firstName} ${input.lastName}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : undefined,
    input.service ? `Interested in: ${input.service}` : undefined,
    '',
    input.message,
  ].filter((line): line is string => line !== undefined)

  await sendEmail({
    to: env.EMAIL_NOTIFY_TO,
    from: env.EMAIL_FROM,
    subject: `New inquiry from ${input.firstName} ${input.lastName}`,
    text: lines.join('\n'),
  })
}
