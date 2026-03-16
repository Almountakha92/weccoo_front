import React from 'react'
import { Search, Send, Circle } from 'lucide-react'
import type { ConversationResponseDto, ItemResponseDto, MessageResponseDto } from '../dto'
import type { AuthUserSession } from '../services/authToken'
import { fetchConversationMessages, fetchConversations, sendMessage as sendMessageApi } from '../services/messageApi'

interface MessagesProps {
  authUser: AuthUserSession | null
  items: ItemResponseDto[]
  onNavigate: (screen: string) => void
  onShowToast: (message: string, type?: string) => void
}

const avatarClasses = ['bg-[#A8EDD3] text-[#1DA870]', 'bg-[#BFDBFE] text-[#1E40AF]', 'bg-[#FDE68A] text-[#92400E]', 'bg-[#DDD6FE] text-white']

export default function Messages({ authUser, items, onShowToast }: MessagesProps) {
  const [conversations, setConversations] = React.useState<ConversationResponseDto[]>([])
  const [activeConv, setActiveConv] = React.useState<string | null>(null)
  const [messageInput, setMessageInput] = React.useState('')
  const [messages, setMessages] = React.useState<MessageResponseDto[]>([])

  React.useEffect(() => {
    if (!authUser) {
      return
    }

    const loadConversations = async () => {
      try {
        const response = await fetchConversations(authUser.id)
        setConversations(response.data)
        setActiveConv(response.data[0]?.id ?? null)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Impossible de charger les conversations.'
        onShowToast(message, 'error')
      }
    }

    void loadConversations()
  }, [authUser, onShowToast])

  React.useEffect(() => {
    if (!activeConv) {
      setMessages([])
      return
    }

    const loadMessages = async () => {
      try {
        const response = await fetchConversationMessages(activeConv)
        setMessages(response.data)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Impossible de charger les messages.'
        onShowToast(message, 'error')
      }
    }

    void loadMessages()
  }, [activeConv, onShowToast])

  const currentConv = conversations.find((conversation) => conversation.id === activeConv) ?? null
  const currentItem = items.find((item) => item.id === currentConv?.itemId) ?? null

  const sendMessage = async () => {
    if (!messageInput.trim() || !activeConv) return

    try {
      const response = await sendMessageApi(activeConv, { text: messageInput.trim() })
      setMessages((currentMessages) => [...currentMessages, response.data])
      setMessageInput('')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Envoi impossible.'
      onShowToast(message, 'error')
    }
  }

  return (
    <div className="bg-gray-100 flex min-h-[100dvh] lg:h-screen max-md:pb-24">
      {/* Sidebar */}
      <div className="w-[320px] bg-white border-r border-gray-100 flex flex-col h-full shrink-0 max-lg:hidden">
        <div className="p-7 pb-5 border-b border-gray-100">
          <h2 className="font-[Cabinet_Grotesk] text-[22px] font-extrabold mb-3.5">Messages</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2.25">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Rechercher une conversation…"
              className="flex-1 bg-transparent border-none outline-none text-[13.5px] text-[#0F172A] font-['Satoshi']"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => {
            const conversationItem = items.find((item) => item.id === conv.itemId)

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv.id)}
                className={`w-full flex items-center gap-3.5 p-4 cursor-pointer transition-all duration-180 border-b border-gray-100 relative ${
                  activeConv === conv.id ? 'bg-[#E8FAF3]' : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarClasses[conv.id.length % avatarClasses.length]}`}>
                    {conv.participantIds.find((participantId) => participantId !== authUser?.id)?.slice(0, 2).toUpperCase() ?? '??'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold text-[#0F172A] mb-0.5">{conversationItem?.title ?? `Conversation ${conv.id.slice(0, 6)}`}</div>
                  <div className="text-[12.5px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis">Objet: {conv.itemId}</div>
                </div>
                <div className="text-[11.5px] text-gray-400 shrink-0">{new Date(conv.createdAt).toLocaleDateString('fr-FR')}</div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#F8FFFE]">
        {/* Conversations (mobile) */}
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto">
          <div className="flex items-center gap-2.5">
            {conversations.map((conv) => {
              const isActive = activeConv === conv.id
              const conversationItem = items.find((item) => item.id === conv.itemId)
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConv(conv.id)}
                  className={`shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border text-[12.5px] font-bold transition-colors ${
                    isActive
                      ? 'bg-[#E8FAF3] border-[#2ECC8F] text-[#1DA870]'
                      : 'bg-white border-gray-200 text-gray-600'
                  }`}
                  title={conversationItem?.title ?? `Conversation ${conv.id.slice(0, 6)}`}
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-extrabold ${avatarClasses[conv.id.length % avatarClasses.length]}`}>
                    {conv.participantIds.find((participantId) => participantId !== authUser?.id)?.slice(0, 2).toUpperCase() ?? '??'}
                  </span>
                  <span className="max-w-[160px] truncate">
                    {conversationItem?.title ?? `Conv. ${conv.id.slice(0, 6)}`}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 bg-white border-b border-gray-100 flex items-center gap-3.5">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarClasses[0]}`}>
            {currentConv?.participantIds.find((participantId) => participantId !== authUser?.id)?.slice(0, 2).toUpperCase() ?? '??'}
          </div>
          <div className="flex-1">
            <div className="text-base font-extrabold text-[#0F172A]">{currentItem?.title ?? 'Conversation'}</div>
            <div className="text-[12.5px] text-[#2ECC8F] font-semibold flex items-center gap-1">
              <Circle className="w-2 h-2 fill-current" />
              Conversation active
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 bg-[#E8FAF3] rounded-[12px] text-[13px] text-[#1DA870] font-semibold">
            <span>{currentItem?.category ?? 'Objet'}</span>
            <span className="bg-[#D1FAE5] text-[#065F46] px-2 py-0.5 rounded-[10px] text-[11px]">{currentItem?.type ?? 'n/a'}</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-7 flex flex-col gap-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col gap-1 ${msg.senderId === authUser?.id ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] sm:max-w-[68%] px-4 py-3 rounded-[20px] text-[14px] leading-relaxed ${
                  msg.senderId === authUser?.id
                    ? 'bg-[#2ECC8F] text-white rounded-br-[6px]'
                    : 'bg-white text-[#0F172A] rounded-bl-[6px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
                }`}
              >
                {msg.text}
              </div>
              <div className="text-[11px] text-gray-400 px-1">{new Date(msg.sentAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 sm:p-5 bg-white border-t border-gray-100 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2.5 bg-gray-100 rounded-full px-5 py-3 border-2 border-transparent focus-within:border-[#2ECC8F] focus-within:bg-white transition-all duration-180">
            <input
              type="text"
              placeholder="Écris un message…"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-transparent border-none outline-none text-[14px] text-[#0F172A] font-['Satoshi']"
            />
          </div>
          <button
            onClick={sendMessage}
            className="w-11 h-11 rounded-full bg-[#2ECC8F] text-white border-none cursor-pointer flex items-center justify-center shadow-[0_8px_32px_rgba(46,204,143,0.25)] hover:bg-[#1DA870] hover:scale-108 transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
