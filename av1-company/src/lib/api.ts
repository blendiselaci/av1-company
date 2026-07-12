export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1'

interface ApiSuccess<T> {
  success: true
  data: T
}

interface ApiErrorBody {
  success: false
  message: string
  errors?: unknown
}

/** Thrown by apiGet/apiPost on a non-2xx response — carries the API's own
 *  `message` (falls back to the HTTP status) so callers can show it directly
 *  instead of a generic "something went wrong". */
export class ApiRequestError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiRequestError'
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody
    return body.message || `Request failed with status ${response.status}`
  } catch {
    return `Request failed with status ${response.status}`
  }
}

/** Minimal read-only fetch helper for pulling published content from the
 *  CMS API. This site is otherwise a static build — this is intentionally a
 *  plain `fetch` wrapper, not a full client library, since public pages only
 *  ever need GET requests for already-published content. */
export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`)
  if (!response.ok) {
    throw new ApiRequestError(await parseErrorMessage(response), response.status)
  }
  const body = (await response.json()) as ApiSuccess<T>
  return body.data
}

/** Same shape as apiGet, for the one write path this static site has: the
 *  public contact form (POST /contact-messages). */
export async function apiPost<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    throw new ApiRequestError(await parseErrorMessage(response), response.status)
  }
  const body = (await response.json()) as ApiSuccess<T>
  return body.data
}
