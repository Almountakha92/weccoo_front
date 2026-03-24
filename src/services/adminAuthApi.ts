import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto } from '../dto'
import type { AdminLoginRequestDto, AdminLoginResponseDto, AdminMfaConfirmRequestDto } from '../dto'

const requestJson = async <TResponse>(path: string, payload: unknown): Promise<ApiResponseDto<TResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as ApiResponseDto<TResponse>
    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion au serveur.')
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw new Error(`Serveur backend inaccessible (${API_BASE_URL}). Vérifie que le backend tourne et que CORS est configuré.`)
    }
    if (error instanceof Error) throw error
    throw new Error('Erreur de connexion au serveur.')
  }
}

export const adminLogin = (payload: AdminLoginRequestDto) =>
  requestJson<AdminLoginResponseDto>('/auth/admin/login', payload)

export const confirmAdminMfa = (payload: AdminMfaConfirmRequestDto) =>
  requestJson<{ token: string }>('/auth/admin/mfa/confirm', payload)

