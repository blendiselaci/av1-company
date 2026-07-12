import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default('/api/v1'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(16, 'JWT_ACCESS_SECRET must be at least 16 characters'),
  JWT_REFRESH_SECRET: z.string().min(16, 'JWT_REFRESH_SECRET must be at least 16 characters'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),
  COOKIE_SECRET: z.string().min(16, 'COOKIE_SECRET must be at least 16 characters'),

  CORS_ORIGIN: z.string().default('http://localhost:5173'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),

  CLOUDINARY_CLOUD_NAME: z.string().default('av1-company-placeholder'),
  CLOUDINARY_API_KEY: z.string().default('placeholder-api-key'),
  CLOUDINARY_API_SECRET: z.string().default('placeholder-api-secret'),
  CLOUDINARY_UPLOAD_FOLDER: z.string().default('av1-company'),

  // Email notifications (contact form submissions). 'none' (default) just logs —
  // see src/services/email.service.ts. Provider credentials are all optional
  // and only read once EMAIL_PROVIDER selects that provider.
  EMAIL_PROVIDER: z.enum(['none', 'resend', 'smtp']).default('none'),
  EMAIL_FROM: z.string().default('AV1-Company <no-reply@av1-company.al>'),
  EMAIL_NOTIFY_TO: z.string().default('info@av1-company.al'),
  RESEND_API_KEY: z.string().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),

  SEED_ADMIN_EMAIL: z.string().email().default('admin@av1-company.al'),
  SEED_ADMIN_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  SEED_ADMIN_NAME: z.string().default('AV1 Admin'),

  SEED_EDITOR_EMAIL: z.string().email().default('editor@av1-company.al'),
  SEED_EDITOR_PASSWORD: z.string().min(8).default('ChangeMe123!'),
  SEED_EDITOR_NAME: z.string().default('AV1 Editor'),
})

type EnvShape = z.infer<typeof envSchema>

/** Every placeholder secret ever shipped in a committed `.env*.example` file.
 *  Passing the Zod min-length check isn't enough — these are all well over 16
 *  characters, so this is the actual guardrail against deploying with a
 *  secret that's effectively public (it's sitting in the repo). */
const PLACEHOLDER_SECRETS = new Set([
  'replace-with-a-long-random-access-token-secret',
  'replace-with-a-long-random-refresh-token-secret',
  'replace-with-a-long-random-cookie-secret',
  '__REPLACE_WITH_A_REAL_64_BYTE_RANDOM_SECRET__',
  '__REPLACE_WITH_A_DIFFERENT_REAL_64_BYTE_RANDOM_SECRET__',
  '__REPLACE_WITH_A_THIRD_REAL_64_BYTE_RANDOM_SECRET__',
])

/** Fails fast on the one class of mistake that's easy to make and expensive to
 *  discover later: deploying to production with a secret copy-pasted straight
 *  out of an example file. Development/test are unaffected. */
function assertProductionSafety(parsed: EnvShape): void {
  if (parsed.NODE_ENV !== 'production') return

  const unsafe = (
    [
      ['JWT_ACCESS_SECRET', parsed.JWT_ACCESS_SECRET],
      ['JWT_REFRESH_SECRET', parsed.JWT_REFRESH_SECRET],
      ['COOKIE_SECRET', parsed.COOKIE_SECRET],
    ] as const
  ).filter(([, value]) => PLACEHOLDER_SECRETS.has(value))

  if (unsafe.length > 0) {
    const names = unsafe.map(([name]) => name).join(', ')
    throw new Error(
      `Refusing to start with NODE_ENV=production using placeholder secret(s): ${names}. ` +
        'Generate real random values (e.g. `openssl rand -hex 64`) — see .env.production.example.',
    )
  }

  if (parsed.CORS_ORIGIN.includes('localhost')) {
    console.warn('⚠️  CORS_ORIGIN includes "localhost" while NODE_ENV=production — is this intentional?')
  }
}

function loadEnv(): EnvShape {
  const parsed = envSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:')
    console.error(parsed.error.flatten().fieldErrors)
    throw new Error('Invalid environment variables — see errors above')
  }

  assertProductionSafety(parsed.data)

  return parsed.data
}

export const env = loadEnv()

export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'

export const corsOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
