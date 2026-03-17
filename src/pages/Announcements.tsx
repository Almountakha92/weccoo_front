import React from 'react'
import { ArrowLeft, Archive, Megaphone, Plus, X } from 'lucide-react'
import BrandMark from '../components/BrandMark'
import type { AuthUserSession } from '../services/authToken'

interface AnnouncementsProps {
  authUser: AuthUserSession | null
  onNavigate: (screen: string) => void
}

type Announcement = {
  id: string
  title: string
  body: string
  createdAt: string
  ownerId: string | null
  archivedAt: string | null
}

const ANNOUNCEMENTS_STORAGE_KEY = 'students_announcements_v1'

const loadAnnouncementsFromStorage = (): Announcement[] => {
  const raw = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY)
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw) as Array<Partial<Announcement>>
    if (!Array.isArray(parsed)) return []

    const normalized: Announcement[] = []
    for (const entry of parsed) {
      if (!entry?.id || !entry.title || !entry.body || !entry.createdAt) continue
      normalized.push({
        id: entry.id,
        title: entry.title,
        body: entry.body,
        createdAt: entry.createdAt,
        ownerId: entry.ownerId ?? null,
        archivedAt: entry.archivedAt ?? null,
      })
    }

    return normalized
  } catch {
    return []
  }
}

const saveAnnouncementsToStorage = (announcements: Announcement[]) => {
  localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcements))
}

export default function Announcements({ authUser, onNavigate }: AnnouncementsProps) {
  const phrases = React.useMemo(
    () => [
      'Bienvenue dans la rubrique Annonces',
      'Explore les annonces ou fais ta requête au sein de la communauté',
    ],
    []
  )
  const [phraseIndex, setPhraseIndex] = React.useState(0)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [draftTitle, setDraftTitle] = React.useState('')
  const [draftBody, setDraftBody] = React.useState('')
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([])
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [showArchived, setShowArchived] = React.useState(false)

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setPhraseIndex((current) => (current + 1) % phrases.length)
    }, 4000)
    return () => window.clearInterval(id)
  }, [phrases.length])

  React.useEffect(() => {
    setAnnouncements(loadAnnouncementsFromStorage())
  }, [])

  const activeAnnouncements = announcements.filter((announcement) => !announcement.archivedAt)
  const archivedAnnouncements = announcements.filter((announcement) => Boolean(announcement.archivedAt))

  const formatDateTime = (iso: string) => {
    const date = new Date(iso)
    if (Number.isNaN(date.getTime())) return ''
    return date.toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleArchive = (announcementId: string) => {
    const nowIso = new Date().toISOString()
    const nextAnnouncements = announcements.map((announcement) =>
      announcement.id === announcementId ? { ...announcement, archivedAt: nowIso } : announcement
    )
    setAnnouncements(nextAnnouncements)
    saveAnnouncementsToStorage(nextAnnouncements)
    setSuccessMessage('Annonce archivée.')
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-9 max-lg:p-5 max-md:pb-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-[0_4px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-transform"
            title="Retour"
          >
            <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
          </button>
          <BrandMark size="sm" />
        </div>

        <div className="font-[Cabinet_Grotesk] text-[22px] font-extrabold text-[#0F172A]">Annonces</div>
      </div>

      <div className="mb-6">
        <div className="bg-white rounded-[24px] p-7 shadow-[0_4px_24px_rgba(15,23,42,0.08)] border border-gray-100 overflow-hidden relative">
          <div className="absolute -top-18 -right-18 w-64 h-64 bg-[radial-gradient(circle,rgba(30,99,214,0.10)_0%,transparent_65%)] rounded-full" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white rounded-full" />

          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-4 bg-[#FEF3C7] flex items-center justify-center  shrink-0">
              <Megaphone className="w-6 h-6 text-[#F5C400]" />
            </div>
            <div className="min-w-0">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-bold text-[#1E63D6] bg-[#E8F0FE] border border-[#1E63D6]/10 mb-2">
                À la une
              </div>
              <div className="h-[34px] sm:h-[36px] overflow-hidden">
                <div
                  key={phraseIndex}
                  className="font-[Cabinet_Grotesk] text-[22px] sm:text-[24px] font-extrabold text-[#0F172A] leading-tight animate-announcements-phrase"
                >
                  {phrases[phraseIndex]}
                </div>
              </div>
              <div className="text-[13.5px] text-gray-600 leading-relaxed mt-2">
                Reste informé(e) des nouveautés, événements et messages importants publiés par la communauté.
              </div>
            </div>
          </div>
        </div>
      </div>

	      <div className="bg-white rounded-[24px] p-8 shadow-[0_4px_24px_rgba(15,23,42,0.08)] border border-gray-100">
	        <div className="flex items-start gap-4">
	          <div className="w-12 h-12 rounded-4 bg-[#1E63D6] flex items-center justify-center shadow-[0_10px_26px_rgba(30,99,214,0.18)] shrink-0">
	            <Megaphone className="w-6 h-6 text-white" />
	          </div>
	          <div className="min-w-0">
	            {activeAnnouncements.length === 0 ? (
	              <>
	                <div className="font-[Cabinet_Grotesk] text-[24px] font-extrabold text-[#0F172A] leading-tight mb-1">
	                  Aucune annonce pour le moment
	                </div>
                <div className="text-[14px] text-gray-600 leading-relaxed mb-5">
                  Les annonces du campus (informations, événements, nouveautés) apparaîtront ici dès qu’elles seront publiées.
                </div>
              </>
            ) : (
              <>
                <div className="font-[Cabinet_Grotesk] text-[24px] font-extrabold text-[#0F172A] leading-tight mb-1">
                  Annonces récentes
                </div>
                <div className="text-[14px] text-gray-600 leading-relaxed mb-5">
                  Lis les dernières annonces publiées par la communauté.
                </div>
              </>
            )}

	            <div className="flex flex-wrap gap-3">
	              <button
	                type="button"
	                onClick={() => {
	                  if (!authUser) {
	                    onNavigate('auth')
	                    return
	                  }
	                  setSuccessMessage(null)
	                  setIsCreateOpen(true)
	                }}
	                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#F5C400] text-white font-bold text-sm hover:bg-[#E0AC00] hover:-translate-y-0.5 transition-all duration-200"
	                title={!authUser ? 'Connecte-toi pour créer une annonce' : 'Créer une annonce'}
	              >
	                <Plus className="w-4 h-4 mr-2" />
	                Créer une annonce
	              </button>
	              <button
	                type="button"
	                onClick={() => onNavigate('home')}
	                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-[#1E63D6] border border-[#1E63D6]/25 font-bold text-sm hover:bg-[#E8F0FE] hover:-translate-y-0.5 transition-all duration-200"
	              >
	                Retour à l’accueil
	              </button>
	              {archivedAnnouncements.length > 0 && (
	                <button
	                  type="button"
	                  onClick={() => setShowArchived((current) => !current)}
	                  className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-bold text-sm hover:bg-gray-50 transition-colors"
	                >
	                  {showArchived ? 'Masquer les archivées' : 'Voir les archivées'}
	                </button>
	              )}
	            </div>
	          </div>
	        </div>
	      </div>

      {isCreateOpen && (
        <div className="mt-6 bg-white rounded-[24px] p-7 shadow-[0_4px_24px_rgba(15,23,42,0.08)] border border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="min-w-0">
              <div className="font-[Cabinet_Grotesk] text-[22px] font-extrabold text-[#0F172A] leading-tight">
                Créer une annonce
              </div>
              <div className="text-[13.5px] text-gray-600">
                Rédige ton message et prépare-le à être publié dans la communauté.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center"
              title="Fermer"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

	          <form
	            onSubmit={(e) => {
	              e.preventDefault()
	              const nowIso = new Date().toISOString()
	              const id =
	                typeof crypto !== 'undefined' && 'randomUUID' in crypto
	                  ? crypto.randomUUID()
	                  : `${Date.now()}_${Math.random().toString(16).slice(2)}`
	              const nextAnnouncement: Announcement = {
	                id,
	                title: draftTitle.trim(),
	                body: draftBody.trim(),
	                createdAt: nowIso,
	                ownerId: authUser?.id ?? null,
	                archivedAt: null,
	              }
	              const nextAnnouncements = [nextAnnouncement, ...announcements].slice(0, 50)
	              setAnnouncements(nextAnnouncements)
	              saveAnnouncementsToStorage(nextAnnouncements)
	              setSuccessMessage('Annonce publiée avec succès.')
              setDraftTitle('')
              setDraftBody('')
              setIsCreateOpen(false)
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-[12px] font-bold text-gray-600 mb-1">Titre</label>
              <input
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="Ex: Réunion du club informatique"
                className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-[13.5px] outline-none focus:bg-white focus:border-[#1E63D6]/35 transition-colors font-['Satoshi']"
                maxLength={80}
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-gray-600 mb-1">Message</label>
              <textarea
                value={draftBody}
                onChange={(e) => setDraftBody(e.target.value)}
                placeholder="Écris ici les détails de ton annonce…"
                className="w-full min-h-[120px] bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-[13.5px] outline-none focus:bg-white focus:border-[#1E63D6]/35 transition-colors resize-y font-['Satoshi']"
                maxLength={600}
                required
              />
            </div>
            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-[#1E63D6] text-white font-bold text-sm hover:bg-[#1A56BE] hover:-translate-y-0.5 transition-all duration-200"
              >
                Publier
              </button>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="inline-flex items-center justify-center px-5 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-bold text-sm hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 bg-[#E8FAF3] border border-[#2ECC8F]/25 text-[#0F172A] rounded-[18px] px-5 py-4">
          <div className="text-[13.5px] font-semibold">{successMessage}</div>
        </div>
      )}

	      {activeAnnouncements.length > 0 && (
	        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
	          {activeAnnouncements.map((announcement) => (
	            <div
	              key={announcement.id}
	              className="bg-white rounded-[22px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] border border-gray-100"
	            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="font-[Cabinet_Grotesk] text-[20px] font-extrabold text-[#0F172A] leading-tight">
                    {announcement.title}
                  </div>
                  <div className="text-[12px] text-gray-400 font-semibold mt-1">
                    {formatDateTime(announcement.createdAt)}
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] flex items-center justify-center shrink-0">
                  <Megaphone className="w-5 h-5 text-[#F5C400]" />
                </div>
              </div>
	              <div className="font-['Satoshi'] text-[14px] text-gray-700 leading-relaxed tracking-[0.1px]">
	                <span className="text-[#1E63D6] font-extrabold mr-1">“</span>
	                {announcement.body}
	                <span className="text-[#1E63D6] font-extrabold ml-1">”</span>
	              </div>
	              {authUser?.id && announcement.ownerId === authUser.id && (
	                <div className="mt-4 flex justify-end">
	                  <button
	                    type="button"
	                    onClick={() => handleArchive(announcement.id)}
	                    className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white text-rose-600 border border-rose-200 font-bold text-[12.5px] hover:bg-rose-50 transition-colors"
	                    title="Archiver cette annonce"
	                  >
	                    <Archive className="w-4 h-4 mr-2" />
	                    Archiver
	                  </button>
	                </div>
	              )}
	            </div>
	          ))}
	        </div>
	      )}

	      {showArchived && archivedAnnouncements.length > 0 && (
	        <div className="mt-6">
	          <div className="font-[Cabinet_Grotesk] text-[18px] font-extrabold text-[#0F172A] mb-3">Archivées</div>
	          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
	            {archivedAnnouncements.map((announcement) => (
	              <div
	                key={announcement.id}
	                className="bg-white/70 rounded-[22px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)] border border-gray-100"
	              >
	                <div className="flex items-start justify-between gap-3 mb-2">
	                  <div className="min-w-0">
	                    <div className="font-[Cabinet_Grotesk] text-[18px] font-extrabold text-[#0F172A] leading-tight">
	                      {announcement.title}
	                    </div>
	                    <div className="text-[12px] text-gray-400 font-semibold mt-1">
	                      Archivée · {announcement.archivedAt ? formatDateTime(announcement.archivedAt) : ''}
	                    </div>
	                  </div>
	                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
	                    <Archive className="w-5 h-5 text-gray-500" />
	                  </div>
	                </div>
	                <div className="font-['Satoshi'] text-[14px] text-gray-700 leading-relaxed tracking-[0.1px]">
	                  <span className="text-gray-500 font-extrabold mr-1">“</span>
	                  {announcement.body}
	                  <span className="text-gray-500 font-extrabold ml-1">”</span>
	                </div>
	              </div>
	            ))}
	          </div>
	        </div>
	      )}
	    </div>
	  )
	}
