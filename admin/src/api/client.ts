import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { getAccessToken, setAccessToken } from './tokenStore'

export const API_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:4000/api/v1'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

/** Fired once when a silent refresh definitively fails (no valid session) — the
 *  AuthProvider subscribes to this to clear its state and redirect to /login,
 *  without api/client.ts needing to know anything about React or routing. */
type SessionExpiredHandler = () => void
let onSessionExpired: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  onSessionExpired = handler
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ success: true; data: { accessToken: string } }>(
      `${API_URL}/auth/refresh`,
      undefined,
      { withCredentials: true },
    )
    const token = response.data.data.accessToken
    setAccessToken(token)
    return token
  } catch {
    setAccessToken(null)
    return null
  }
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetryableConfig | undefined
    const status = error.response?.status
    const isAuthEndpoint = config?.url?.includes('/auth/login') || config?.url?.includes('/auth/refresh')

    if (status !== 401 || !config || config._retried || isAuthEndpoint) {
      throw error
    }

    config._retried = true
    refreshPromise ??= refreshAccessToken().finally(() => {
      refreshPromise = null
    })

    const newToken = await refreshPromise
    if (!newToken) {
      onSessionExpired?.()
      throw error
    }

    config.headers.set('Authorization', `Bearer ${newToken}`)
    return apiClient(config)
  },
)
