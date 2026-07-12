import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { setAccessToken } from '../api/tokenStore'
import { setSessionExpiredHandler } from '../api/client'
import type { CurrentUser } from '../types/models'
import { AuthContext, type AuthStatus } from './authContextInstance'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  const clearSession = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(clearSession)
    return () => setSessionExpiredHandler(null)
  }, [clearSession])

  // On boot, the access token is gone (it only ever lived in memory) but the
  // httpOnly refresh cookie may still be valid — try a silent refresh before
  // falling back to the login screen.
  useEffect(() => {
    let cancelled = false
    authApi
      .refresh()
      .then(({ accessToken, user: refreshedUser }) => {
        if (cancelled) return
        setAccessToken(accessToken)
        setUser(refreshedUser)
        setStatus('authenticated')
      })
      .catch(() => {
        if (!cancelled) clearSession()
      })
    return () => {
      cancelled = true
    }
  }, [clearSession])

  const login = useCallback(async (email: string, password: string) => {
    const { accessToken, user: loggedInUser } = await authApi.login(email, password)
    setAccessToken(accessToken)
    setUser(loggedInUser)
    setStatus('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearSession()
    }
  }, [clearSession])

  const value = useMemo(() => ({ user, status, login, logout }), [user, status, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
