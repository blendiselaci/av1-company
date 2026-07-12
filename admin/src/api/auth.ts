import { apiClient } from './client'
import type { ApiSuccess } from '../types/api'
import type { CurrentUser } from '../types/models'

interface TokenResponse {
  accessToken: string
  user: CurrentUser
}

export async function login(email: string, password: string): Promise<TokenResponse> {
  const response = await apiClient.post<ApiSuccess<TokenResponse>>('/auth/login', { email, password })
  return response.data.data
}

export async function refresh(): Promise<TokenResponse> {
  const response = await apiClient.post<ApiSuccess<TokenResponse>>('/auth/refresh')
  return response.data.data
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout')
}
