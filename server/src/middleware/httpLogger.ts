import morgan from 'morgan'
import { logger } from '../utils/logger'

/** HTTP access logging via morgan, routed through the app's own structured
 *  `logger` (JSON in production, readable lines in development) instead of
 *  morgan's default stdout stream, so every log line — HTTP or application —
 *  goes through one consistent path.
 *
 *  Returning `undefined` from the format function tells morgan not to write
 *  to its stream itself; the side-effecting `logger` call is the only output. */
export const httpLogger = morgan((tokens, req, res) => {
  // Built-in tokens (method/url/status/response-time/remote-addr) are always
  // registered by morgan itself, so these calls are safe despite the optional typing.
  const method = tokens.method!(req, res)
  const url = tokens.url!(req, res)
  const status = Number(tokens.status!(req, res) ?? 0)
  const responseTimeMs = Number(tokens['response-time']!(req, res))
  const remoteAddr = tokens['remote-addr']!(req, res)

  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'

  logger[level](`${method} ${url}`, {
    statusCode: status,
    durationMs: Number.isFinite(responseTimeMs) ? Math.round(responseTimeMs * 100) / 100 : undefined,
    ip: remoteAddr,
  })

  return undefined
})
