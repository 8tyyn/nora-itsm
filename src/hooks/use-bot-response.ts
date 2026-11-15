import { useState, useCallback, useRef } from 'react'
import type { Message } from './use-converstaions'
import { useAuth } from '@/services/AuthService'

type GenerateOptions = {
  history: Message[]
  interviewType?: 'rh' | 'technique' | 'mixte'
  jobTitle?: string
}

type ChatResponse = {
  reply: string
  conversation_id?: string
  error?: string
}

const apiBaseUrl =
  process.env.NEXT_PUBLIC_COACH_API_URL ?? ''

const toHistory = (messages: Message[]) =>
  messages.map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: message.content,
  }))

async function postJson<T>(path: string, payload: unknown, token: string): Promise<T> {
  let response: Response

  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error(
      `Impossible de joindre l'API (${apiBaseUrl}). Démarre le serveur Flask.`
    )
  }

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Erreur serveur')
  }

  return response.json() as Promise<T>
}

export function useBotResponse() {
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useAuth()

  // Track interview state across calls without causing re-renders
  const interviewState = useRef({
    inInterview: false,
    jobTitle: 'développeur',
    interviewType: 'mixte' as 'rh' | 'technique' | 'mixte',
  })

  const generateResponse = useCallback(
    async (
      userMessage: string,
      options: GenerateOptions & { conversationId?: string | null }
    ): Promise<{ reply: string; conversationId?: string }> => {
      setIsLoading(true)

      if (!token) {
        throw new Error('Not authenticated')
      }

      // Update context from options if provided
      if (options.jobTitle) {
        interviewState.current.jobTitle = options.jobTitle
      }
      if (options.interviewType) {
        interviewState.current.interviewType = options.interviewType
      }

      // Detect if user is starting or stopping an interview based on keywords
      const lowerMsg = userMessage.toLowerCase()

      const startKeywords = ['commencer', 'entraîner', 'entrainez', 'pratiquer',
        'simuler', 'simulation', 'start', 'begin', 'go', 'lance', 'démarre']
      const stopKeywords = ['stop', 'arrêter', 'arrête', 'fin', 'terminer',
        'termine', 'fini', 'merci', 'quit', 'exit']

      if (stopKeywords.some((k) => lowerMsg.includes(k))) {
        interviewState.current.inInterview = false
      }
      if (startKeywords.some((k) => lowerMsg.includes(k))) {
        interviewState.current.inInterview = true
      }

      try {
        const data = await postJson<ChatResponse>('/api/chat', {
          message: userMessage,
          conversation_id: options.conversationId ?? undefined,
          history: toHistory(options.history),
          context: {
            in_interview: interviewState.current.inInterview,
            job_title: interviewState.current.jobTitle,
            interview_type: interviewState.current.interviewType,
          },
        }, token)

        // If the bot's reply suggests interview started, update state
        const replyLower = data.reply.toLowerCase()
        if (
          replyLower.includes('première question') ||
          replyLower.includes('commençons') ||
          replyLower.includes('débutons') ||
          replyLower.includes('voici ma première')
        ) {
          interviewState.current.inInterview = true
        }

        return {
          reply: data.reply?.trim() || "Désolé, je n'ai pas compris. Pouvez-vous reformuler ?",
          conversationId: data.conversation_id,
        }
      } finally {
        setIsLoading(false)
      }
    },
    [token]
  )

  // Call this when user explicitly sets job title / interview type from UI
  const setInterviewContext = useCallback(
    (jobTitle: string, interviewType: 'rh' | 'technique' | 'mixte') => {
      interviewState.current.jobTitle = jobTitle
      interviewState.current.interviewType = interviewType
    },
    []
  )

  return { generateResponse, isLoading, setInterviewContext }
}