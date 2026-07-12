import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Fixed, non-environment-specific application constants. Anything that varies
 *  per deployment (secrets, connection strings, tunables) belongs in `env.ts`
 *  instead — this file is for values that are the same everywhere. */

interface PackageJson {
  name: string
  version: string
}

function readPackageJson(): PackageJson {
  // Reading from disk at runtime (rather than a static `import`) keeps
  // package.json — which lives outside src/ — out of the TypeScript build's
  // rootDir, and works identically whether run via tsx or the compiled dist/.
  const packageJsonPath = join(__dirname, '../../package.json')
  const raw = readFileSync(packageJsonPath, 'utf-8')
  return JSON.parse(raw) as PackageJson
}

const packageJson = readPackageJson()

export const APP_NAME = packageJson.name
export const APP_VERSION = packageJson.version

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const

export const REFRESH_COOKIE_NAME = 'refreshToken'
