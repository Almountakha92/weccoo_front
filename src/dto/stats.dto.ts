export interface StatsResponseDto {
  itemsCount: number
  usersCount: number
  totalLikesCount: number
  totalViewsCount: number
  scope: 'global' | 'campus'
}
