const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
}

/** Parses simple duration strings like "15m", "30d", "12h" into milliseconds.
 *  Used to keep the refresh-token cookie's maxAge in sync with JWT_REFRESH_EXPIRES_IN. */
export function parseDurationToMs(value: string): number {
  const match = /^(\d+)\s*([smhd])$/.exec(value.trim())
  if (!match) {
    throw new Error(`Invalid duration string: "${value}" (expected e.g. "15m", "30d")`)
  }
  const amount = Number(match[1])
  const unit = match[2]!
  return amount * UNIT_TO_MS[unit]!
}
