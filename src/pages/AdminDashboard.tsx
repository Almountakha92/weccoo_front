import React from 'react'
import { clearAdminToken, decodeJwtPayload } from '../services/adminAuthToken'
import {
  createCampus,
  createCampusAdmin,
  deleteStudent,
  listAdminItems,
  approveAdminItem,
  archiveAdminItem,
  rejectAdminItem,
  listAuditLogs,
  listCampuses,
  listCampusAdmins,
  listStudentsByCampus,
  listUsersByCampus,
  setUserCampus,
  suspendCampusAdmin,
  suspendStudent
} from '../services/adminApi'
import type { AdminUserDto, AuditLogDto, CampusDto } from '../dto'
import type { AdminModerationItemDto } from '../services/adminApi'

interface AdminDashboardProps {
  onNavigate: (screen: string) => void
  onShowToast: (message: string, type?: string) => void
  adminToken: string
  onAdminLogout: () => void
}

type AdminJwtPayload = {
  email?: string
  role?: string
  campusId?: string | null
  mfa?: boolean
  exp?: number
}

type DashboardView = 'platform' | 'campus-admins' | 'students' | 'audit' | 'moderation'

const formatModerationDate = (iso: string) => {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Date inconnue'
  return date.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function AdminDashboard({ onNavigate, onShowToast, adminToken, onAdminLogout }: AdminDashboardProps) {
  const payload = React.useMemo(() => decodeJwtPayload<AdminJwtPayload>(adminToken), [adminToken])
  const role = payload?.role
  const isSuperAdmin = role === 'super_admin'
  const isCampusAdmin = role === 'campus_admin'

  const [campuses, setCampuses] = React.useState<CampusDto[]>([])
  const [campusAdmins, setCampusAdmins] = React.useState<AdminUserDto[]>([])
  const [campusUsers, setCampusUsers] = React.useState<AdminUserDto[]>([])
  const [auditLogs, setAuditLogs] = React.useState<AuditLogDto[]>([])
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null)
  const [studentItems, setStudentItems] = React.useState<AdminModerationItemDto[]>([])
  const [pendingItems, setPendingItems] = React.useState<AdminModerationItemDto[]>([])
  const [isItemsLoading, setIsItemsLoading] = React.useState(false)
  const [moderationNote, setModerationNote] = React.useState('')
  const [activeView, setActiveView] = React.useState<DashboardView>(isSuperAdmin ? 'platform' : 'students')

  const [campusName, setCampusName] = React.useState('')
  const [selectedCampusId, setSelectedCampusId] = React.useState('')
  const [adminForm, setAdminForm] = React.useState({
    fullName: '',
    university: '',
    email: '',
    whatsappPhone: '',
    password: ''
  })

  const [isLoading, setIsLoading] = React.useState(false)

  const handleLogout = () => {
    clearAdminToken()
    onAdminLogout()
    onShowToast('Déconnexion admin.', 'success')
    onNavigate('landing')
  }

  const refreshCampuses = async () => {
    const response = await listCampuses()
    setCampuses(response.data)
    if (!selectedCampusId && response.data[0]?.id) {
      setSelectedCampusId(response.data[0].id)
    }
  }

  const refreshCampusAdmins = async () => {
    const response = await listCampusAdmins()
    setCampusAdmins(response.data)
  }

  const refreshAuditLogs = async () => {
    const response = await listAuditLogs(50)
    setAuditLogs(response.data)
  }

  const refreshUsers = async (campusId?: string) => {
    const response = await listUsersByCampus(campusId)
    setCampusUsers(response.data)
  }

  const refreshStudents = async (campusId?: string) => {
    const response = await listStudentsByCampus(campusId)
    setCampusUsers(response.data)
  }

  const loadStudentItems = async (studentId: string) => {
    try {
      setIsItemsLoading(true)
      setSelectedStudentId(studentId)
      const response = await listAdminItems({ studentId })
      setStudentItems(response.data)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Chargement des publications impossible.'
      onShowToast(message, 'error')
      setStudentItems([])
    } finally {
      setIsItemsLoading(false)
    }
  }

  const refreshPendingItems = async () => {
    const response = await listAdminItems({ status: 'pending' })
    setPendingItems(response.data)
  }

  const handleApproveItem = async (itemId: string) => {
    try {
      setIsItemsLoading(true)
      await approveAdminItem(itemId, moderationNote.trim() || undefined)
      if (selectedStudentId) {
        const response = await listAdminItems({ studentId: selectedStudentId })
        setStudentItems(response.data)
      }
      await refreshPendingItems()
      onShowToast('Publication validée.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsItemsLoading(false)
    }
  }

  const handleRejectItem = async (itemId: string) => {
    try {
      setIsItemsLoading(true)
      await rejectAdminItem(itemId, moderationNote.trim() || undefined)
      if (selectedStudentId) {
        const response = await listAdminItems({ studentId: selectedStudentId })
        setStudentItems(response.data)
      }
      await refreshPendingItems()
      onShowToast('Publication rejetée.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Rejet impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsItemsLoading(false)
    }
  }

  const handleArchiveItem = async (itemId: string) => {
    if (!window.confirm("Archiver cette publication de l'etudiant ?")) return

    try {
      setIsItemsLoading(true)
      await archiveAdminItem(itemId)
      if (selectedStudentId) {
        const response = await listAdminItems({ studentId: selectedStudentId })
        setStudentItems(response.data)
      }
      onShowToast('Publication archivee.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Archivage impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsItemsLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm('Supprimer définitivement cet étudiant ?')) return
    try {
      setIsLoading(true)
      await deleteStudent(studentId)
      await refreshStudents(selectedCampusId || undefined)
      onShowToast('Étudiant supprimé.', 'success')
      if (selectedStudentId === studentId) {
        setSelectedStudentId(null)
        setStudentItems([])
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Suppression impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    setActiveView(isSuperAdmin ? 'platform' : 'students')
  }, [isSuperAdmin])

  React.useEffect(() => {
    void (async () => {
      try {
        setIsLoading(true)
        if (isSuperAdmin) {
          await refreshCampuses()
          await refreshCampusAdmins()
          await refreshAuditLogs()
          await refreshPendingItems()
        } else if (isCampusAdmin) {
          await refreshStudents()
          await refreshPendingItems()
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Chargement admin impossible.'
        onShowToast(message, 'error')
      } finally {
        setIsLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, isCampusAdmin])

  const handleCreateCampus = async () => {
    if (!campusName.trim()) {
      onShowToast('Nom du campus requis.', 'error')
      return
    }

    try {
      setIsLoading(true)
      await createCampus({ name: campusName })
      setCampusName('')
      await refreshCampuses()
      onShowToast('Campus créé.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Création campus impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateCampusAdmin = async () => {
    if (!selectedCampusId) {
      onShowToast('Sélectionne un campus.', 'error')
      return
    }

    if (!adminForm.email.trim() || !adminForm.password.trim() || adminForm.password.length < 8) {
      onShowToast('Email + mot de passe (>=8) requis.', 'error')
      return
    }

    try {
      setIsLoading(true)
      await createCampusAdmin({
        campusId: selectedCampusId,
        fullName: adminForm.fullName || 'Campus Admin',
        university: adminForm.university || 'WECCOO',
        email: adminForm.email,
        whatsappPhone: adminForm.whatsappPhone || undefined,
        password: adminForm.password
      })

      setAdminForm({ fullName: '', university: '', email: '', whatsappPhone: '', password: '' })
      await refreshCampusAdmins()
      onShowToast('Campus admin créé.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Création admin impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleSuspend = async (adminId: string, suspended: boolean) => {
    try {
      setIsLoading(true)
      await suspendCampusAdmin(adminId, suspended)
      await refreshCampusAdmins()
      onShowToast(suspended ? 'Admin suspendu.' : 'Admin réactivé.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStudentSuspended = async (studentId: string, suspended: boolean) => {
    try {
      setIsLoading(true)
      await suspendStudent(studentId, suspended)
      await refreshStudents(selectedCampusId || undefined)
      onShowToast(suspended ? 'Étudiant suspendu.' : 'Étudiant réactivé.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignCampus = async (userId: string, campusId: string) => {
    try {
      setIsLoading(true)
      await setUserCampus(userId, campusId)
      await refreshUsers(selectedCampusId || undefined)
      onShowToast('Campus affecté à l’utilisateur.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Affectation impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const canSeeAudit = isSuperAdmin
  const viewOptions: { id: DashboardView; label: string }[] = isSuperAdmin
    ? [
        { id: 'platform', label: 'Plateforme' },
        { id: 'campus-admins', label: 'Campus admins' },
        { id: 'students', label: 'Étudiants' },
        { id: 'moderation', label: 'Publications' },
        { id: 'audit', label: 'Audit' }
      ]
    : [
        { id: 'students', label: 'Étudiants' },
        { id: 'moderation', label: 'Publications' }
      ]

  const selectedStudent = selectedStudentId ? campusUsers.find((user) => user.id === selectedStudentId) ?? null : null

  const renderPendingItems = () => (
    <section className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)] lg:col-span-2">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="text-[#0F172A] font-extrabold mb-1">Publications en attente</div>
          <div className="text-[13px] text-gray-600">
            Les admins peuvent relire chaque article avant validation ou rejet.
          </div>
        </div>
        <button
          type="button"
          disabled={isItemsLoading}
          onClick={() => void refreshPendingItems()}
          className="px-4 py-2 rounded-[12px] bg-gray-100 font-extrabold text-[12px] disabled:opacity-60"
        >
          Rafraîchir
        </button>
      </div>

      <div className="mb-4">
        <div className="text-[12px] font-extrabold text-gray-700 mb-1.5">Note de modération (optionnel)</div>
        <input
          value={moderationNote}
          onChange={(e) => setModerationNote(e.target.value)}
          placeholder="Ex: photos conformes / description incomplète / hors sujet…"
          className="w-full px-4 py-3 rounded-[14px] border border-gray-200"
        />
      </div>

      <div className="space-y-4">
        {pendingItems.map((item) => (
          <article key={item.id} className="border border-gray-200 rounded-[18px] p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <div className="text-[16px] font-extrabold text-[#0F172A]">{item.title}</div>
                <div className="text-[12.5px] text-gray-500">
                  Déposé par {item.ownerName ?? 'Étudiant inconnu'} · {item.ownerEmail ?? 'email indisponible'}
                </div>
                <div className="text-[12px] text-gray-500 mt-1">
                  {item.category} · {item.type} · {item.condition} · {item.location}
                </div>
                <div className="text-[12px] text-gray-400 mt-1">Publié le {formatModerationDate(item.createdAt)}</div>
              </div>
              <span className="shrink-0 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-extrabold">
                {item.moderationStatus}
              </span>
            </div>

            {item.photos.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {item.photos.slice(0, 4).map((photo, index) => (
                  <img
                    key={`${item.id}-${index}`}
                    src={photo}
                    alt={`${item.title} ${index + 1}`}
                    className="w-full h-28 object-cover rounded-[12px] border border-gray-200 bg-gray-100"
                    loading="lazy"
                  />
                ))}
              </div>
            )}

            <div className="rounded-[14px] bg-[#F8FAFC] border border-gray-200 p-3 mb-3">
              <div className="text-[12px] font-extrabold text-gray-700 mb-1">Description</div>
              <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">{item.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isItemsLoading}
                onClick={() => void handleRejectItem(item.id)}
                className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-white border-gray-200 text-red-700 disabled:opacity-60"
              >
                Rejeter
              </button>
              <button
                type="button"
                disabled={isItemsLoading}
                onClick={() => void handleApproveItem(item.id)}
                className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-[#1E63D6] border-[#1E63D6] text-white disabled:opacity-60"
              >
                Valider
              </button>
            </div>
          </article>
        ))}

        {pendingItems.length === 0 && (
          <div className="text-[12px] text-gray-500">Aucune publication en attente de validation.</div>
        )}
      </div>
    </section>
  )

  const renderStudentItems = () => (
    <div className="mt-5 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[#0F172A] font-extrabold">Publications de l’étudiant</div>
          {selectedStudent && (
            <div className="text-[12px] text-gray-500">
              {selectedStudent.fullName} · {selectedStudent.email}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedStudentId(null)
            setStudentItems([])
            setModerationNote('')
          }}
          className="text-[12px] font-extrabold text-gray-600 hover:text-gray-800"
        >
          Fermer
        </button>
      </div>

      <div className="mb-3">
        <div className="text-[12px] font-extrabold text-gray-700 mb-1.5">Note (optionnel)</div>
        <input
          value={moderationNote}
          onChange={(e) => setModerationNote(e.target.value)}
          placeholder="Ex: OK / Photo floue / Contenu incomplet…"
          className="w-full px-4 py-3 rounded-[14px] border border-gray-200"
        />
      </div>

      <div className="space-y-2">
        {studentItems.map((it) => (
          <div key={it.id} className="border border-gray-200 rounded-[16px] p-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[13px] font-extrabold truncate">{it.title}</div>
              <div className="text-[12px] text-gray-500">
                {it.category} · {it.type} · statut: <span className="font-mono">{it.moderationStatus}</span>
              </div>
            </div>
            {it.moderationStatus === 'pending' ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isItemsLoading}
                  onClick={() => void handleArchiveItem(it.id)}
                  className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-white border-gray-200 text-gray-700 disabled:opacity-60"
                >
                  Archiver
                </button>
                <button
                  type="button"
                  disabled={isItemsLoading}
                  onClick={() => void handleRejectItem(it.id)}
                  className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-white border-gray-200 text-red-700 disabled:opacity-60"
                >
                  Rejeter
                </button>
                <button
                  type="button"
                  disabled={isItemsLoading}
                  onClick={() => void handleApproveItem(it.id)}
                  className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-[#1E63D6] border-[#1E63D6] text-white disabled:opacity-60"
                >
                  Valider
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={isItemsLoading}
                onClick={() => void handleArchiveItem(it.id)}
                className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-white border-gray-200 text-gray-700 disabled:opacity-60"
              >
                Archiver
              </button>
            )}
          </div>
        ))}
        {studentItems.length === 0 && <div className="text-[12px] text-gray-500">Aucune publication.</div>}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="text-[#0F172A] font-extrabold text-[20px]">Admin dashboard</div>
            <div className="text-[13px] text-gray-600">
              {payload?.email ?? '—'} · rôle: <span className="font-extrabold">{payload?.role ?? '—'}</span> · campusId:{' '}
              <span className="font-mono">{String(payload?.campusId ?? '—')}</span>
            </div>
            <div className="text-[12px] text-gray-500">MFA: {payload?.mfa ? 'OK' : 'non'}</div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 rounded-full bg-white border border-gray-200 p-1">
              {viewOptions.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => setActiveView(view.id)}
                  className={`px-4 py-2 rounded-full text-[12px] font-extrabold transition-colors ${
                    activeView === view.id ? 'bg-[#0F172A] text-white' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-full bg-white border border-gray-200 font-extrabold text-[13px] hover:bg-gray-50"
            >
              Déconnexion
            </button>
          </div>
        </div>

        <div className="sm:hidden mb-4">
          <select
            value={activeView}
            onChange={(e) => setActiveView(e.target.value as DashboardView)}
            className="w-full px-4 py-3 rounded-[16px] border border-gray-200 bg-white text-[13px] font-extrabold"
          >
            {viewOptions.map((view) => (
              <option key={view.id} value={view.id}>
                {view.label}
              </option>
            ))}
          </select>
        </div>

        {isSuperAdmin && activeView === 'platform' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            <div className="text-[#0F172A] font-extrabold mb-1">Campuses</div>
            <div className="text-[13px] text-gray-600 mb-4">Créer et lister les campus (super_admin).</div>

            <div className="flex gap-2 mb-4">
              <input
                value={campusName}
                onChange={(e) => setCampusName(e.target.value)}
                placeholder="Nom du campus"
                className="flex-1 px-4 py-2.5 rounded-[14px] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1E63D6]/30"
              />
              <button
                type="button"
                disabled={isLoading}
                onClick={handleCreateCampus}
                className="px-5 py-2.5 rounded-[14px] bg-[#1E63D6] text-white font-extrabold text-[13px] disabled:opacity-60"
              >
                Ajouter
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void refreshCampuses()}
                className="px-4 py-2 rounded-[12px] bg-gray-100 font-extrabold text-[12px] disabled:opacity-60"
              >
                Rafraîchir
              </button>
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="flex-1 px-3 py-2 rounded-[12px] border border-gray-200 text-[13px]"
              >
                <option value="">— choisir —</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id.slice(0, 6)}…)
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void refreshStudents(selectedCampusId || undefined)}
                className="px-4 py-2 rounded-[12px] bg-[#F5C400] text-white font-extrabold text-[12px] disabled:opacity-60"
              >
                Voir étudiants
              </button>
            </div>

            <div className="text-[12px] text-gray-500">Total: {campuses.length}</div>
            </section>

            <section className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
              <div className="text-[#0F172A] font-extrabold mb-1">Vue plateforme</div>
              <div className="text-[13px] text-gray-600 mb-4">Le `super_admin` gère la structure globale puis délègue l’opérationnel aux `campus_admin`.</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-[18px] border border-gray-200 bg-[#F8FAFC] p-4">
                  <div className="text-[12px] text-gray-500">Campuses</div>
                  <div className="text-[22px] font-extrabold text-[#0F172A]">{campuses.length}</div>
                </div>
                <div className="rounded-[18px] border border-gray-200 bg-[#F8FAFC] p-4">
                  <div className="text-[12px] text-gray-500">Campus admins</div>
                  <div className="text-[22px] font-extrabold text-[#0F172A]">{campusAdmins.length}</div>
                </div>
                <div className="rounded-[18px] border border-gray-200 bg-[#F8FAFC] p-4">
                  <div className="text-[12px] text-gray-500">Logs audit</div>
                  <div className="text-[22px] font-extrabold text-[#0F172A]">{auditLogs.length}</div>
                </div>
              </div>
            </section>
          </div>
        )}

        {isSuperAdmin && activeView === 'campus-admins' && (
          <section className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            <div className="text-[#0F172A] font-extrabold mb-1">Campus admins</div>
            <div className="text-[13px] text-gray-600 mb-4">Créer/suspendre un campus_admin (super_admin).</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <input
                value={adminForm.fullName}
                onChange={(e) => setAdminForm((p) => ({ ...p, fullName: e.target.value }))}
                placeholder="Nom complet"
                className="px-4 py-2.5 rounded-[14px] border border-gray-200"
              />
              <input
                value={adminForm.university}
                onChange={(e) => setAdminForm((p) => ({ ...p, university: e.target.value }))}
                placeholder="Université"
                className="px-4 py-2.5 rounded-[14px] border border-gray-200"
              />
              <input
                value={adminForm.email}
                onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="Email"
                className="px-4 py-2.5 rounded-[14px] border border-gray-200"
              />
              <input
                value={adminForm.password}
                onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Mot de passe (>=8)"
                type="password"
                className="px-4 py-2.5 rounded-[14px] border border-gray-200"
              />
            </div>

            <button
              type="button"
              disabled={isLoading}
              onClick={handleCreateCampusAdmin}
              className="w-full px-5 py-2.5 rounded-[14px] bg-[#1E63D6] text-white font-extrabold text-[13px] disabled:opacity-60 mb-3"
            >
              Créer campus_admin (sur campus sélectionné)
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => void refreshCampusAdmins()}
              className="px-4 py-2 rounded-[12px] bg-gray-100 font-extrabold text-[12px] disabled:opacity-60"
            >
              Rafraîchir
            </button>

            <div className="mt-3 space-y-2 max-h-[240px] overflow-auto pr-1">
              {campusAdmins.map((a) => {
                const isSuspended = Boolean(a.suspendedAt)
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3 border border-gray-200 rounded-[14px] p-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold text-[#0F172A] truncate">{a.email}</div>
                      <div className="text-[12px] text-gray-500 truncate">
                        campusId: <span className="font-mono">{String(a.campusId ?? '—')}</span> · {isSuspended ? 'suspendu' : 'actif'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => void handleToggleSuspend(a.id, !isSuspended)}
                      className={`px-3 py-2 rounded-[12px] text-[12px] font-extrabold border ${
                        isSuspended ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200 text-red-700'
                      } disabled:opacity-60`}
                    >
                      {isSuspended ? 'Réactiver' : 'Suspendre'}
                    </button>
                  </div>
                )
              })}
              {campusAdmins.length === 0 && <div className="text-[12px] text-gray-500">Aucun campus_admin.</div>}
            </div>
          </section>
        )}

        {activeView === 'students' && (
          <section className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)] lg:col-span-2">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-[#0F172A] font-extrabold mb-1">
                  {isSuperAdmin ? 'Étudiants par campus' : 'Espace campus'}
                </div>
                <div className="text-[13px] text-gray-600">
                  {isSuperAdmin
                    ? 'Sélectionne un campus puis consulte les étudiants et leurs publications.'
                    : 'Le campus_admin ne voit que les étudiants et publications de son propre campus.'}
                </div>
              </div>
              {selectedStudentId && (
                <div className="rounded-[14px] bg-[#F8FAFC] border border-gray-200 px-3 py-2 text-[12px] text-gray-600">
                  Étudiant sélectionné: <span className="font-extrabold text-[#0F172A]">{selectedStudent?.fullName ?? selectedStudentId}</span>
                </div>
              )}
            </div>
            <div className="text-[13px] text-gray-600 mb-3">
              Pour un <span className="font-extrabold">campus_admin</span>, la route ignore le campusId et utilise son propre campus.
            </div>
            <div className="flex items-center gap-2 mb-3">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void refreshStudents(selectedCampusId || undefined)}
                className="px-4 py-2 rounded-[12px] bg-[#F5C400] text-white font-extrabold text-[12px] disabled:opacity-60"
              >
                Charger étudiants
              </button>
              <div className="text-[12px] text-gray-500">Total: {campusUsers.length}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {campusUsers.map((u) => {
                const isSuspended = Boolean(u.suspendedAt)
                return (
                  <div key={u.id} className="border border-gray-200 rounded-[16px] p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-extrabold truncate">{u.fullName}</div>
                      <div className="text-[12px] text-gray-600 truncate">{u.email}</div>
                      <div className="text-[12px] text-gray-500">
                        rôle: <span className="font-mono">{u.role}</span> · {isSuspended ? 'suspendu' : 'actif'}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          type="button"
                          disabled={isItemsLoading}
                          onClick={() => void loadStudentItems(u.id)}
                          className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-gray-50 border-gray-200 disabled:opacity-60"
                        >
                          Publications
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => void handleDeleteStudent(u.id)}
                            className="px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-white border-gray-200 text-red-700 disabled:opacity-60"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                      {isSuperAdmin && !u.campusId && selectedCampusId && (
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => void handleAssignCampus(u.id, selectedCampusId)}
                          className="mt-2 px-3 py-2 rounded-[12px] text-[12px] font-extrabold border bg-white border-gray-200 disabled:opacity-60"
                        >
                          Affecter au campus
                        </button>
                      )}
                    </div>
                    {(isSuperAdmin || isCampusAdmin) && u.role === 'student' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => void handleToggleStudentSuspended(u.id, !isSuspended)}
                        className={`px-3 py-2 rounded-[12px] text-[12px] font-extrabold border ${
                          isSuspended ? 'bg-white border-gray-200' : 'bg-red-50 border-red-200 text-red-700'
                        } disabled:opacity-60`}
                      >
                        {isSuspended ? 'Réactiver' : 'Suspendre'}
                      </button>
                    )}
                  </div>
                )
              })}
              {campusUsers.length === 0 && <div className="text-[12px] text-gray-500">Aucun user chargé.</div>}
            </div>

            {selectedStudentId && renderStudentItems()}
          </section>
        )}

        {activeView === 'moderation' && renderPendingItems()}

        {canSeeAudit && activeView === 'audit' && (
          <section className="bg-white rounded-[22px] p-6 border border-gray-200 shadow-[0_4px_24px_rgba(15,23,42,0.08)] lg:col-span-2">
              <div className="text-[#0F172A] font-extrabold mb-1">Audit logs</div>
              <div className="text-[13px] text-gray-600 mb-3">Dernières actions admin.</div>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => void refreshAuditLogs()}
                className="px-4 py-2 rounded-[12px] bg-gray-100 font-extrabold text-[12px] disabled:opacity-60 mb-3"
              >
                Rafraîchir
              </button>
              <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                {auditLogs.map((log) => (
                  <div key={log.id} className="border border-gray-200 rounded-[14px] p-3">
                    <div className="text-[12px] text-gray-500">
                      {new Date(log.createdAt).toLocaleString()} · <span className="font-extrabold">{log.action}</span>
                    </div>
                    <div className="text-[12px] text-gray-600 truncate">
                      actor: {log.actorEmail ?? '—'} · target: {log.targetType ?? '—'} {log.targetId ?? ''}
                    </div>
                  </div>
                ))}
                {auditLogs.length === 0 && <div className="text-[12px] text-gray-500">Aucun log.</div>}
              </div>
          </section>
        )}

        {isLoading && <div className="text-[12px] text-gray-500 mt-4">Chargement…</div>}
      </div>
    </div>
  )
}
