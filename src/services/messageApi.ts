import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto, ConversationResponseDto, MessageResponseDto, SendMessageRequestDto } from '../dto'
import { getAuthHeaders } from './authApi'

const parseResponse = async <T>(response: Response): Promise<ApiResponseDto<T>> => {
  const data = (await response.json()) as ApiResponseDto<T>

  if (!response.ok) {
    throw new Error(data.message || 'Erreur de connexion au serveur.')
  }

  return data
}

export const fetchConversations = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/messages/conversations/${userId}`, {
    headers: getAuthHeaders()
  })

  return parseResponse<ConversationResponseDto[]>(response)
}

export const fetchConversationMessages = async (conversationId: string) => {
  const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
    headers: getAuthHeaders()
  })

  return parseResponse<MessageResponseDto[]>(response)
}

export const sendMessage = async (conversationId: string, payload: SendMessageRequestDto) => {
  const response = await fetch(`${API_BASE_URL}/messages/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload)
  })

  return parseResponse<MessageResponseDto>(response)
}
