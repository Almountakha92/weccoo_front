import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto, CreateItemRequestDto, ItemResponseDto, LikeReceivedResponseDto } from '../dto'
import { getAuthHeaders } from './authApi'

const parseResponse = async <T>(response: Response): Promise<ApiResponseDto<T>> => {
  const data = (await response.json()) as ApiResponseDto<T>

  if (!response.ok) {
    throw new Error(data.message || 'Erreur de connexion au serveur.')
  }

  return data
}

export const fetchItems = async () => {
  const response = await fetch(`${API_BASE_URL}/items`)
  return parseResponse<ItemResponseDto[]>(response)
}

export const fetchItemById = async (itemId: string) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`)
  return parseResponse<ItemResponseDto>(response)
}

export const createItem = async (payload: CreateItemRequestDto) => {
  const response = await fetch(`${API_BASE_URL}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  })

  return parseResponse<ItemResponseDto>(response)
}

export const registerItemView = async (itemId: string) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}/view`, {
    method: 'POST'
  })

  return parseResponse<ItemResponseDto>(response)
}

export const toggleItemLike = async (itemId: string) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}/like`, {
    method: 'POST',
    headers: getAuthHeaders()
  })

  return parseResponse<{ item: ItemResponseDto; liked: boolean }>(response)
}

export const fetchReceivedLikes = async (userId: string, limit = 10) => {
  const response = await fetch(`${API_BASE_URL}/items/received-likes/${userId}?limit=${limit}`, {
    headers: getAuthHeaders()
  })

  return parseResponse<LikeReceivedResponseDto[]>(response)
}
