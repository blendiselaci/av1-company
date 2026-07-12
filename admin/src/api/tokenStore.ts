/** Access token lives in memory only — never localStorage/sessionStorage, so it
 *  isn't reachable by an XSS payload. The refresh token never touches JS at all
 *  (httpOnly cookie set by the API); losing the in-memory token on a hard reload
 *  is expected and recovered via a silent POST /auth/refresh on app boot. */
let accessToken: string | null = null

export function getAccessToken(): string | null {
  return accessToken
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}
