import type { Request, Response } from 'express'
import { prisma } from '../config/database'
import { APP_VERSION, HTTP_STATUS } from '../config/constants'
import { env } from '../config/env'
import { asyncHandler } from '../utils/asyncHandler'
import { logger } from '../utils/logger'

type DatabaseStatus = 'connected' | 'disconnected'

async function pingDatabase(): Promise<DatabaseStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return 'connected'
  } catch (error) {
    logger.error('Health check: database ping failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return 'disconnected'
  }
}

/** GET /health — deliberately outside /api/v1 and unauthenticated, since load
 *  balancers and uptime monitors hit this directly. Not wrapped in the usual
 *  { success, data } envelope: a health check's HTTP status code (200 healthy,
 *  503 degraded) IS the primary signal most monitors key off of. */
export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const database = await pingDatabase()
  const isHealthy = database === 'connected'

  res.status(isHealthy ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE).json({
    status: isHealthy ? 'ok' : 'degraded',
    uptime: process.uptime(),
    environment: env.NODE_ENV,
    version: APP_VERSION,
    database,
    timestamp: new Date().toISOString(),
  })
})
