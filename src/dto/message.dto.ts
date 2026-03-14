export interface ConversationResponseDto {
  id: string
  participantIds: [string, string]
  itemId: string
  createdAt: string
}

export interface SendMessageRequestDto {
  text: string
}

export interface MessageResponseDto {
  id: string
  conversationId: string
  senderId: string
  text: string
  sentAt: string
}
