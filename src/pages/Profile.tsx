import React from 'react'
import { BookOpen, Pen, Bell, Shield, LogOut, Star, Package, RefreshCw, Clock, Heart } from 'lucide-react'
import type { AuthUserSession } from '../services/authToken'
import type { ConversationResponseDto, ItemResponseDto, LikeReceivedResponseDto } from '../dto'
import { fetchConversations } from '../services/messageApi'
import { fetchReceivedLikes } from '../services/itemApi'
import { updateMe } from '../services/userApi'

interface ProfileProps {
  authUser: AuthUserSession | null
  items: ItemResponseDto[]
  notificationsEnabled: boolean
  onToggleNotifications: (enabled: boolean) => void
  onAuthUserUpdated: (user: AuthUserSession) => void
  onLogout: () => void
  onNavigate: (screen: string) => void
  onSelectItem: (itemId: string) => void
  onShowToast: (message: string, type?: string) => void
}

const formatCount = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

const getItemIcon = (category: string) => {
  const normalized = category.toLowerCase()
  if (normalized.includes('livre')) return BookOpen
  return Package
}

const formatHistoryDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

const formatRelativeDate = (isoDate: string) => {
  const createdAt = new Date(isoDate)
  const diffMs = Date.now() - createdAt.getTime()

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return createdAt.toLocaleDateString('fr-FR')
  }

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours} h`
  if (days < 7) return `Il y a ${days} j`

  return createdAt.toLocaleDateString('fr-FR')
}

const historyBadgeByType: Record<ItemResponseDto['type'], { label: string; classes: string; leftIcon: React.ReactNode }> = {
  don: { label: 'Don', classes: 'bg-[#D1FAE5] text-[#065F46]', leftIcon: <span className="text-[12px] leading-none">✓</span> },
  echange: { label: 'Échange', classes: 'bg-[#DBEAFE] text-[#1E40AF]', leftIcon: <RefreshCw className="w-3.5 h-3.5" /> },
  pret: { label: 'Prêt', classes: 'bg-[#FEF3C7] text-[#92400E]', leftIcon: <Clock className="w-3.5 h-3.5" /> },
}

const historyVerbByType: Record<ItemResponseDto['type'], string> = {
  don: 'Don à',
  echange: 'Échange avec',
  pret: 'Prêt à',
}

export default function Profile({
  authUser,
  items,
  notificationsEnabled,
  onToggleNotifications,
  onAuthUserUpdated,
  onLogout,
  onNavigate,
  onSelectItem,
  onShowToast,
}: ProfileProps) {
  const userItems = items.filter((item) => item.ownerId === authUser?.id)
  const publishedCount = userItems.length
  const exchangeCount = userItems.filter((item) => item.type === 'echange').length
  const donationCount = userItems.filter((item) => item.type === 'don').length
  const [showAllMyItems, setShowAllMyItems] = React.useState(false)
  const [conversations, setConversations] = React.useState<ConversationResponseDto[]>([])
  const [isHistoryLoading, setIsHistoryLoading] = React.useState(false)
  const [likesReceived, setLikesReceived] = React.useState<LikeReceivedResponseDto[]>([])
  const [isLikesLoading, setIsLikesLoading] = React.useState(false)
  const [isEditPhoneOpen, setIsEditPhoneOpen] = React.useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = React.useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false)
  const [phoneDraft, setPhoneDraft] = React.useState(authUser?.whatsappPhone ?? '')
  const [currentPassword, setCurrentPassword] = React.useState('')
  const [newPassword, setNewPassword] = React.useState('')
  const [isSavingPhone, setIsSavingPhone] = React.useState(false)
  const [isSavingPassword, setIsSavingPassword] = React.useState(false)
  const visibleUserItems = showAllMyItems ? userItems : userItems.slice(0, 2)

  React.useEffect(() => {
    setPhoneDraft(authUser?.whatsappPhone ?? '')
  }, [authUser?.whatsappPhone])

  const closeModals = () => {
    setIsEditPhoneOpen(false)
    setIsChangePasswordOpen(false)
    setIsNotificationsOpen(false)
  }

  const savePhone = async () => {
    if (!authUser) return
    if (!phoneDraft.trim()) {
      onShowToast('Numero WhatsApp requis.', 'error')
      return
    }

    try {
      setIsSavingPhone(true)
      const response = await updateMe({ whatsappPhone: phoneDraft.trim() })
      onAuthUserUpdated(response.data)
      onShowToast('Numero WhatsApp mis a jour.', 'success')
      setIsEditPhoneOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mise a jour impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsSavingPhone(false)
    }
  }

  const changePassword = async () => {
    if (!authUser) return
    if (!currentPassword.trim() || !newPassword.trim()) {
      onShowToast('Renseigne le mot de passe actuel et le nouveau.', 'error')
      return
    }

    try {
      setIsSavingPassword(true)
      await updateMe({ currentPassword: currentPassword.trim(), newPassword: newPassword.trim() })
      onShowToast('Mot de passe mis a jour.', 'success')
      setCurrentPassword('')
      setNewPassword('')
      setIsChangePasswordOpen(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Mise a jour impossible.'
      onShowToast(message, 'error')
    } finally {
      setIsSavingPassword(false)
    }
  }

  React.useEffect(() => {
    if (!authUser) {
      setConversations([])
      return
    }

    const loadHistory = async () => {
      try {
        setIsHistoryLoading(true)
        const response = await fetchConversations(authUser.id)
        setConversations(response.data)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Impossible de charger l'historique."
        onShowToast(message, 'error')
      } finally {
        setIsHistoryLoading(false)
      }
    }

    void loadHistory()
  }, [authUser, onShowToast])

  React.useEffect(() => {
    if (!authUser) {
      setLikesReceived([])
      return
    }

    const loadLikes = async () => {
      try {
        setIsLikesLoading(true)
        const response = await fetchReceivedLikes(authUser.id, 12)
        setLikesReceived(response.data)
      } catch (error) {
        const message = error instanceof Error ? error.message : "Impossible de charger les j'aime reçus."
        onShowToast(message, 'error')
      } finally {
        setIsLikesLoading(false)
      }
    }

    void loadLikes()
  }, [authUser, onShowToast])

  const historyRows = conversations
    .map((conv) => {
      const item = items.find((candidate) => candidate.id === conv.itemId) ?? null
      const otherParticipantId = conv.participantIds.find((id) => id !== authUser?.id) ?? null
      return { conv, item, otherParticipantId }
    })
    .filter((row) => row.item)

  return (
    <div className="bg-gray-100 min-h-screen p-9 max-lg:p-5 max-md:pb-24">
      {isEditPhoneOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-50"
          onClick={closeModals}
        >
          <div className="w-full max-w-[420px] bg-white rounded-[18px] p-6 shadow-[0_8px_40px_rgba(15,23,42,0.25)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-extrabold text-[#0F172A] mb-1">Modifier le numéro WhatsApp</h3>
            <p className="text-[13px] text-gray-500 mb-4">Ex: 221771234567</p>
            <input
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              className="w-full px-4 py-3 rounded-[12px] bg-gray-100 border-2 border-transparent focus:border-[#1E63D6] focus:bg-white outline-none text-[14px]"
              placeholder="221771234567"
              type="tel"
            />
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsEditPhoneOpen(false)}
                className="flex-1 px-4 py-3 rounded-[12px] bg-gray-100 text-gray-700 font-bold"
                disabled={isSavingPhone}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void savePhone()}
                className="flex-1 px-4 py-3 rounded-[12px] bg-[#1E63D6] text-white font-bold disabled:opacity-60"
                disabled={isSavingPhone}
              >
                {isSavingPhone ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isChangePasswordOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-50"
          onClick={closeModals}
        >
          <div className="w-full max-w-[420px] bg-white rounded-[18px] p-6 shadow-[0_8px_40px_rgba(15,23,42,0.25)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-extrabold text-[#0F172A] mb-1">Changer le mot de passe</h3>
            <p className="text-[13px] text-gray-500 mb-4">Min. 8 caractères.</p>
            <div className="flex flex-col gap-3">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] bg-gray-100 border-2 border-transparent focus:border-[#1E63D6] focus:bg-white outline-none text-[14px]"
                placeholder="Mot de passe actuel"
                type="password"
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-[12px] bg-gray-100 border-2 border-transparent focus:border-[#1E63D6] focus:bg-white outline-none text-[14px]"
                placeholder="Nouveau mot de passe"
                type="password"
              />
            </div>
            <div className="flex gap-2.5 mt-5">
              <button
                type="button"
                onClick={() => setIsChangePasswordOpen(false)}
                className="flex-1 px-4 py-3 rounded-[12px] bg-gray-100 text-gray-700 font-bold"
                disabled={isSavingPassword}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => void changePassword()}
                className="flex-1 px-4 py-3 rounded-[12px] bg-[#1E63D6] text-white font-bold disabled:opacity-60"
                disabled={isSavingPassword}
              >
                {isSavingPassword ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isNotificationsOpen && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center p-5 z-50"
          onClick={closeModals}
        >
          <div className="w-full max-w-[420px] bg-white rounded-[18px] p-6 shadow-[0_8px_40px_rgba(15,23,42,0.25)]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-extrabold text-[#0F172A] mb-1">Notifications</h3>
            <p className="text-[13px] text-gray-500 mb-4">
              Chaque nouvelle publication peut apparaître comme une notification sur l’accueil.
            </p>
            <label className="flex items-center justify-between gap-3 bg-gray-100 rounded-[12px] px-4 py-3 cursor-pointer">
              <span className="text-[14px] font-bold text-[#0F172A]">Activer les notifications</span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => onToggleNotifications(e.target.checked)}
                className="w-5 h-5"
              />
            </label>
            <button
              type="button"
              onClick={() => setIsNotificationsOpen(false)}
              className="w-full mt-5 px-4 py-3 rounded-[12px] bg-[#1E63D6] text-white font-bold"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-[#0F172A] rounded-[20px] p-9 mb-6 flex items-center gap-7 shadow-[0_8px_40px_rgba(15,23,42,0.12)] max-md:flex-col max-md:text-center">
        <div className="relative">
          <div className="w-[88px] h-[88px] rounded-full bg-[#A8EDD3] flex items-center justify-center text-[38px] font-extrabold text-white border-4 border-white/20">
            {authUser?.fullName.slice(0, 2).toUpperCase() ?? '??'}
          </div>
          <button className="absolute bottom-0 right-0 w-7 h-7 bg-[#2ECC8F] rounded-full flex items-center justify-center text-xs cursor-pointer border-2 border-white">
            <Pen className="w-3 h-3 text-white" />
          </button>
        </div>
        
        <div className="flex-1">
          <h1 className="text-[26px] font-extrabold text-white mb-1">{authUser?.fullName ?? 'Profil'}</h1>
          <p className="text-[14px] text-white/60 mb-3">{authUser?.university ?? 'Université inconnue'}</p>
          <div className="flex items-center gap-2">
            <div className="flex text-amber-500">
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
              <Star className="w-4 h-4 fill-current" />
            </div>
            <span className="text-[13px] text-white/70">4.9 / 5 — 23 avis</span>
          </div>
          
          <div className="flex gap-6 mt-5 max-md:justify-center">
            <div className="text-center">
              <div className="text-[22px] font-extrabold text-white">{formatCount(publishedCount)}</div>
              <div className="text-[12px] text-white/55">Publiés</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-extrabold text-white">{formatCount(exchangeCount)}</div>
              <div className="text-[12px] text-white/55">Échanges</div>
            </div>
            <div className="text-center">
              <div className="text-[22px] font-extrabold text-white">{formatCount(donationCount)}</div>
              <div className="text-[12px] text-white/55">Dons</div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-[1fr_340px] gap-6 max-lg:grid-cols-1">
        {/* Left Column */}
        <div>
	          {/* My Items */}
	          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] mb-5">
	            <div className="flex items-center justify-between mb-4">
	              <h2 className="text-[16px] font-extrabold text-[#0F172A]">Mes objets proposés</h2>
	              <div className="flex items-center gap-4">
	                {userItems.length > 2 && (
	                  <button
	                    type="button"
	                    onClick={() => setShowAllMyItems((current) => !current)}
	                    className="text-[13.5px] text-[#1E63D6] font-bold hover:underline bg-transparent border-none cursor-pointer"
	                  >
	                    {showAllMyItems ? 'Voir moins' : 'Voir plus'}
	                  </button>
	                )}
	                <button
	                  type="button"
	                  onClick={() => onNavigate('publish')}
	                  className="text-[13.5px] text-[#1DA870] font-bold hover:underline bg-transparent border-none cursor-pointer"
	                >
	                  + Ajouter
	                </button>
	              </div>
	            </div>
	            
	            <div className="grid grid-cols-2 gap-3.5">
	              {visibleUserItems.map((item) => (
	              <div 
	                key={item.id}
	                onClick={() => onSelectItem(item.id)}
	                className="bg-white rounded-[18px] overflow-hidden shadow-[0_4px_20px_rgba(15,23,42,0.08)] cursor-pointer border border-gray-100 hover:border-[#2ECC8F] transition-all"
	              >
	                <div className="h-[84px] bg-gray-100 relative flex items-center justify-center">
	                  {item.photos?.length ? (
	                    <>
	                      <img
	                        src={item.photos[0]}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/5 to-black/15" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-[#D1FAE5] opacity-35" />
                      <BookOpen className="w-10 h-10 text-gray-600" />
                    </>
                  )}
	                  <div className="absolute top-2.5 left-2.5 text-[10px] font-extrabold rounded-full px-2 py-0.5 bg-white/90 text-[#0F172A]">
	                    {item.type}
	                  </div>
	                </div>
	                <div className="p-2.5">
	                  <div className="text-[12.5px] font-extrabold text-[#0F172A] truncate">{item.title}</div>
	                  <div className="text-[11.5px] text-gray-500 truncate">{item.category} · {item.condition}</div>
	                  <div className="text-[11.5px] text-gray-500">Vues: {item.viewsCount} · J'aime: {item.likesCount}</div>
	                </div>
	              </div>
	              ))}
	              {userItems.length === 0 && <div className="text-[13px] text-gray-500">Aucun objet publie pour le moment.</div>}
	            </div>
	          </div>

          {/* History */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            <h2 className="text-[16px] font-extrabold text-[#0F172A] mb-4">Historique des échanges</h2>

            {isHistoryLoading && (
              <div className="text-[13px] text-gray-500">Chargement de l'historique...</div>
            )}

            {!isHistoryLoading && historyRows.length === 0 && (
              <div className="text-[13px] text-gray-500">
                Aucun échange pour le moment. Démarre une conversation depuis un objet pour qu’elle apparaisse ici.
              </div>
            )}

            {!isHistoryLoading && historyRows.slice(0, 6).map(({ conv, item, otherParticipantId }, index) => {
              if (!item) return null
              const Icon = getItemIcon(item.category)
              const badge = historyBadgeByType[item.type]
              const verb = historyVerbByType[item.type]
              const otherLabel = otherParticipantId ? `Étudiant ${otherParticipantId.slice(0, 6)}` : 'un étudiant'
              const subtitle = `${verb} ${otherLabel} · ${formatHistoryDate(conv.createdAt)}`
              const withBorder = index < Math.min(historyRows.length, 6) - 1 ? 'border-b border-gray-100' : ''

              return (
                <div key={conv.id} className={`flex items-center gap-3.5 py-3.5 ${withBorder}`}>
                  <div className="w-11 h-11 rounded-[8px] bg-gray-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-[#0F172A] truncate">{item.title}</div>
                    <div className="text-[12.5px] text-gray-500 truncate">{subtitle}</div>
                  </div>
                  <span className={`text-[11px] font-bold rounded-full px-2.5 py-1 flex items-center gap-1.5 ${badge.classes}`}>
                    {badge.leftIcon}
                    {badge.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Reviews */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] mb-5">
            <h2 className="text-[16px] font-extrabold text-[#0F172A] mb-4">Avis reçus</h2>

            {isLikesLoading && <div className="text-[13px] text-gray-500">Chargement des interactions...</div>}

            {!isLikesLoading && likesReceived.length === 0 && (
              <div className="text-[13px] text-gray-500">Aucun “j’aime” reçu pour le moment.</div>
            )}

            {!isLikesLoading && likesReceived.length > 0 && (
              <div className="flex flex-col gap-3.5">
                {likesReceived.slice(0, 6).map((like) => (
                  <div key={like.id} className="p-4 bg-gray-100 rounded-[12px]">
                    <div className="flex gap-2.5 items-center mb-2">
                      <div className="w-7 h-7 rounded-full bg-[#FDE68A] flex items-center justify-center text-[12px] font-bold text-[#92400E]">
                        {like.liker.initials}
                      </div>
                      <span className="text-[13px] font-bold">{like.liker.fullName}</span>
                      <div className="ml-auto flex items-center gap-1 text-rose-500">
                        <Heart className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[12px] font-bold">J’aime</span>
                      </div>
                    </div>
                    <p className="text-[13px] text-gray-700 leading-relaxed">
                      {like.liker.fullName} a aimé votre produit <span className="font-bold">"{like.item.title}"</span>.
                    </p>
                    <span className="text-[11px] text-gray-400 mt-2 block">{formatRelativeDate(like.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            <h2 className="text-[16px] font-extrabold text-[#0F172A] mb-4">Paramètres du profil</h2>
            
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => setIsEditPhoneOpen(true)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-gray-100 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition-all w-full text-left"
              >
                <Pen className="w-4 h-4" />
                Modifier le profil
              </button>
              <button
                onClick={() => setIsNotificationsOpen(true)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-gray-100 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition-all w-full text-left"
              >
                <Bell className="w-4 h-4" />
                Notifications
                <span className={`ml-auto text-[12px] font-bold ${notificationsEnabled ? 'text-[#1DA870]' : 'text-gray-500'}`}>
                  {notificationsEnabled ? 'Activées' : 'Désactivées'}
                </span>
              </button>
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-gray-100 text-gray-700 font-semibold cursor-pointer hover:bg-gray-200 transition-all w-full text-left"
              >
                <Shield className="w-4 h-4" />
                Confidentialité
              </button>
              <button 
                onClick={onLogout}
                className="flex items-center gap-2.5 px-4 py-3 rounded-[12px] bg-gray-100 text-rose-500 font-semibold cursor-pointer hover:bg-gray-200 transition-all w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
