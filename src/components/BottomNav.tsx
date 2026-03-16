import React from 'react'
import { Home, Search, Plus, User } from 'lucide-react'

interface BottomNavProps {
  activeScreen: string
  onNavigate: (screen: string) => void
}

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'list', label: 'Explorer', icon: Search },
    { id: 'publish', label: 'Ajouter', icon: Plus },
    { id: 'profile', label: 'Profil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] pt-3 z-40 flex justify-around lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-1 cursor-pointer text-[11px] font-semibold transition-colors duration-180 ${
            activeScreen === item.id ? 'text-[#1E63D6]' : 'text-gray-500'
          }`}
        >
          <item.icon className="w-[22px] h-[22px]" />
          {item.label && <span>{item.label}</span>}
        </button>
      ))}
    </nav>
  )
}
