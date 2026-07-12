import { createApp } from './app'
import { env } from './config/env'
import { connectDatabase, disconnectDatabase } from './config/database'
import { logger } from './utils/logger'
import { captureException } from './utils/monitoring'

// A promise rejection or exception outside Express's request cycle (a bad
// timer callback, an unawaited promise somewhere) doesn't crash the process
// on its own — it's left running in a state Node explicitly warns isn't
// safe to trust. Report it through the same hook as request-cycle errors,
// then exit; whatever's supervising the process (Docker, Railway/Render,
// systemd) is expected to restart it.
process.on('uncaughtException', (error) => {
  captureException(error, { type: 'uncaughtException' })
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  captureException(reason, { type: 'unhandledRejection' })
  process.exit(1)
})

async function main(): Promise<void> {
  await connectDatabase()
  logger.info('Database connected')

  const app = createApp()
  const server = app.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT}`, { env: env.NODE_ENV, apiPrefix: env.API_PREFIX })
  })

  async function shutdown(signal: string): Promise<void> {
    logger.info(`Received ${signal} — shutting down gracefully`)
    server.close(async () => {
      await disconnectDatabase()
      logger.info('Shutdown complete')
      process.exit(0)
    })

    // Force-exit if graceful shutdown hangs.
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10_000).unref()
  }

  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
}

main().catch((error: unknown) => {
  logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) })
  process.exit(1)
})
