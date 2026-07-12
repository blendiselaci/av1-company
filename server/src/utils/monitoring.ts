import { logger } from './logger'

interface ErrorContext {
  [key: string]: unknown
}

/** Single integration point for a future error-reporting/APM service (Sentry,
 *  Bugsnag, Datadog, ...). Today this only forwards to the structured logger
 *  (see logger.ts — JSON in production, so it's already pipeable to a log
 *  aggregator); swapping in a real provider later means changing this one
 *  function, not every call site that currently reports an unexpected
 *  failure. Deliberately not wired to a real SaaS provider here — that's a
 *  cost/vendor decision for whoever operates this in production, not
 *  something to bake in unasked. */
export function captureException(error: unknown, context?: ErrorContext): void {
  const err = error instanceof Error ? error : new Error(String(error))
  logger.error(err.message, { stack: err.stack, ...context })
}
