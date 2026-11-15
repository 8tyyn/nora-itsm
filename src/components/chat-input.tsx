'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading: boolean
  onUploadFile?: (file: File) => Promise<void>
}

export function ChatInput({ onSendMessage, isLoading, onUploadFile }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!onUploadFile || isLoading) return
    setUploadingFileName(file.name)
    try {
      await onUploadFile(file)
      toast.success(`File uploaded: ${file.name}`)
    } catch (error: any) {
      toast.error(error?.message || 'File upload failed')
    } finally {
      setUploadingFileName(null)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      await handleFileUpload(file)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFileUpload(file)
      e.target.value = ''
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 p-4 border-t border-black/10 bg-white"
    >
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed px-4 py-3 text-sm transition-colors cursor-pointer ${
          isDragging ? 'border-black bg-black/5' : 'border-black/10 bg-white/50 hover:bg-black/5'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md"
          className="hidden"
          onChange={handleFileInputChange}
        />
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-medium text-black">Drop a file here</p>
            <p className="text-xs text-black/50">PDF, TXT or MD — click or drag to add a document to RAG</p>
          </div>
          <div className="text-xs text-black/60 text-right">
            {uploadingFileName ? (
              <span>Uploading {uploadingFileName}...</span>
            ) : (
              <span>Attach document</span>
            )}
          </div>
        </div>
      </div>

      <div
        className={`flex items-end gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
          isFocused
            ? 'border-black/30 bg-white shadow-lg shadow-black/5'
            : 'border-black/10 bg-white/50'
        }`}
        style={{
          backdropFilter: 'blur(8px)',
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Ask me anything about interviews..."
          rows={1}
          className="flex-1 bg-transparent outline-none text-sm resize-none max-h-[120px]"
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="flex-shrink-0 w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.99 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.01 C3.34915502,0.9 2.40734225,1.00636533 1.77946707,1.4776575 C0.994623095,2.10604706 0.837654326,3.0486314 1.15159189,3.99 L3.03521743,10.4310031 C3.03521743,10.5881005 3.34915502,10.5881005 3.50612381,10.5881005 L16.6915026,11.3735874 C16.6915026,11.3735874 17.1624089,11.3735874 17.1624089,11.7301587 L17.1624089,12.0868299 C17.1624089,12.4744748 16.6915026,12.4744748 16.6915026,12.4744748 Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <p className="text-xs text-black/40 text-center">
        Astra is your interview coach. Ask questions, practice scenarios, or get feedback.
      </p>
    </form>
  )
}
