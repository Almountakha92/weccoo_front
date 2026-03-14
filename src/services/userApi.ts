import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto } from '../dto'
import type { AuthUserSession } from './authToken'
import { getAuthHeaders } from './authApi'

export interface UpdateMeRequestDto {
  whatsappPhone?: string
  currentPassword?: string
  newPassword?: string
}

const parseResponse = async <T>(response: Response): Promise<ApiResponseDto<T>> => {
  const data = (await response.json()) as ApiResponseDto<T>

  if (!response.ok) {
    throw new Error(data.message || 'Erreur de connexion au serveur.')
  }

  return data
}

export const updateMe = async (payload: UpdateMeRequestDto) => {
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  })

  return parseResponse<AuthUserSession>(response)
}

