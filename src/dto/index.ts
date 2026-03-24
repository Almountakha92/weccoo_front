export interface PublishItemProps {
  onNavigate: (screen: string) => void
  onShowToast: (message: string, type?: string) => void
}

export interface PublishTypeOptionDto {
  id: 'don' | 'echange' | 'pret'
  label: string
  emoji: string
}

export const publishTypeOptionsDto: PublishTypeOptionDto[] = [
  { id: 'don', label: 'Don gratuit', emoji: 'Gift' },
  { id: 'echange', label: 'Échange', emoji: 'RefreshCw' },
  { id: 'pret', label: 'Prêt', emoji: 'Clock' },
]

export type { ApiResponseDto } from './common.dto'
export type { SignupRequestDto, LoginRequestDto, AuthResponseDto } from './auth.dto'
export type { AdminLoginRequestDto, AdminLoginResponseDto, AdminMfaConfirmRequestDto } from './admin-auth.dto'
export type { ItemType, CreateItemRequestDto, ItemResponseDto } from './item.dto'
export type { StatsResponseDto } from './stats.dto'
export type { LikeReceivedResponseDto } from './like.dto'
export type { CampusDto, CreateCampusRequestDto, CreateCampusAdminRequestDto, AdminUserDto, AuditLogDto } from './admin.dto'
