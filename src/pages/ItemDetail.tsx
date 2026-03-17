import React from 'react'
import { ArrowLeft, Archive, BookOpen, MessageSquare, Heart, Share2, Shield, MapPin, Clock } from 'lucide-react'
import type { ItemResponseDto } from '../dto'
import type { AuthUserSession } from '../services/authToken'
import { archiveItem } from '../services/itemApi'

interface ItemDetailProps {
  authUser: AuthUserSession | null
  item: ItemResponseDto | null
  onNavigate: (screen: string) => void
  onItemArchived: (item: ItemResponseDto) => void
  onShowToast: (message: string, type?: string) => void
}

const thumbnails = [BookOpen, BookOpen, BookOpen]

const formatRelativeDateTime = (isoDate: string) => {
  const createdAt = new Date(isoDate)
  const diffMs = Date.now() - createdAt.getTime()

  if (!Number.isFinite(diffMs) || diffMs < 0) {
    return createdAt.toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
  }

  const minutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (minutes < 1) return "A l'instant"
  if (minutes < 60) return `Il y a ${minutes} min`
  if (hours < 24) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
  if (days < 7) return `Il y a ${days} jour${days > 1 ? 's' : ''}`

  return createdAt.toLocaleDateString('fr-FR')
}

const formatAbsoluteDateTime = (isoDate: string) => {
  const date = new Date(isoDate)
  return date.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
}

const normalizeCondition = (raw: string) => raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

const getConditionMeta = (rawCondition: string) => {
  const normalized = normalizeCondition(rawCondition)

  if (normalized.includes('neuf')) return { label: 'Neuf / comme neuf', score: 5 }
  if (normalized.includes('tres bon')) return { label: 'Très bon état', score: 4 }
  if (normalized.includes('bon')) return { label: 'Bon état', score: 3 }
  if (normalized.includes('correct') || normalized.includes('use')) return { label: 'État correct', score: 2 }

  return { label: rawCondition, score: 3 }
}

export default function ItemDetail({ authUser, item, onNavigate, onItemArchived, onShowToast }: ItemDetailProps) {
  const [activeThumb, setActiveThumb] = React.useState(0)
  const [isArchiving, setIsArchiving] = React.useState(false)
  const ownerInitials = item?.ownerInitials ?? item?.ownerName?.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') ?? '??'
  const ownerName = item?.ownerName ?? item?.ownerId ?? 'Proprietaire'
  const isOwner = Boolean(authUser && item && authUser.id === item.ownerId)
  const whatsappUrl = item?.ownerWhatsappPhone ? `https://wa.me/${item.ownerWhatsappPhone.replace(/[^0-9]/g, '')}` : null
  const conditionMeta = item ? getConditionMeta(item.condition) : { label: '', score: 0 }

  const handleArchive = () => {
    if (!item) return
    const confirmed = window.confirm("Archiver cet article ? Il n'apparaîtra plus dans la liste.")
    if (!confirmed) return

    void (async () => {
      try {
        setIsArchiving(true)
        const response = await archiveItem(item.id)
        onItemArchived(response.data)
        onShowToast('Article archivé.', 'success')
        onNavigate('profile')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Archivage impossible.'
        onShowToast(message, 'error')
      } finally {
        setIsArchiving(false)
      }
    })()
  }

  if (!item) {
    return (
      <div className="bg-gray-100 min-h-screen p-9 max-lg:p-5 max-md:pb-24">
        <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)] text-gray-600">
          Aucun objet selectionne.
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 min-h-screen p-9 max-lg:p-5 max-md:pb-24">
      {/* Back Button */}
      <button
        onClick={() => onNavigate('list')}
        className="inline-flex items-center gap-2 text-gray-700 font-semibold text-sm cursor-pointer border-none bg-white rounded-full px-4 py-2 shadow-[0_4px_24px_rgba(15,23,42,0.08)] mb-6 hover:bg-gray-100 transition-all duration-180 font-['Satoshi']"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Layout */}
      <div className="grid grid-cols-[1fr_380px] gap-7 max-lg:grid-cols-1">
        {/* Left Column */}
        <div>
          {/* Gallery */}
          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
	            <div className="h-[320px] flex items-center justify-center bg-[#E8FAF3] relative">
	              {item.photos?.length ? (
	                <img
	                  src={item.photos[Math.min(activeThumb, item.photos.length - 1)]}
	                  alt={item.title}
	                  className="w-full h-full object-cover"
	                />
	              ) : (
	                <BookOpen className="w-24 h-24 text-gray-600" />
	              )}
	            </div>
	            <div className="flex items-center justify-between gap-3 p-4">
	              <div className="flex gap-3">
	                {(item.photos?.length ? item.photos : thumbnails).map((entry, index) => (
	                  <button
	                    key={index}
	                    onClick={() => setActiveThumb(index)}
	                    className={`w-[68px] h-[68px] rounded-[8px] bg-gray-100 flex items-center justify-center cursor-pointer border-2 transition-all duration-180 ${
	                      activeThumb === index ? 'border-[#2ECC8F]' : 'border-transparent hover:border-gray-300'
	                    }`}
	                  >
	                    {typeof entry === 'string' ? (
	                      <img src={entry} alt={`thumb-${index + 1}`} className="w-full h-full object-cover rounded-[6px]" />
	                    ) : (
	                      <entry className="w-6 h-6 text-gray-600" />
	                    )}
	                  </button>
	                ))}
	                <button
	                  type="button"
	                  className="w-[68px] h-[68px] rounded-[8px] bg-gray-100 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-300 text-gray-400 text-base"
	                  title="Ajouter"
	                >
	                  +
	                </button>
	              </div>

	              {isOwner && (
	                <button
	                  type="button"
	                  disabled={isArchiving}
	                  onClick={handleArchive}
	                  className={`shrink-0 h-11 px-4 rounded-full border border-[#F5C400]/30 font-extrabold text-[13px] transition-all duration-200 flex items-center gap-2 ${
	                    isArchiving
	                      ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
	                      : 'bg-[#F5C400] text-white hover:bg-[#E0AC00] hover:-translate-y-0.5 shadow-[0_8px_26px_rgba(245,196,0,0.22)]'
	                  }`}
	                  title="Archiver cet article"
	                >
	                  <Archive className="w-4 h-4" />
	                  {isArchiving ? 'Archivage…' : 'Archiver'}
	                </button>
	              )}
	            </div>
	          </div>

          {/* Info */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_4px_24px_rgba(15,23,42,0.08)] mt-5">
            <h1 className="font-[Cabinet_Grotesk] text-[26px] font-extrabold text-[#0F172A] mb-2">
              {item.title}
            </h1>
            
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="px-3.5 py-1.25 rounded-full text-[12.5px] font-bold bg-[#E8FAF3] text-[#1DA870] flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {item.category}
              </span>
              <span className="px-3.5 py-1.25 rounded-full text-[12.5px] font-bold bg-[#D1FAE5] text-[#065F46] flex items-center gap-1">
                {item.type}
              </span>
              <span className="px-3.5 py-1.25 rounded-full text-[12.5px] font-bold bg-gray-100 text-gray-700 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {item.location}
              </span>
              <span className="px-3.5 py-1.25 rounded-full text-[12.5px] font-bold bg-gray-100 text-gray-700">
                0.3 km
              </span>
            </div>

            <p className="text-[14.5px] text-gray-700 leading-relaxed mb-5">
              {item.description}
            </p>

            {/* Condition */}
            <div className="mb-5">
              <div className="text-[13px] font-bold text-gray-700 mb-2">
                État de l'objet : <strong className="text-[#1DA870]">{conditionMeta.label}</strong>
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <div
                    key={dot}
                    className={`w-7 h-2 rounded-sm ${dot <= conditionMeta.score ? 'bg-[#2ECC8F]' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

	        {/* Right Column */}
	        <div className="flex flex-col gap-5">
	          {/* Owner Card */}
	          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
	            <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3.5">Propriétaire</div>
            
            <div className="flex items-center gap-3.5 p-4 bg-gray-100 rounded-[12px] mb-5">
              <div className="w-[52px] h-[52px] rounded-full bg-[#A8EDD3] flex items-center justify-center text-xl font-extrabold text-[#1DA870]">
                {ownerInitials}
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-bold text-[#0F172A]">{ownerName}</div>
              </div>
            </div>

	            {!isOwner && (
	              <button
	                onClick={() => {
	                  if (!whatsappUrl) {
	                    onShowToast('Numero WhatsApp indisponible.', 'error')
	                    return
                  }

                  window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
                }}
	                className="w-full py-4 rounded-full text-base font-extrabold bg-[#2ECC8F] text-white border-none cursor-pointer shadow-[0_8px_32px_rgba(46,204,143,0.25)] hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgba(46,204,143,0.4)] transition-all duration-200 font-['Cabinet_Grotesk'] flex items-center justify-center gap-2"
	              >
	                <MessageSquare className="w-5 h-5" />
	                Contacter le propriétaire
	              </button>
	            )}

		            <div className="flex items-center justify-center gap-2 text-[12px] text-gray-500 mt-3">
		              <Shield className="w-4 h-4" />
		              Échange sécurisé & vérification université
	            </div>
          </div>

          {/* Exchange Info */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3.5">Infos de l'échange</div>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-700">Type</span>
                <span className="font-bold bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-full flex items-center gap-1">
                  {item.type}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-700">Remise en main</span>
                <span className="font-bold text-[#0F172A]">En personne</span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-700">Zone</span>
                <span className="font-bold text-[#0F172A] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {item.location}
                </span>
              </div>
              <div className="flex justify-between items-center text-[14px]">
                <span className="text-gray-700">Publié</span>
                <span
                  className="font-bold text-[#0F172A] flex items-center gap-1"
                  title={formatAbsoluteDateTime(item.createdAt)}
                >
                  <Clock className="w-3 h-3" />
                  {formatRelativeDateTime(item.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
            {isOwner ? (
              <>
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3.5">Statistiques</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-100 rounded-[14px] p-4">
                    <div className="text-[12px] text-gray-500 font-bold mb-1">Vues</div>
                    <div className="text-[22px] font-extrabold text-[#0F172A]">{item.viewsCount}</div>
                  </div>
                  <div className="bg-gray-100 rounded-[14px] p-4">
                    <div className="text-[12px] text-gray-500 font-bold mb-1">J'aime</div>
                    <div className="text-[22px] font-extrabold text-[#0F172A]">{item.likesCount}</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-3.5">Ajouter aux favoris</div>

                <div className="flex gap-2.5">
                  <button
                    onClick={() => onShowToast('❤️ Ajouté aux favoris !', 'success')}
                    className="flex-1 py-3 px-4 rounded-full border-2 border-[#2ECC8F] text-[#1DA870] font-bold bg-white cursor-pointer hover:bg-[#E8FAF3] transition-all duration-180 flex items-center justify-center gap-2"
                  >
                    <Heart className="w-4 h-4" />
                    Favori
                  </button>
                  <button
                    onClick={() => onShowToast('🔗 Lien copié !', '')}
                    className="flex-1 py-3 px-4 rounded-full bg-gray-100 text-gray-700 font-bold cursor-pointer hover:bg-gray-200 transition-all duration-180 flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Partager
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
