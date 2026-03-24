import { API_BASE_URL } from '../config/api'
import type { ApiResponseDto, AuditLogDto, CampusDto, CreateCampusAdminRequestDto, CreateCampusRequestDto, AdminUserDto } from '../dto'
import { getAdminAuthHeaders } from './adminAuthToken'
import type { ItemModerationStatus } from '../dto/item.dto'

const request = async <TResponse>(path: string, init?: RequestInit): Promise<ApiResponseDto<TResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init)
    const data = (await response.json()) as ApiResponseDto<TResponse>

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

export const listCampuses = () =>
  request<CampusDto[]>('/admin/campuses', { headers: { ...getAdminAuthHeaders() } })

export const createCampus = (payload: CreateCampusRequestDto) =>
  request<CampusDto>('/admin/campuses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
    body: JSON.stringify(payload),
  })

export const listCampusAdmins = () =>
  request<AdminUserDto[]>('/admin/campus-admins', { headers: { ...getAdminAuthHeaders() } })

export const createCampusAdmin = (payload: CreateCampusAdminRequestDto) =>
  request<AdminUserDto>('/admin/campus-admins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
    body: JSON.stringify(payload),
  })

export const suspendCampusAdmin = (id: string, suspended: boolean) =>
  request<{ id: string; suspendedAt: string | null }>(`/admin/campus-admins/${id}/suspend`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
    body: JSON.stringify({ suspended }),
  })

export const resetCampusAdminMfa = (id: string) =>
  request<{ ok: boolean }>(`/admin/campus-admins/${id}/reset-mfa`, {
    method: 'POST',
    headers: { ...getAdminAuthHeaders() },
  })

export const listStudentsByCampus = (campusId?: string) => {
  const qs = campusId ? `?campusId=${encodeURIComponent(campusId)}` : ''
  return request<AdminUserDto[]>(`/admin/students${qs}`, { headers: { ...getAdminAuthHeaders() } })
}

export const suspendStudent = (id: string, suspended: boolean) =>
  request<{ id: string; suspendedAt: string | null }>(`/admin/students/${id}/suspend`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
    body: JSON.stringify({ suspended }),
  })

export const setUserCampus = (id: string, campusId: string | null) =>
  request<{ id: string; campusId: string | null }>(`/admin/users/${id}/campus`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
    body: JSON.stringify({ campusId }),
  })

export const listUsersByCampus = (campusId?: string) => {
  const qs = campusId ? `?campusId=${encodeURIComponent(campusId)}` : ''
  return request<AdminUserDto[]>(`/admin/users${qs}`, { headers: { ...getAdminAuthHeaders() } })
}

export const listAuditLogs = (limit: number = 50) =>
  request<AuditLogDto[]>(`/admin/audit-logs?limit=${encodeURIComponent(String(limit))}`, {
    headers: { ...getAdminAuthHeaders() },
  })

export type AdminModerationItemDto = {
  id: string
  title: string
  category: string
  description: string
  condition: string
  type: string
  location: string
  photos: string[]
  ownerId: string
  ownerName: string | null
  ownerEmail: string | null
  campusId: string | null
  moderationStatus: ItemModerationStatus
  moderatedAt: string | null
  moderationNote: string | null
  createdAt: string
}

export const listAdminItems = (params: { status?: ItemModerationStatus; studentId?: string; campusId?: string } = {}) => {
  const search = new URLSearchParams()
  if (params.status) search.set('status', params.status)
  if (params.studentId) search.set('studentId', params.studentId)
  if (params.campusId) search.set('campusId', params.campusId)
  const qs = search.toString() ? `?${search.toString()}` : ''
  return request<AdminModerationItemDto[]>(`/admin/items${qs}`, { headers: { ...getAdminAuthHeaders() } })
}

export const approveAdminItem = (itemId: string, note?: string) =>
  request<{ id: string; moderationStatus: string; moderatedAt: string; moderatedById: string; moderationNote: string | null; ownerId: string }>(
    `/admin/items/${itemId}/approve`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(note ? { note } : {}),
    }
  )

export const rejectAdminItem = (itemId: string, note?: string) =>
  request<{ id: string; moderationStatus: string; moderatedAt: string; moderatedById: string; moderationNote: string | null; ownerId: string }>(
    `/admin/items/${itemId}/reject`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAdminAuthHeaders() },
      body: JSON.stringify(note ? { note } : {}),
    }
  )

export const archiveAdminItem = (itemId: string) =>
  request<{ id: string; archivedAt: string; ownerId: string }>(`/admin/items/${itemId}/archive`, {
    method: 'PATCH',
    headers: { ...getAdminAuthHeaders() },
  })

export const deleteStudent = (studentId: string) =>
  request<{ ok: boolean }>(`/admin/students/${studentId}`, {
    method: 'DELETE',
    headers: { ...getAdminAuthHeaders() },
  })
