import React from 'react'
import { Search, Heart, MapPin, BookOpen, Laptop, Backpack, Shirt, Armchair, Gamepad2 } from 'lucide-react'
import type { ItemResponseDto } from '../dto'

interface ItemListProps {
  items: ItemResponseDto[]
  likedItemIds: Set<string>
  isLoading: boolean
  onNavigate: (screen: string) => void
  onSelectItem: (itemId: string) => void
  onToggleLike: (itemId: string) => void
  onShowToast: (message: string, type?: string) => void
}

const filters = [
  { id: 'all', label: 'Tout', active: true },
  { id: 'books', label: 'Livres', icon: BookOpen, active: false },
  { id: 'electronics', label: 'Électronique', icon: Laptop, active: false },
  { id: 'supplies', label: 'Fournitures', icon: Backpack, active: false },
  { id: 'clothes', label: 'Vêtements', icon: Shirt, active: false },
  { id: 'dons', label: 'Dons', active: false },
  { id: 'echanges', label: 'Échanges', active: false },
  { id: 'prets', label: 'Prêts', active: false },
  { id: 'nearby', label: '< 1 km', active: false },
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

const typeBadgeClasses: Record<ItemResponseDto['type'], string> = {
  don: 'bg-[#D1FAE5] text-[#065F46]',
  echange: 'bg-[#DBEAFE] text-[#1E40AF]',
  pret: 'bg-[#FEF3C7] text-[#92400E]',
}

const cardBgClasses: Record<ItemResponseDto['type'], string> = {
  don: 'bg-[#D1FAE5]',
  echange: 'bg-[#DBEAFE]',
  pret: 'bg-[#FEF3C7]',
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

const formatCount = (value: number) => new Intl.NumberFormat('fr-FR').format(value)

export default function ItemList({ items, likedItemIds, isLoading, onSelectItem, onToggleLike, onShowToast }: ItemListProps) {
  // ✅ Un seul filtre actif à la fois
  const [activeFilter, setActiveFilter] = React.useState<string>('all')
  const [searchQuery, setSearchQuery] = React.useState('')

  // ✅ Active le filtre cliqué et désactive les autres
  const toggleFilter = (filterId: string) => {
    setActiveFilter(filterId)
  }

  const filteredItems = items.filter((item) => {
    const query = searchQuery.trim().toLowerCase()
    const matchesQuery =
      query.length === 0 ||
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)

    if (!matchesQuery) {
      return false
    }

    if (activeFilter === 'all') {
      return true
    }

    if (activeFilter === 'dons') return item.type === 'don'
    if (activeFilter === 'echanges') return item.type === 'echange'
    if (activeFilter === 'prets') return item.type === 'pret'
    if (activeFilter === 'books') return item.category.toLowerCase().includes('livre')
    if (activeFilter === 'electronics') return item.category.toLowerCase().includes('electron')
    if (activeFilter === 'supplies') return item.category.toLowerCase().includes('fourniture')
    if (activeFilter === 'clothes') return item.category.toLowerCase().includes('vetement')

    return true
  })

  const count = filteredItems.length
  const countLabel = count <= 1 ? 'objet' : 'objets'

  return (
    <div className="bg-gray-100 min-h-screen p-9 max-lg:p-5 max-md:pb-24">
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-[Cabinet_Grotesk] text-[28px] font-extrabold text-[#0F172A] mb-1">Explorer les objets</h2>
        <p className="text-[14.5px] text-gray-500">
          {isLoading ? 'Chargement des objets...' : `${formatCount(count)} ${countLabel} disponibles autour de toi`}
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-green-300 rounded-[20px] p-6 mb-6 shadow-[0_4px_24px_rgba(15,23,42,0.08)]">
        {/* Search Bar */}
        <div className="flex items-center gap-3 bg-gray-100 rounded-full px-5 py-3 mb-4.5 border-2 border-transparent focus-within:border-[#1E63D6] focus-within:bg-white transition-all duration-180 mb-4">
          <Search className="w-5 h-5 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher un objet, une catégorie…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-[14.5px] text-[#0F172A] font-['Satoshi'] placeholder:text-gray-500"
          />
          <span className="hidden sm:inline text-gray-400 text-sm">⌘K</span>
        </div>

        {/* Filters */}
        <div className="w-full flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
          {filters.map((filter) => {
            const Icon = filter.icon
            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex shrink-0 items-center gap-1.5 px-4 py-1.75 rounded-full text-[13px] font-semibold cursor-pointer border-[1.5px] transition-all duration-180 font-['Satoshi'] whitespace-nowrap ${
                  activeFilter === filter.id
                    ? 'bg-[#1E63D6] border-[#1E63D6] text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-[#1E63D6] hover:text-[#1E63D6]'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {filter.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-4 gap-[18px] max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1">
        {isLoading && <div className="text-sm text-gray-500">Chargement des objets...</div>}
        {!isLoading && filteredItems.map((item) => {
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
                <div className="text-[14.5px] font-bold text-[#0F172A] mb-1">{item.title}</div>
                <div className="text-[12.5px] text-gray-500 mb-2.5">{item.category} · {item.condition}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-[22px] h-[22px] rounded-full bg-[#A8EDD3] flex items-center justify-center text-[10px] font-bold text-[#1DA870]">
                      {getItemInitials(item.title)}
                    </div>
                    <div className="text-[11.5px] text-gray-500 font-medium">{formatRelativeDate(item.createdAt)}</div>
                  </div>
                  <div className="text-[11.5px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {!isLoading && filteredItems.length === 0 && <div className="text-sm text-gray-500">Aucun resultat.</div>}
      </div>
    </div>
  )
}
