import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { CurrentUser } from '../types/models'

const { mockLogin, mockLogout, mockRefresh } = vi.hoisted(() => ({
  mockLogin: vi.fn(),
  mockLogout: vi.fn(),
  mockRefresh: vi.fn(),
}))

vi.mock('../api/auth', () => ({
  login: mockLogin,
  logout: mockLogout,
  refresh: mockRefresh,
}))

import { AuthProvider } from './AuthContext'
import { useAuth } from './useAuth'

function buildUser(): CurrentUser {
  return { id: 'user_1', email: 'admin@av1-company.al', name: 'AV1 Admin', role: 'ADMIN', createdAt: '2026-01-01' }
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthProvider', () => {
  it('starts in a loading state, then falls back to unauthenticated when there is no valid session', async () => {
    mockRefresh.mockRejectedValue(new Error('no session'))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.status).toBe('loading')
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))
    expect(result.current.user).toBeNull()
  })

  it('silently restores the session on boot when the refresh cookie is still valid', async () => {
    mockRefresh.mockResolvedValue({ accessToken: 'token-1', user: buildUser() })

    const { result } = renderHook(() => useAuth(), { wrapper })

    await waitFor(() => expect(result.current.status).toBe('authenticated'))
    expect(result.current.user?.email).toBe('admin@av1-company.al')
  })

  it('login() authenticates the user on success', async () => {
    mockRefresh.mockRejectedValue(new Error('no session'))
    mockLogin.mockResolvedValue({ accessToken: 'token-2', user: buildUser() })

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))

    await act(async () => {
      await result.current.login('admin@av1-company.al', 'ChangeMe123!')
    })

    expect(result.current.status).toBe('authenticated')
    expect(result.current.user?.role).toBe('ADMIN')
  })

  it('login() rejects and leaves the session unauthenticated on invalid credentials', async () => {
    mockRefresh.mockRejectedValue(new Error('no session'))
    mockLogin.mockRejectedValue(new Error('Invalid email or password'))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('unauthenticated'))

    await expect(
      act(async () => {
        await result.current.login('admin@av1-company.al', 'wrong-password')
      }),
    ).rejects.toThrow('Invalid email or password')

    expect(result.current.status).toBe('unauthenticated')
  })

  it('logout() clears the session locally even if the API call fails', async () => {
    mockRefresh.mockResolvedValue({ accessToken: 'token-3', user: buildUser() })
    mockLogout.mockRejectedValue(new Error('network error'))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await waitFor(() => expect(result.current.status).toBe('authenticated'))

    await act(async () => {
      await result.current.logout().catch(() => undefined)
    })

    expect(result.current.status).toBe('unauthenticated')
    expect(result.current.user).toBeNull()
  })
})
