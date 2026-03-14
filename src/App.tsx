import { useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import Home from './pages/Home'
import ItemList from './pages/ItemList'
import ItemDetail from './pages/ItemDetail'
import Messages from './pages/Messages'
import Profile from './pages/Profile'
import PublishItem from './pages/PublishItem'
import Auth from './pages/Auth'
import type { AuthResponseDto, ItemResponseDto } from './dto'
import { fetchItems } from './services/itemApi'
import { registerItemView, toggleItemLike } from './services/itemApi'
import { clearAuthSession, getAuthToken, getAuthUser, setAuthUser as setAuthUserStorage } from './services/authToken'
import { fetchStats } from './services/statsApi'
import type { StatsResponseDto } from './dto'

type ScreenName = 'home' | 'list' | 'detail' | 'messages' | 'profile' | 'publish' | 'auth'

const getNotificationsEnabledKey = (userId: string) => `students_notifications_enabled_${userId}`
const getNotificationsLastSeenKey = (userId: string) => `students_notifications_last_seen_${userId}`

const getStoredNotificationsEnabled = (userId: string) => {
  const raw = localStorage.getItem(getNotificationsEnabledKey(userId))
  if (raw === null) return true
  return raw === 'true'
}

const setStoredNotificationsEnabled = (userId: string, enabled: boolean) => {
  localStorage.setItem(getNotificationsEnabledKey(userId), String(enabled))
}

const getStoredNotificationsLastSeen = (userId: string) => localStorage.getItem(getNotificationsLastSeenKey(userId))

const setStoredNotificationsLastSeen = (userId: string, iso: string) => {
  localStorage.setItem(getNotificationsLastSeenKey(userId), iso)
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenName>('home')
  const [authToken, setAuthToken] = useState(() => getAuthToken())
  const [authUser, setAuthUser] = useState(() => getAuthUser())
  const [items, setItems] = useState<ItemResponseDto[]>([])
  const [stats, setStats] = useState<StatsResponseDto | null>(null)
  const [likedItemIds, setLikedItemIds] = useState<Set<string>>(new Set())
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [isItemsLoading, setIsItemsLoading] = useState(true)
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: '' as 'success' | 'error' | ''
  })
  const isAuthenticated = Boolean(authToken && authUser)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    authUser?.id ? getStoredNotificationsEnabled(authUser.id) : true
  )
  const [notificationsLastSeenAt, setNotificationsLastSeenAt] = useState<string | null>(() =>
    authUser?.id ? getStoredNotificationsLastSeen(authUser.id) : null
  )

  const showToast = (message: string, type: string = '') => {
    setToast({ show: true, message, type: type as 'success' | 'error' | '' })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }))
  }

  const handleNavigate = (screen: string) => {
    const targetScreen = screen as ScreenName
    const protectedScreens: ScreenName[] = ['publish', 'messages', 'profile']

    if (!isAuthenticated && protectedScreens.includes(targetScreen)) {
      setActiveScreen('auth')
      showToast('Connecte-toi pour acceder a cette fonctionnalite.', 'error')
      window.scrollTo(0, 0)
      return
    }

    setActiveScreen(targetScreen)
    window.scrollTo(0, 0)
  }

  const loadItems = async () => {
    try {
      setIsItemsLoading(true)
      const response = await fetchItems()
      setItems(response.data)
      setSelectedItemId((currentItemId) => currentItemId ?? response.data[0]?.id ?? null)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Impossible de charger les objets.'
      showToast(message, 'error')
    } finally {
      setIsItemsLoading(false)
    }
  }

  const handleSelectItem = (itemId: string) => {
    setSelectedItemId(itemId)
    setActiveScreen('detail')
    window.scrollTo(0, 0)

    void (async () => {
      try {
        const response = await registerItemView(itemId)
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? response.data : item)))
      } catch {
        // view tracking should not block navigation
      }
    })()
  }

  const handleToggleLike = async (itemId: string) => {
    if (!isAuthenticated) {
      setActiveScreen('auth')
      showToast('Connecte-toi pour aimer un objet.', 'error')
      return
    }

    try {
      const response = await toggleItemLike(itemId)
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? response.data.item : item)))
      setLikedItemIds((currentLiked) => {
        const nextLiked = new Set(currentLiked)
        if (response.data.liked) {
          nextLiked.add(itemId)
        } else {
          nextLiked.delete(itemId)
        }
        return nextLiked
      })
      showToast(response.data.liked ? '❤️ Ajouté aux favoris !' : '💔 Retiré des favoris.', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Action impossible.'
      showToast(message, 'error')
    }
  }

  const handleAuthSuccess = (session: AuthResponseDto) => {
    setAuthToken(session.token)
    setAuthUser(session.user)
  }

  const handleAuthUserUpdated = (user: AuthResponseDto['user']) => {
    setAuthUser(user)
    setAuthUserStorage(user)
  }

  useEffect(() => {
    if (!authUser?.id) {
      setNotificationsEnabled(true)
      setNotificationsLastSeenAt(null)
      return
    }

    const enabled = getStoredNotificationsEnabled(authUser.id)
    setNotificationsEnabled(enabled)

    const existingLastSeen = getStoredNotificationsLastSeen(authUser.id)
    if (existingLastSeen) {
      setNotificationsLastSeenAt(existingLastSeen)
      return
    }

    const initialLastSeen = new Date().toISOString()
    setStoredNotificationsLastSeen(authUser.id, initialLastSeen)
    setNotificationsLastSeenAt(initialLastSeen)
  }, [authUser?.id])

  useEffect(() => {
    const userId = authUser?.id
    if (!userId) return

    const persistLastSeenNow = () => {
      const iso = new Date().toISOString()
      setStoredNotificationsLastSeen(userId, iso)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        persistLastSeenNow()
      }
    }

    window.addEventListener('beforeunload', persistLastSeenNow)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('beforeunload', persistLastSeenNow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [authUser?.id])

  useEffect(() => {
    const interval = window.setInterval(() => {
      void (async () => {
        try {
          const response = await fetchItems()
          setItems(response.data)
        } catch {
          // silent refresh
        }
      })()
    }, 60000)

    return () => window.clearInterval(interval)
  }, [])

  const notificationsUnreadCount = useMemo(() => {
    if (!isAuthenticated || !authUser?.id || !notificationsEnabled) return 0
    const lastSeenIso = notificationsLastSeenAt
    if (!lastSeenIso) return 0

    const lastSeen = new Date(lastSeenIso).getTime()
    if (!Number.isFinite(lastSeen)) return 0

    let count = 0
    for (const item of items) {
      if (item.ownerId === authUser.id) continue
      const created = new Date(item.createdAt).getTime()
      if (Number.isFinite(created) && created > lastSeen) {
        count += 1
      }
    }
    return count
  }, [authUser?.id, isAuthenticated, items, notificationsEnabled, notificationsLastSeenAt])

  const handleToggleNotifications = (enabled: boolean) => {
    if (!authUser?.id) return
    setNotificationsEnabled(enabled)
    setStoredNotificationsEnabled(authUser.id, enabled)
    if (enabled) {
      const iso = new Date().toISOString()
      setStoredNotificationsLastSeen(authUser.id, iso)
      setNotificationsLastSeenAt(iso)
    }
    showToast(enabled ? 'Notifications activées.' : 'Notifications désactivées.', 'success')
  }

  const markNotificationsAsRead = () => {
    if (!authUser?.id) return
    const newest = items.reduce<string | null>((acc, item) => {
      if (item.ownerId === authUser.id) return acc
      if (!acc) return item.createdAt
      return new Date(item.createdAt).getTime() > new Date(acc).getTime() ? item.createdAt : acc
    }, null)

    const iso = newest ?? new Date().toISOString()
    setStoredNotificationsLastSeen(authUser.id, iso)
    setNotificationsLastSeenAt(iso)
  }

  const handleOpenNotifications = () => {
    if (!authUser?.id) return
    if (!notificationsEnabled) {
      showToast('Notifications désactivées.', 'error')
      return
    }

    if (notificationsUnreadCount === 0) {
      showToast('Aucune nouvelle publication.', '')
      return
    }

    showToast(`${notificationsUnreadCount} nouvelle(s) publication(s) !`, 'success')
    markNotificationsAsRead()
    handleNavigate('list')
  }

  const handleLogout = () => {
    clearAuthSession()
    setAuthToken(null)
    setAuthUser(null)
    setLikedItemIds(new Set())
    setNotificationsEnabled(true)
    setNotificationsLastSeenAt(null)
    setActiveScreen('auth')
    showToast('Session fermee.', 'success')
  }

  useEffect(() => {
    const userId = authUser?.id
    if (!userId) {
      setLikedItemIds(new Set())
      return
    }

    const key = `students_liked_items_${userId}`
    const raw = localStorage.getItem(key)

    if (!raw) {
      setLikedItemIds(new Set())
      return
    }

    try {
      const parsed = JSON.parse(raw) as string[]
      setLikedItemIds(new Set(parsed))
    } catch {
      localStorage.removeItem(key)
      setLikedItemIds(new Set())
    }
  }, [authUser?.id])

  useEffect(() => {
    const userId = authUser?.id
    if (!userId) return
    const key = `students_liked_items_${userId}`
    localStorage.setItem(key, JSON.stringify(Array.from(likedItemIds)))
  }, [likedItemIds, authUser?.id])

  useEffect(() => {
    void loadItems()
  }, [])

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetchStats()
        setStats(response.data)
      } catch {
        // stats are optional; keep UI usable even if this fails
        setStats(null)
      }
    })()
  }, [])

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        showToast('🔍 Recherche rapide…', '')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return (
          <Home
            authUser={authUser}
            itemsCount={stats?.itemsCount ?? items.length}
            usersCount={stats?.usersCount ?? 0}
            notificationsEnabled={notificationsEnabled}
            notificationsUnreadCount={notificationsUnreadCount}
            items={items}
            likedItemIds={likedItemIds}
            isLoading={isItemsLoading}
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
            onToggleLike={handleToggleLike}
            onShowToast={showToast}
            onOpenNotifications={handleOpenNotifications}
          />
        )
      case 'list':
        return (
          <ItemList
            items={items}
            likedItemIds={likedItemIds}
            isLoading={isItemsLoading}
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
            onToggleLike={handleToggleLike}
            onShowToast={showToast}
          />
        )
      case 'detail':
        return (
          <ItemDetail
            authUser={authUser}
            item={items.find((item) => item.id === selectedItemId) ?? null}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )
      case 'messages':
        return (
          <Messages
            authUser={authUser}
            items={items}
            onNavigate={handleNavigate}
            onShowToast={showToast}
          />
        )
      case 'profile':
        return (
          <Profile
            authUser={authUser}
            items={items}
            notificationsEnabled={notificationsEnabled}
            onToggleNotifications={handleToggleNotifications}
            onAuthUserUpdated={handleAuthUserUpdated}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
            onShowToast={showToast}
          />
        )
      case 'publish':
        return (
          <PublishItem
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onItemCreated={(item) => {
              setItems((currentItems) => [item, ...currentItems])
              setSelectedItemId(item.id)
            }}
          />
        )
      case 'auth':
        return (
          <Auth
            onNavigate={handleNavigate}
            onShowToast={showToast}
            onAuthSuccess={handleAuthSuccess}
          />
        )
      default:
        return (
          <Home
            authUser={authUser}
            itemsCount={stats?.itemsCount ?? items.length}
            usersCount={stats?.usersCount ?? 0}
            notificationsEnabled={notificationsEnabled}
            notificationsUnreadCount={notificationsUnreadCount}
            items={items}
            likedItemIds={likedItemIds}
            isLoading={isItemsLoading}
            onNavigate={handleNavigate}
            onSelectItem={handleSelectItem}
            onToggleLike={handleToggleLike}
            onShowToast={showToast}
            onOpenNotifications={handleOpenNotifications}
          />
        )
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F0F7FF]">
      {/* Sidebar - Desktop */}
      <Sidebar
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        isAuthenticated={isAuthenticated}
        authUser={authUser}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        {renderScreen()}
      </main>

      {/* Bottom Nav - Mobile */}
      <BottomNav activeScreen={activeScreen} onNavigate={handleNavigate} />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  )
}
