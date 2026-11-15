'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface Conversation {
  id: string
  title: string
  timestamp: Date
  previewText: string
}

interface ChatSidebarProps {
  conversations: Conversation[]
  activeConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewChat: () => void
  onDeleteConversation: (id: string) => void
}

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
}: ChatSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const formatDate = (date: Date) => {
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="w-64 bg-white/50 border-r border-black/10 flex flex-col h-screen" style={{ backdropFilter: 'blur(8px)' }}>
      {/* Header */}
      <div className="p-4 border-b border-black/10">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white text-sm font-light hover:bg-black/90 transition-colors duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-xs text-black/40">No conversations yet</p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onMouseEnter={() => setHoveredId(conv.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="relative"
              >
                <button
                  onClick={() => onSelectConversation(conv.id)}
                  className={`w-full text-left p-3 rounded-lg mb-1 transition-all duration-200 group ${
                    activeConversationId === conv.id
                      ? 'bg-black/10 text-black'
                      : 'text-black/60 hover:bg-black/5'
                  }`}
                >
                  <p className="text-xs font-light truncate">{conv.title}</p>
                  <p className="text-xs text-black/40 mt-1 truncate">{conv.previewText}</p>
                  <p className="text-xs text-black/30 mt-1">{formatDate(conv.timestamp)}</p>
                </button>
                
                {hoveredId === conv.id && (
                  <button
                    onClick={() => onDeleteConversation(conv.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-black/40 hover:text-black/60 transition-colors"
                    title="Delete conversation"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-black/10 space-y-2">
        <Link
          href="/settings"
          className="flex items-center gap-2 text-xs text-black/60 hover:text-black transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
          </svg>
          Settings
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs text-black/60 hover:text-black transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>
    </div>
  )
}
