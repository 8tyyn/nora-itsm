'use client'

import { useEffect, useState } from 'react'

interface ChatMessageProps {
  content: string
  role: 'user' | 'assistant'
  index: number
}

export function ChatMessage({ content, role, index }: ChatMessageProps) {
  const [displayedText, setDisplayedText] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const isBot = role === 'assistant'

  // Fade-in animation trigger
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Typing animation for bot messages
  useEffect(() => {
    if (!isBot) {
      setDisplayedText(content)
      return
    }

    let currentIndex = 0
    const typingInterval = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedText(content.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, 20) // Adjust typing speed here (20ms per character)

    return () => clearInterval(typingInterval)
  }, [content, isBot])

  return (
    <div
      className={`flex gap-3 animate-in fade-in slide-in-from-bottom-3 duration-500`}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: isVisible ? 'blur(0px)' : 'blur(8px)',
        transform: isVisible ? 'translateY(0px)' : 'translateY(16px)',
        transition: 'opacity 0.5s cubic-bezier(0.16,1,0.3,1), filter 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)',
        transitionDelay: `${index * 50}ms`,
      }}
    >
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-light flex-shrink-0 ${
        isBot 
          ? 'bg-black/10 text-black/60' 
          : 'bg-black text-white'
      }`}>
        {isBot ? 'A' : 'Y'}
      </div>

      {/* Message content */}
      <div className={`flex-1 pt-1 ${isBot ? 'text-black/70' : 'text-black'}`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {displayedText}
          {isBot && displayedText.length < content.length && (
            <span className="inline-block w-1.5 h-4 ml-1 bg-black/60 animate-pulse" />
          )}
        </p>
      </div>
    </div>
  )
}
