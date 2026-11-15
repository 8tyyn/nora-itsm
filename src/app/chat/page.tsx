"use client"

import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowUp, Bot, FileText, Menu, Paperclip, Plus, Search, ShieldCheck, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

const suggestions = [
  "Where should I assign a VPN access incident?",
  "Help me troubleshoot a locked account",
  "What information should I ask the requester?",
]

type Conversation = { id: string; title: string | null; updated_at: string | null }
type ChatMessage = { id?: string; role: "user" | "assistant"; text: string }

function formatInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} className="font-semibold text-[#1d2825]">{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

function StructuredReply({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")
  const isWriting = displayedText.length < text.length

  useEffect(() => {
    setDisplayedText("")
    let characterIndex = 0
    let typingTimer: number | undefined
    const startTimer = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        characterIndex += 1
        setDisplayedText(text.slice(0, characterIndex))
        if (characterIndex >= text.length) window.clearInterval(typingTimer)
      }, 18)
    }, 180)

    return () => {
      window.clearTimeout(startTimer)
      if (typingTimer !== undefined) window.clearInterval(typingTimer)
    }
  }, [text])

  const lines = displayedText.split("\n")
  const content: ReactNode[] = []
  let tableRows: string[][] = []

  const flushTable = () => {
    if (tableRows.length === 0) return
    const rows = tableRows.filter((row) => !row.every((cell) => /^[-: ]+$/.test(cell)))
    content.push(
      <div key={`table-${content.length}`} className="my-3 overflow-x-auto rounded-xl border border-[#dce5dd]">
        <table className="w-full min-w-[480px] border-collapse text-left text-xs">
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? "bg-[#f1f6f1] font-medium" : "border-t border-[#e7eee8]"}>
                {row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-2 align-top">{formatInline(cell.trim())}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    )
    tableRows = []
  }

  lines.forEach((line, index) => {
    const trimmedLine = line.trim()
    if (trimmedLine.startsWith("|") && trimmedLine.endsWith("|")) {
      tableRows.push(trimmedLine.slice(1, -1).split("|"))
      if (index === lines.length - 1 && !isWriting) flushTable()
      return
    }
    flushTable()
    if (!trimmedLine) {
      content.push(<div key={`space-${index}`} className="h-2" />)
    } else if (/^#{1,3}\s/.test(trimmedLine)) {
      content.push(<h3 key={index} className="mt-3 font-semibold text-[#1d2825]">{formatInline(trimmedLine.replace(/^#{1,3}\s/, ""))}</h3>)
    } else if (/^[-*]\s/.test(trimmedLine)) {
      content.push(<div key={index} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6b8d75]" /><span>{formatInline(trimmedLine.replace(/^[-*]\s/, ""))}</span></div>)
    } else if (/^\d+[.)]\s/.test(trimmedLine)) {
      const match = trimmedLine.match(/^(\d+)[.)]\s(.*)$/)
      content.push(<div key={index} className="flex gap-2"><span className="font-medium text-[#547660]">{match?.[1]}.</span><span>{formatInline(match?.[2] || trimmedLine)}</span></div>)
    } else {
      content.push(<p key={index} className="mb-2 last:mb-0">{formatInline(line)}</p>)
    }
  })
  flushTable()

  return <div className="relative">{content}{isWriting && <span className="ml-1 inline-block h-4 w-1.5 translate-y-0.5 bg-[#547660] animate-pulse" />}</div>
}

export default function ChatPage() {
  return <ProtectedRoute allowedRoles={["user", "admin"]}><ChatWorkspace /></ProtectedRoute>
}

function ChatWorkspace() {
  const { token, user, logout } = useAuth()
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const initials = (user?.name || user?.email || "N").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  const apiUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""

  useEffect(() => {
    if (!token) return
    fetch(`${apiUrl}/api/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data?.error || "Unable to load conversations")
        setConversations(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load conversations"))
  }, [apiUrl, token])

  async function selectConversation(id: string) {
    if (!token) return
    setError("")
    const response = await fetch(`${apiUrl}/api/conversations/${id}/messages`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) {
      setError(data?.error || "Unable to load conversation")
      return
    }
    setConversationId(id)
    setMessages(data.map((item: { id: string; role: "user" | "assistant"; content: string }) => ({ id: item.id, role: item.role, text: item.content })))
  }

  function startConversation() {
    setConversationId(null)
    setMessages([])
    setError("")
  }

  async function uploadDocument(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file || !token) return
    setIsUploading(true)
    setError("")
    try {
      const formData = new FormData()
      formData.append("file", file)
      const response = await fetch(`${apiUrl}/api/rag/upload`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Unable to upload document")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload document")
    } finally {
      setIsUploading(false)
      event.target.value = ""
    }
  }

  async function sendMessage() {
    const trimmed = message.trim()
    if (!trimmed || !token || isSending) return
    setError("")
    setMessages((current) => [...current, { role: "user", text: trimmed }])
    setMessage("")
    setIsSending(true)
    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: trimmed, conversation_id: conversationId }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || data?.reply || "Unable to send message")
      setConversationId(data.conversation_id)
      setConversations((current) => {
        const existing = current.find((conversation) => conversation.id === data.conversation_id)
        if (existing) return current.map((conversation) => conversation.id === existing.id ? { ...conversation, title: trimmed } : conversation)
        return [{ id: data.conversation_id, title: trimmed, updated_at: new Date().toISOString() }, ...current]
      })
      setMessages((current) => [...current, { role: "assistant", text: data.reply }])
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", text: error instanceof Error ? error.message : "Unable to send message" }])
    } finally {
      setIsSending(false)
    }

  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2825]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#dfe5df] bg-white/80 px-5 py-6 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 flex items-center gap-2 px-3"><span className="font-display text-2xl tracking-tight">NORA</span><span className="font-mono text-[10px] text-[#738079]">WORKSPACE</span></Link>
        <Button onClick={startConversation} variant="outline" className="mb-7 justify-start gap-2 rounded-xl border-[#cfd9d1] bg-white"><Plus className="h-4 w-4" /> New conversation</Button>
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7b8880]">Recent conversations</p>
        <div className="space-y-1 text-sm">{conversations.length === 0 ? <p className="px-3 py-3 text-xs text-[#87938b]">No conversations yet.</p> : conversations.map((conversation) => <button key={conversation.id} onClick={() => selectConversation(conversation.id)} className={`w-full rounded-xl px-3 py-3 text-left hover:bg-[#f2f5f1] ${conversation.id === conversationId ? "bg-[#edf2ed]" : "text-[#6c7972]"}`}>{conversation.title || "Untitled conversation"}</button>)}</div>
        <div className="mt-auto rounded-2xl border border-[#dfe5df] bg-[#f7faf7] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-[#537c63]" /> NORA is grounded</div><p className="text-xs leading-5 text-[#728078]">Responses are sourced from your approved ServiceNow knowledge base.</p></div>
      </aside>
      <section className="flex min-h-screen flex-col lg:ml-72">
        <header className="flex h-20 items-center justify-between border-b border-[#dfe5df] bg-white/70 px-5 backdrop-blur md:px-10"><div className="flex items-center gap-3"><button className="lg:hidden"><Menu className="h-5 w-5" /></button><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">NORA assistant</p><h1 className="text-lg font-medium">IT support workspace</h1></div></div><div className="flex items-center gap-3"><Button variant="ghost" size="icon" aria-label="Search"><Search className="h-4 w-4" /></Button>{user?.role === "admin" && <Link href="/admin" className="hidden text-sm text-[#68756d] hover:text-[#1d2825] sm:block">Admin console</Link>}<Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dbe8dc] text-sm font-medium" aria-label="Open profile">{initials}</Link><button onClick={logout} className="hidden text-sm text-[#68756d] hover:text-[#1d2825] sm:block">Disconnect</button></div></header>
        <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-5 py-10 md:px-10"><div className="mb-10"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183b2b] text-white shadow-sm"><Sparkles className="h-5 w-5" /></div><h2 className="font-display text-4xl tracking-tight md:text-5xl">How can NORA help?</h2><p className="mt-3 max-w-xl text-[#6f7c74]">Ask about incident routing, troubleshooting steps, required details, or the right ServiceNow knowledge article.</p></div>
          {error && <p className="mb-3 text-sm text-red-700">{error}</p>}
          {messages.length === 0 ? <div className="grid gap-3 sm:grid-cols-3">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => setMessage(suggestion)} className="rounded-2xl border border-[#d9e2da] bg-white p-4 text-left text-sm leading-5 transition hover:-translate-y-0.5 hover:border-[#91ad98] hover:shadow-sm">{suggestion}<ArrowUp className="mt-6 h-4 w-4 rotate-45 text-[#6b8d75]" /></button>)}</div> : <div className="space-y-6 pb-10">{messages.map((item, index) => <div key={item.id || index} className={`flex gap-3 ${item.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-2xl rounded-2xl px-5 py-4 text-sm leading-6 ${item.role === "user" ? "bg-[#183b2b] text-white" : "border border-[#dce5dd] bg-white"}`}>{item.role === "assistant" && <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[#547660]"><Bot className="h-4 w-4" /> NORA</div>}{item.role === "assistant" ? <StructuredReply text={item.text} /> : item.text}</div></div>)}</div>}
          <div className="mt-auto pt-10"><div className="rounded-2xl border border-[#cfdad0] bg-white p-2 shadow-sm"><textarea value={message} onChange={(event) => setMessage(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) { event.preventDefault(); sendMessage() } }} placeholder="Describe the incident or ask a question..." className="min-h-20 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-[#98a39c]" aria-label="Message NORA" /><div className="flex items-center justify-between px-2 pb-1"><div className="flex items-center gap-1"><input ref={fileInputRef} type="file" accept=".pdf,.txt,.md,.csv,.json,.log" onChange={uploadDocument} className="hidden" /><Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="sm" disabled={isUploading} className="gap-2 text-[#6e7b73]"><Paperclip className="h-4 w-4" /> {isUploading ? "Uploading..." : "Attach file"}</Button><span className="hidden items-center gap-1 text-xs text-[#9aa59e] sm:flex"><FileText className="h-3 w-3" /> PDF, MD, TXT</span></div>          <Button onClick={sendMessage} disabled={isSending} size="icon" className="h-9 w-9 rounded-xl bg-[#183b2b] hover:bg-[#28543e]" aria-label="Send message"><ArrowUp className="h-4 w-4" /></Button></div></div><p className="mt-3 text-center text-[11px] text-[#8a968e]">NORA can make mistakes. Verify critical decisions against current ServiceNow policies.</p></div>
        </div>
      </section>
    </main>
  )
}
