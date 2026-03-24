import React from 'react'
import { Home, Search, Plus, User, LogIn, LogOut } from 'lucide-react'
import type { AuthUserSession } from '../services/authToken'

interface SidebarProps {
  activeScreen: string
  onNavigate: (screen: string) => void
  isAuthenticated: boolean
  authUser: AuthUserSession | null
  onLogout: () => void
}

const getInitials = (fullName: string): string => {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export default function Sidebar({ activeScreen, onNavigate, isAuthenticated, authUser, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home, badge: null },
    { id: 'list', label: 'Explorer', icon: Search, badge: null },
    { id: 'publish', label: 'Publier', icon: Plus, badge: null },
  ]

  const userItems = [
    { id: 'profile', label: 'Profil', icon: User, badge: null },
    isAuthenticated
      ? { id: 'logout', label: 'Se déconnecter', icon: LogOut, badge: null }
      : { id: 'auth', label: 'Connexion', icon: LogIn, badge: null },
  ]

  const displayName = authUser?.fullName ?? 'Invité'
  const displayUniversity = authUser?.university ?? 'Non connecté'
  const displayInitials = authUser?.fullName ? getInitials(authUser.fullName) : '??'

  return (
    <aside className="fixed inset-y-0 left-0 z-30 w-[260px] bg-[#FFFFFF] border-r border-[#E5E7EB] p-5 flex flex-col gap-6 overflow-y-auto flex-shrink-0 max-lg:hidden">
      
      {/* Logo */}
      <div className="flex items-center gap-3 px-3 pb-6 border-b border-[#E5E7EB] mb-2">

        <div className="w-30 h-30 rounded-xl flex items-center justify-center overflow-hidden">
          <img 
            src="/images/logo.jpeg"
            alt="Wecoo logo"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="font-[Cabinet_Grotesk] font-extrabold text-xl text-[#1E63D6]">
          Wec<span className="text-[#F5C400]">coo</span>
        </div>

      </div>

      {/* Navigation */}
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2 mt-2">
        Navigation
      </div>

      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-medium text-[14.5px] relative ${
            activeScreen === item.id
              ? 'bg-[#E8F0FE] text-[#1E63D6] font-semibold'
              : 'text-[#1F2937] hover:bg-[#F3F4F6]'
          }`}
        >
          <item.icon className="w-[22px] h-[22px]" />
          {item.label}

          {item.badge && (
            <span className="ml-auto bg-[#F5C400] text-white text-[11px] font-bold rounded-full px-2 py-0.5">
              {item.badge}
            </span>
          )}
        </button>
      ))}

      {/* User Section */}
      <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-3 py-2 mt-4">
        Mon espace
      </div>

      {userItems.map((item) => (
        <button
          key={item.id}
          onClick={() => (item.id === 'logout' ? onLogout() : onNavigate(item.id))}
          className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 font-medium text-[14.5px] ${
            item.id === 'logout'
              ? 'text-rose-600 hover:bg-rose-50'
              : activeScreen === item.id
                ? 'bg-[#E8F0FE] text-[#1E63D6] font-semibold'
                : 'text-[#1F2937] hover:bg-[#F3F4F6]'
          }`}
        >
          <item.icon className="w-[22px] h-[22px]" />
          {item.label}
        </button>
      ))}

      {/* Footer User */}
      <div className="mt-auto pt-5 border-t border-[#E5E7EB]">
        <button 
          onClick={() => onNavigate(isAuthenticated ? 'profile' : 'auth')}
          className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-[#F3F4F6] w-full"
        >
          <div className="w-9 h-9 rounded-full bg-[#1E63D6] flex items-center justify-center text-base font-bold text-white">
            {displayInitials}
          </div>

          <div className="overflow-hidden">
            <div className="text-[13.5px] font-bold text-[#1F2937]">{displayName}</div>

            <div className="text-[11.5px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">
              {displayUniversity}
            </div>
          </div>
        </button>
      </div>

    </aside>
  )
}
