import { createHash, randomBytes } from 'node:crypto'

/** Refresh tokens are high-entropy JWTs already, so a fast SHA-256 digest (rather
 *  than bcrypt) is enough to avoid storing the raw token value in the database. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function generateRandomToken(bytes = 32): string {
  return randomBytes(bytes).toString('hex')
}
