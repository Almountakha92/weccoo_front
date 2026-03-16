import React from 'react'
import { Package, Users, ArrowRight, Plus, BookOpen, Laptop, Backpack, Shirt, Armchair, Gamepad2, Heart, MapPin, Search, Bell, BellOff } from 'lucide-react'
import type { AuthResponseDto, ItemResponseDto } from '../dto'

interface HomeProps {
  authUser: AuthResponseDto['user'] | null
  itemsCount: number
  usersCount: number
  notificationsEnabled: boolean
  notificationsUnreadCount: number
  items: ItemResponseDto[]
  likedItemIds: Set<string>
  isLoading: boolean
  onNavigate: (screen: string) => void
  onSelectItem: (itemId: string) => void
  onToggleLike: (itemId: string) => void
  onShowToast: (message: string, type?: string) => void
  onOpenNotifications: () => void
}

const categories = [
  { id: 'books', label: 'Livres', icon: BookOpen },
  { id: 'electronics', label: 'Électronique', icon: Laptop },
  { id: 'supplies', label: 'Fournitures', icon: Backpack },
  { id: 'clothes', label: 'Vêtements', icon: Shirt },
  { id: 'furniture', label: 'Meubles', icon: Armchair },
  { id: 'games', label: 'Loisirs', icon: Gamepad2 },
]

const getCategoryIcon = (category: string) => {
  const normalizedCategory = category.toLowerCase()

  if (normalizedCategory.includes('livre')) return BookOpen
  if (normalizedCategory.includes('electron')) return Laptop
  if (normalizedCategory.includes('fourniture')) return Backpack
  if (normalizedCategory.includes('vetement')) return Shirt
  if (normalizedCategory.includes('meuble')) return Armchair

  return Gamepad2
}

const matchesHomeCategory = (item: ItemResponseDto, activeCat: string) => {
  const category = item.category.toLowerCase()

  if (activeCat === 'books') return category.includes('livre') || category.includes('cours')
  if (activeCat === 'electronics') return category.includes('electron')
  if (activeCat === 'supplies') return category.includes('fourniture')
  if (activeCat === 'clothes') return category.includes('vetement')
  if (activeCat === 'furniture') return category.includes('meuble')
  if (activeCat === 'games') return category.includes('loisir') || category.includes('sport') || category.includes('jeu')

  return true
}

const typeBadgeClasses: Record<ItemResponseDto['type'], string> = {
  don: 'bg-[#F5C400] text-white',
  echange: 'bg-[#1E63D6] text-white',
  pret: 'bg-[#2ECC8F] text-white',
}

const cardBgClasses: Record<ItemResponseDto['type'], string> = {
  don: 'bg-[#FEF3C7]',
  echange: 'bg-[#DBEAFE]',
  pret: 'bg-[#D1FAE5]',
}

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

const getItemInitials = (title: string) => {
  const parts = title.split(' ').filter(Boolean).slice(0, 2)
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || '??'
}

const formatCount = (count: number) => new Intl.NumberFormat('fr-FR').format(count)

export default function Home({
  authUser,
  itemsCount,
  usersCount,
  notificationsEnabled,
  notificationsUnreadCount,
  items,
  likedItemIds,
  isLoading,
  onNavigate,
  onSelectItem,
  onToggleLike,
  onShowToast,
  onOpenNotifications,
}: HomeProps) {
  const [activeCat, setActiveCat] = React.useState('books')
  const filteredItems = items.filter((item) => matchesHomeCategory(item, activeCat))
  const recentItems = filteredItems.slice(0, 4)
  const myPublicationsCount = React.useMemo(() => {
    if (!authUser?.id) return 0
    let count = 0
    for (const item of items) {
      if (item.ownerId === authUser.id) count += 1
    }
    return count
  }, [authUser?.id, items])

  return (
<div className="bg-[#F8FAFC] min-h-screen p-9 max-lg:p-5 max-md:pb-24">
      {authUser && (
        <div className="flex justify-end mb-3">
          <button
            type="button"
            onClick={() => onOpenNotifications()}
            className="relative w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-[0_4px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-transform"
            title="Notifications"
          >
            {notificationsEnabled ? (
              <Bell className="w-5 h-5 text-[#0F172A]" />
            ) : (
              <BellOff className="w-5 h-5 text-gray-400" />
            )}
            {notificationsEnabled && notificationsUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-extrabold flex items-center justify-center">
                {notificationsUnreadCount > 99 ? '99+' : notificationsUnreadCount}
              </span>
            )}
          </button>
        </div>
      )}
      {/* Hero */}
      <div className="bg-[#1E63D6] rounded-[28px] p-12 flex items-center justify-between gap-10 mb-9 relative overflow-hidden max-md:flex-col max-md:p-8">
        {/* Background decoration */}
        <div className="absolute -top-16 -right-16 w-72 h-72 bg-[radial-gradient(circle,rgba(46,204,143,0.2)_0%,transparent_70%)] rounded-full" />
        
        <div className="flex-1 z-10 w-full">
          <div className="inline-flex items-center gap-1.5 bg-[rgba(46,204,143,0.18)] text-[#F5C400] border border-[rgba(46,204,143,0.3)] rounded-full px-4 py-2 text-sm font-bold mb-5">
            Plateforme d'échange entre étudiants
          </div>
          <h1 className="font-[Cabinet_Grotesk] text-[40px] font-extrabold text-white leading-[1.15] mb-4 max-md:text-[28px]">
            Échange, partage<br />
            <span className="text-[#F5C400]">économise</span><br />
            entre étudiants
          </h1>
          <p className="text-white/65 text-base leading-relaxed mb-8 max-w-[420px]">
            Rejoins ta communauté campus. Donne une seconde vie à tes affaires et trouve ce dont tu as besoin gratuitement.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => onNavigate('list')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[#F5C400] text-white font-bold text-sm hover:bg-[#E0AC00] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Search className="w-4 h-4" />
              Explorer les objets
            </button>
            <button 
              onClick={() => onNavigate('publish')}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/12 text-white border border-white/20 font-bold text-sm backdrop-blur-sm hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Proposer un objet
            </button>
          </div>
        </div>

        {/* Visual Illustration - Desktop only */}
        <div className="w-[260px] h-[220px] relative shrink-0 max-lg:hidden z-10">
          <div className="absolute w-[200px] h-[200px] top-2.5 left-7.5 rounded-full border border-white/10 bg-white/6" />
          <div className="absolute w-[120px] h-[120px] top-[60px] left-[100px] rounded-full border border-white/10 bg-white/6" />
          
          {/* Cards */}
          <div className="absolute top-0 left-0 w-[110px] bg-white/10 backdrop-blur-md border border-white/18 rounded-4 p-3.5 flex flex-col gap-1.5 transition-transform duration-300 hover:scale-[1.03]">
            <BookOpen className="w-7 h-7 text-white" />
            <div className="text-[11px] text-white/70 font-semibold">Physique Moderne</div>
            <div className="text-[10px] bg-[#F5C400] text-white rounded-full px-2 py-0.5 w-fit font-bold">Don</div>
          </div>
          
          <div className="absolute top-0 right-0 w-[110px] bg-white/10 backdrop-blur-md border border-white/18 rounded-4 p-3.5 flex flex-col gap-1.5 transition-transform duration-300 hover:scale-[1.03]">
            <Laptop className="w-7 h-7 text-white" />
            <div className="text-[11px] text-white/70 font-semibold">MacBook Pro</div>
            <div className="text-[10px] bg-[#1E63D6] text-white rounded-full px-2 py-0.5 w-fit font-bold">Échange</div>
          </div>
          
          <div className="absolute bottom-0 left-5 w-[110px] bg-white/10 backdrop-blur-md border border-white/18 rounded-4 p-3.5 flex flex-col gap-1.5 transition-transform duration-300 hover:scale-[1.03]">
            <Armchair className="w-7 h-7 text-white" />
            <div className="text-[11px] text-white/70 font-semibold">Bureau IKEA</div>
            <div className="text-[10px] bg-[#F5C400] text-white rounded-full px-2 py-0.5 w-fit font-bold">Prêt</div>
          </div>

          {/* Arrow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 bg-[#F5C400] rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(245,196,0,0.25)] animate-pulse">
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-9">
        <div className="bg-white rounded-[20px] p-6 flex items-center gap-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-transform duration-200">
          <div className="w-12 h-12 rounded-4 bg-[#FEF3C7] flex items-center justify-center">
            <Package className="w-6 h-6 text-[#F5C400]" />
          </div>
          <div>
            <div className="font-[Cabinet_Grotesk] text-[28px] font-extrabold text-[#0F172A]">{formatCount(itemsCount)}</div>
            <div className="text-[13px] text-gray-500 font-medium">Objets disponibles</div>
          </div>
        </div>
        <div className="bg-white rounded-[20px] p-6 flex items-center gap-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-transform duration-200">
          <div className="w-12 h-12 rounded-4 bg-[#DBEAFE] flex items-center justify-center">
            <Users className="w-6 h-6 text-[#1E63D6]" />
          </div>
          <div>
            <div className="font-[Cabinet_Grotesk] text-[28px] font-extrabold text-[#0F172A]">{formatCount(usersCount)}</div>
            <div className="text-[13px] text-gray-500 font-medium">Étudiants inscrits</div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="bg-white rounded-[20px] p-6 flex items-center gap-4 shadow-[0_4px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 transition-transform duration-200 sm:col-span-2 lg:col-span-1 cursor-pointer text-left"
          title="Voir mes publications"
        >
          <div className="w-12 h-12 rounded-4 bg-[#FEF3C7] flex items-center justify-center">
            <Plus className="w-6 h-6 text-[#F5C400]" />
          </div>
          <div>
            <div className="font-[Cabinet_Grotesk] text-[28px] font-extrabold text-[#0F172A]">{formatCount(myPublicationsCount)}</div>
            <div className="text-[13px] text-gray-500 font-medium">Mes publications</div>
          </div>
        </button>
      </div>

      {/* Categories */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Cabinet_Grotesk] text-xl font-extrabold text-[#0F172A]">Catégories populaires</h2>
      </div>
      <div className="flex flex-wrap gap-2.5 mb-7">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold cursor-pointer border-2 transition-all duration-180 ${
              activeCat === cat.id
                ? 'bg-[#FEF3C7] border-[#F5C400] text-[#F5C400]'
                : 'bg-white border-gray-200 text-gray-700 hover:border-[#F5C400] hover:text-[#F5C400]'
            }`}
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Recent Items */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-[Cabinet_Grotesk] text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Près de chez toi
        </h2>
        <button 
          onClick={() => onNavigate('list')}
          className="text-sm text-[#F5C400] font-bold hover:underline bg-transparent border-none cursor-pointer font-['Satoshi']"
        >
          Voir tout →
        </button>
      </div>
      
      <div className="grid grid-cols-4 gap-5 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
        {isLoading && <div className="text-sm text-gray-500">Chargement des objets...</div>}
        {!isLoading && recentItems.map((item) => {
          const Icon = getCategoryIcon(item.category)
          const isLiked = likedItemIds.has(item.id)
          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item.id)}
              className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.08)] cursor-pointer hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(15,23,42,0.12)] transition-all duration-220"
            >
              {/* Card Image */}
              <div className="h-[148px] bg-gray-100 relative flex items-center justify-center">
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
                    <div className={`absolute inset-0 ${cardBgClasses[item.type]} opacity-35`} />
                    <Icon className="w-12 h-12 text-gray-700" />
                  </>
                )}
                <div className={`absolute top-2.5 left-2.5 text-[11px] font-extrabold rounded-full px-2.5 py-1 uppercase tracking-wider ${typeBadgeClasses[item.type]}`}>
                  {item.type}
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); void onToggleLike(item.id) }}
                  className="absolute top-2.5 right-2.5 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-current' : 'text-gray-400'}`} />
                </button>
                <div className="absolute bottom-2.5 right-2.5 bg-white/90 text-[#0F172A] px-2 py-1 rounded-full text-[11px] font-extrabold shadow-[0_2px_10px_rgba(0,0,0,0.08)]">
                  {item.likesCount}
                </div>
              </div>
              
              {/* Card Body */}
              <div className="p-3.5 pb-4">
                <div className="text-sm font-bold text-[#0F172A] mb-1">{item.title}</div>
                <div className="text-xs text-gray-500 mb-2.5">{item.category} · {item.condition}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#A8EDD3] flex items-center justify-center text-[10px] font-bold text-[#1E63D6]">
                      {getItemInitials(item.title)}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">{formatRelativeDate(item.createdAt)}</div>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && recentItems.length === 0 && (
          <div className="text-sm text-gray-500">Aucun objet dans cette categorie.</div>
        )}
      </div>
    </div>
  )
}
