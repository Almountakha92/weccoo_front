import React from 'react'
import { Home, Search, Plus, MessageSquare, User } from 'lucide-react'

interface BottomNavProps {
  activeScreen: string
  onNavigate: (screen: string) => void
}

export default function BottomNav({ activeScreen, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'list', label: 'Explorer', icon: Search },
    { id: 'publish', label: '', icon: Plus, isAction: true },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
    { id: 'profile', label: 'Profil', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 pb-5 pt-3 z-40 flex justify-around lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex flex-col items-center gap-1 cursor-pointer text-[11px] font-semibold transition-colors duration-180 ${
            activeScreen === item.id ? 'text-[#1DA870]' : 'text-gray-500'
          }`}
          style={item.isAction ? { position: 'relative' } : {}}
        >
          {item.isAction ? (
            <div className="w-13 h-13 bg-[#2ECC8F] rounded-full flex items-center justify-center text-[26px] -mt-5 shadow-[0_8px_32px_rgba(46,204,143,0.25)] border-4 border-white">
              <Plus className="w-6 h-6 text-white" />
            </div>
          ) : (
            <item.icon className="w-[22px] h-[22px]" />
          )}
          {item.label && <span>{item.label}</span>}
        </button>
      ))}
    </nav>
  )
}
