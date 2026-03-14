import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto } from '../dto'
import type { AuthResponseDto, LoginRequestDto, SignupRequestDto } from '../dto'
import { getAuthToken } from './authToken'

async function requestAuth<TPayload>(endpoint: 'login' | 'signup', payload: TPayload): Promise<ApiResponseDto<AuthResponseDto>> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as ApiResponseDto<AuthResponseDto>

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion au serveur.')
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw new Error(`Serveur backend inaccessible (${API_BASE_URL}). Vérifie que le backend tourne et que CORS est configuré.`)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Erreur de connexion au serveur.')
  }
}

export const login = (payload: LoginRequestDto) => requestAuth('login', payload)
export const signup = (payload: SignupRequestDto) => requestAuth('signup', payload)

export interface VerifyUniversityEmailRequestDto {
  email: string
  university: string
}

export interface VerifyUniversityEmailResponseDto {
  exists: boolean
}

export const verifyUniversityEmail = async (
  payload: VerifyUniversityEmailRequestDto
): Promise<ApiResponseDto<VerifyUniversityEmailResponseDto>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-university-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as ApiResponseDto<VerifyUniversityEmailResponseDto>

    if (!response.ok) {
      throw new Error(data.message || 'Erreur de connexion au serveur.')
    }

    return data
  } catch (error) {
    if (error instanceof Error && error.message === 'Failed to fetch') {
      throw new Error(`Serveur backend inaccessible (${API_BASE_URL}). Vérifie que le backend tourne et que CORS est configuré.`)
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Erreur de connexion au serveur.')
  }
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}
