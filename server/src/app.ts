import express from 'express'
import type { Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import { env, corsOrigins } from './config/env'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFound'
import { httpLogger } from './middleware/httpLogger'
import { generalRateLimiter } from './middleware/rateLimiter'
import { getHealth } from './controllers/health.controller'
import routes from './routes'

export function createApp(): Express {
  const app = express()

  // Behind a reverse proxy (nginx, a PaaS load balancer, ...) in production, so
  // req.ip and rate limiting see the real client IP from X-Forwarded-For.
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: corsOrigins,
      credentials: true,
    }),
  )
  app.use(compression())
  app.use(cookieParser(env.COOKIE_SECRET))
  app.use(express.json({ limit: '2mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(httpLogger)

  app.get('/health', getHealth)

  app.use(env.API_PREFIX, generalRateLimiter, routes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
