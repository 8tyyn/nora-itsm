'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from './chat-message'

export interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatAreaProps {
  messages: Message[]
  isLoading: boolean
}

export function ChatArea({ messages, isLoading }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {messages.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-full text-center py-12"
            style={{
              opacity: 1,
              animation: 'fadeIn 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
            }}
          >
            <div
              className="w-16 h-16 rounded-2xl bg-black/10 flex items-center justify-center mb-6"
              style={{
                opacity: 0,
                animation: 'fadeInScale 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s forwards',
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-light text-black mb-2">Ready to practice?</h2>
            <p className="text-sm text-black/50 max-w-sm">
              Start a mock interview, ask about specific topics, or get feedback on your answers. Your Astra coach is here to help.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                role={message.role}
                index={index}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
                <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-xs font-light text-black/60">
                  A
                </div>
                <div className="flex gap-1 pt-3">
                  <div className="w-2 h-2 rounded-full bg-black/40 animate-pulse" style={{ animationDelay: '0s' }} />
                  <div className="w-2 h-2 rounded-full bg-black/40 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 rounded-full bg-black/40 animate-pulse" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
