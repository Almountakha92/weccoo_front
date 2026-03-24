import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto, CampusDto } from '../dto'

export const fetchCampuses = async (): Promise<ApiResponseDto<CampusDto[]>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/campuses`)
    const data = (await response.json()) as ApiResponseDto<CampusDto[]>

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

