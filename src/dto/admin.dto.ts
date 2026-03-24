export interface CampusDto {
  id: string
  name: string
  createdAt: string
}

export interface CreateCampusRequestDto {
  name: string
}

export interface CreateCampusAdminRequestDto {
  fullName: string
  university: string
  email: string
  whatsappPhone?: string
  password: string
  campusId: string
}

export interface AdminUserDto {
  id: string
  fullName: string
  email: string
  university: string
  whatsappPhone?: string | null
  role: 'student' | 'campus_admin' | 'super_admin'
  campusId?: string | null
  suspendedAt?: string | null
  createdAt: string
}

export interface AuditLogDto {
  id: string
  actorId?: string | null
  actorEmail?: string | null
  action: string
  targetType?: string | null
  targetId?: string | null
  campusId?: string | null
  ip?: string | null
  userAgent?: string | null
  metadata?: any
  createdAt: string
}

