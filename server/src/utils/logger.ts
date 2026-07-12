import { isProduction } from '../config/env'

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

function timestamp(): string {
  return new Date().toISOString()
}

function write(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  const line = { timestamp: timestamp(), level, message, ...meta }

  if (isProduction) {
    // Structured JSON in production so it's easy to ship to a log aggregator later.
    const serialized = JSON.stringify(line)
    if (level === 'error') console.error(serialized)
    else console.log(serialized)
    return
  }

  // Human-readable in development.
  const metaSuffix = meta && Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  const formatted = `[${timestamp()}] ${level.toUpperCase()} ${message}${metaSuffix}`
  if (level === 'error') console.error(formatted)
  else if (level === 'warn') console.warn(formatted)
  else console.log(formatted)
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => write('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => write('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => write('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => {
    if (!isProduction) write('debug', message, meta)
  },
}
