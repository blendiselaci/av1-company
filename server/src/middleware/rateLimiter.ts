import rateLimit from 'express-rate-limit'
import { env } from '../config/env'
import { sendError } from '../utils/apiResponse'

/** Applied to the whole API. */
export const generalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'Too many requests — please try again later')
  },
})

/** Applied only to auth endpoints (login, refresh) to slow down credential
 *  stuffing / brute-force attempts without punishing normal API traffic. */
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (_req, res) => {
    sendError(res, 429, 'Too many attempts — please try again later')
  },
})

/** Applied to the public contact-form submission endpoint to deter spam. */
export const contactFormRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    sendError(res, 429, 'Too many messages sent — please try again later')
  },
})
