import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto, StatsResponseDto } from '../dto'
import { getAuthHeaders } from './authApi'

const parseResponse = async <T>(response: Response): Promise<ApiResponseDto<T>> => {
  const data = (await response.json()) as ApiResponseDto<T>

  if (!response.ok) {
    throw new Error(data.message || 'Erreur de connexion au serveur.')
  }

  return data
}

export const fetchStats = async () => {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    headers: getAuthHeaders()
  })
  return parseResponse<StatsResponseDto>(response)
}
