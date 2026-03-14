import type { ItemType } from './item.dto'

export interface LikeReceivedResponseDto {
  id: string
  createdAt: string
  item: {
    id: string
    title: string
    type: ItemType
  }
  liker: {
    id: string
    fullName: string
    initials: string
  }
}

