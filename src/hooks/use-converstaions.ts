import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/services/AuthService'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  timestamp: Date
  previewText: string
}

const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ''

async function apiJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${apiBaseUrl}${path}`, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    })
  } catch {
    throw new Error(`Cannot reach API (${apiBaseUrl}). Start the Flask server.`)
  }

  if (!res.ok) {
    let msg = 'Request failed'
    try {
      const data = await res.json()
      msg = data?.error || JSON.stringify(data)
    } catch {
      msg = await res.text()
    }
    throw new Error(msg || 'Request failed')
  }

  return (await res.json()) as T
}

export function useConversations() {
  const { token } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  // Load conversations from DB when authenticated
  useEffect(() => {
    if (!token) {
      setConversations([])
      setActiveConversationId(null)
      return
    }

    apiJson<
      Array<{ id: string; title: string | null; created_at: string | null; updated_at: string | null }>
    >('/api/conversations', token, { method: 'GET' })
      .then((rows) => {
        const mapped: Conversation[] = rows.map((c) => ({
          id: c.id,
          title: c.title || 'New Conversation',
          messages: [],
          timestamp: new Date(c.updated_at || c.created_at || Date.now()),
          previewText: 'Start chatting...',
        }))
        setConversations(mapped)
        if (!activeConversationId && mapped.length > 0) {
          setActiveConversationId(mapped[0].id)
        }
      })
      .catch((e) => {
        console.error('[v0] Error loading conversations:', e)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const generateTitle = useCallback((firstMessage: string): string => {
    const words = firstMessage.split(' ').slice(0, 5).join(' ')
    return words.length > 30 ? words.substring(0, 30) + '...' : words || 'New Conversation'
  }, [])

  const createConversation = useCallback(() => {
    if (!token) return null

    // Fire-and-forget create; we return null sync, caller can rely on state update
    apiJson<{ id: string; title: string }>(
      '/api/conversations',
      token,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Nouvelle conversation' }),
      }
    )
      .then((created) => {
        const newConversation: Conversation = {
          id: created.id,
          title: created.title || 'New Conversation',
          messages: [],
          timestamp: new Date(),
          previewText: 'Start chatting...',
        }
        setConversations((prev) => [newConversation, ...prev])
        setActiveConversationId(created.id)
      })
      .catch((e) => console.error('[v0] Error creating conversation:', e))

    return null
  }, [token])

  // Load messages when selecting a conversation
  useEffect(() => {
    if (!token || !activeConversationId) return
    apiJson<Array<{ id: string; role: 'user' | 'assistant'; content: string; created_at: string | null }>>(
      `/api/conversations/${activeConversationId}/messages`,
      token,
      { method: 'GET' }
    )
      .then((rows) => {
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== activeConversationId) return c
            const msgs: Message[] = rows.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: new Date(m.created_at || Date.now()),
            }))
            const last = msgs[msgs.length - 1]
            return {
              ...c,
              messages: msgs,
              previewText: last ? last.content.substring(0, 50) + (last.content.length > 50 ? '...' : '') : 'Start chatting...',
              timestamp: last ? last.timestamp : c.timestamp,
            }
          })
        )
      })
      .catch((e) => console.error('[v0] Error loading messages:', e))
  }, [token, activeConversationId])

  const addMessage = useCallback((conversationId: string, content: string, role: 'user' | 'assistant') => {
    setConversations(prev =>
      prev.map(conv => {
        if (conv.id === conversationId) {
          const newMessage: Message = {
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            content,
            role,
            timestamp: new Date(),
          }

          const updatedMessages = [...conv.messages, newMessage]
          const updatedConv = {
            ...conv,
            messages: updatedMessages,
            timestamp: new Date(),
            title:
              (conv.title === 'New Conversation' || conv.title === 'Nouvelle conversation') &&
              updatedMessages.length === 1
              ? generateTitle(content)
              : conv.title,
            previewText: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
          }
          
          return updatedConv
        }
        return conv
      })
    )
  }, [generateTitle])

  const deleteConversation = useCallback((conversationId: string) => {
    if (!token) return
    apiJson<{ ok: boolean }>(`/api/conversations/${conversationId}`, token, { method: 'DELETE' })
      .then(() => {
        setConversations((prev) => {
          const next = prev.filter((conv) => conv.id !== conversationId)
          if (activeConversationId === conversationId) {
            setActiveConversationId(next[0]?.id || null)
          }
          return next
        })
      })
      .catch((e) => console.error('[v0] Error deleting conversation:', e))
  }, [token, activeConversationId])

  const getCurrentConversation = useCallback((): Conversation | undefined => {
    return conversations.find(conv => conv.id === activeConversationId)
  }, [conversations, activeConversationId])

  return {
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessage,
    deleteConversation,
    getCurrentConversation,
  }
}
