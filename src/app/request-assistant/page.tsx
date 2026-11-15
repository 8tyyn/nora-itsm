"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, ArrowUp, Bot, CheckCircle2, ClipboardList, Menu, RotateCcw, ShieldCheck, Sparkles } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

const requestTypes = [
  { value: "general", label: "General request", description: "Questions, information, or support" },
  { value: "add", label: "Add", description: "Create or provision something" },
  { value: "modify", label: "Modify", description: "Change an existing service or access" },
  { value: "delete", label: "Delete", description: "Remove access, data, or a service" },
]

const initialForm = { type: "general", requester: "", description: "" }
const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""

export default function RequestAssistantPage() {
  return <ProtectedRoute allowedRoles={["client", "admin"]}><RequestAssistantContent /></ProtectedRoute>
}

function RequestAssistantContent() {
  const { token } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [isGenerating, setIsGenerating] = useState(false)
  const [response, setResponse] = useState("")
  const [displayedResponse, setDisplayedResponse] = useState("")
  const [error, setError] = useState("")

  function updateField(field: keyof typeof initialForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }))
    setResponse("")
    setError("")
  }

  useEffect(() => {
    if (!response) {
      setDisplayedResponse("")
      return
    }

    setDisplayedResponse("")
    let characterIndex = 0
    const timer = window.setInterval(() => {
      characterIndex += 1
      setDisplayedResponse(response.slice(0, characterIndex))
      if (characterIndex >= response.length) window.clearInterval(timer)
    }, 18)

    return () => window.clearInterval(timer)
  }, [response])

  async function askAssistant() {
    if (!form.description.trim() || !token) return
    setIsGenerating(true)
    setResponse("")
    setDisplayedResponse("")
    setError("")
    try {
      const apiResponse = await fetch(`${apiBaseUrl}/api/client/request-assistant`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          question: form.description,
          requester: form.requester,
          request_type: form.type,
        }),
      })
      const data = await apiResponse.json()
      if (!apiResponse.ok) throw new Error(data?.error || "Unable to get an answer")
      if (typeof data?.reply !== "string" || !data.reply.trim()) {
        throw new Error("The API returned no reply.")
      }
      setResponse(data.reply)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to get an answer")
    } finally {
      setIsGenerating(false)
    }
  }

  function clearForm() {
    setForm(initialForm)
    setResponse("")
    setError("")
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2825]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#dfe5df] bg-white/80 px-5 py-6 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 flex items-center gap-2 px-3"><span className="font-display text-2xl tracking-tight">NORA</span><span className="font-mono text-[10px] text-[#738079]">WORKSPACE</span></Link>
        <Link href="/chat" className="mb-7 flex items-center gap-2 px-3 text-sm text-[#6c7972] hover:text-[#183b2b]"><ArrowLeft className="h-4 w-4" /> Back to assistant</Link>
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7b8880]">Workflows</p>
        <div className="flex flex-col gap-1 text-sm"><Link href="/chat" className="rounded-xl px-3 py-3 text-[#6c7972] hover:bg-[#f2f5f1]">Ask NORA</Link><Link href="/ticket-assistant" className="rounded-xl px-3 py-3 text-[#6c7972] hover:bg-[#f2f5f1]">Create incident guidance</Link><div className="rounded-xl bg-[#edf2ed] px-3 py-3 font-medium">Prepare a request</div></div>
        <div className="mt-auto rounded-2xl border border-[#dfe5df] bg-[#f7faf7] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-[#537c63]" /> NORA is grounded</div><p className="text-xs leading-5 text-[#728078]">Your request is analyzed against approved ServiceNow knowledge.</p></div>
      </aside>

      <section className="min-h-screen lg:ml-72">
        <header className="flex h-20 items-center justify-between border-b border-[#dfe5df] bg-white/70 px-5 backdrop-blur md:px-10"><div className="flex items-center gap-3"><button className="lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">NORA assistant</p><h1 className="text-lg font-medium">Request preparation</h1></div></div><Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dbe8dc] text-sm font-medium" aria-label="Open profile">AM</Link></header>
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
          <div className="mb-10 max-w-3xl"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183b2b] text-white shadow-sm"><Sparkles className="h-5 w-5" /></div><p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b8d75]">Before you contact helpdesk</p><h2 className="font-display text-4xl tracking-tight md:text-5xl">Start with a clearer request.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#6f7c74]">Tell NORA what you need and who it is for. It will turn your notes into a structured ServiceNow ticket with the right details and next steps.</p></div>
          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-3xl border border-[#d9e2da] bg-white p-6 shadow-sm md:p-8"><div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-xl font-medium">Request details</h3><p className="mt-1 text-sm text-[#7b8880]">A few details help NORA prepare the right ticket.</p></div><span className="rounded-full bg-[#edf5ee] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#547660]">2 required fields</span></div>
              <div className="flex flex-col gap-7">
                <fieldset><legend className="mb-3 text-sm font-medium">What type of request is this?</legend><div className="grid gap-3 sm:grid-cols-2">{requestTypes.map((item) => <button key={item.value} type="button" onClick={() => updateField("type", item.value)} className={`rounded-2xl border p-4 text-left transition ${form.type === item.value ? "border-[#6f997b] bg-[#edf5ee] ring-2 ring-[#dce9de]" : "border-[#d5dfd6] bg-[#fbfcfa] hover:border-[#9ab4a0]"}`}><span className="block text-sm font-medium">{item.label}</span><span className="mt-1 block text-xs leading-5 text-[#7b8880]">{item.description}</span></button>)}</div></fieldset>
                <label className="flex flex-col gap-2"><span className="text-sm font-medium">Request for <b className="text-[#6b8d75]">*</b></span><input value={form.requester} onChange={(event) => updateField("requester", event.target.value)} placeholder="Name, username, team, or department" className="h-12 w-full rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
                <label className="flex flex-col gap-2"><span className="text-sm font-medium">Ask your question <b className="text-[#6b8d75]">*</b></span><textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="For example: How do I add someone to a distribution list?" className="min-h-40 w-full resize-y rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
              </div>
              {error && <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
              {response && <div className="mt-7 whitespace-pre-wrap rounded-2xl border border-[#c9ddcc] bg-[#edf5ee] px-5 py-4 text-sm leading-7"><div className="mb-2 flex items-center gap-2 font-medium text-[#547660]"><Bot className="h-4 w-4" /> NORA</div>{displayedResponse}{displayedResponse.length < response.length && <span className="ml-1 inline-block h-4 w-1.5 translate-y-0.5 bg-[#547660] align-middle animate-pulse" />}</div>}
              <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-[#edf1ed] pt-5"><Button type="button" variant="ghost" onClick={clearForm} className="gap-2 rounded-xl text-[#6e7b73]"><RotateCcw className="h-4 w-4" /> Clear</Button><Button type="button" onClick={askAssistant} disabled={isGenerating || !form.description.trim() || !form.requester.trim()} className="gap-2 rounded-xl bg-[#183b2b] px-5 hover:bg-[#28543e]">{isGenerating ? "Preparing ticket..." : "Help me create a ticket"}<ArrowUp className="h-4 w-4" /></Button></div>
            </section>
            <aside className="rounded-3xl border border-[#d9e2da] bg-[#edf4ed] p-6 md:p-7"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#183b2b]"><ClipboardList className="h-5 w-5" /></div><h3 className="text-xl font-medium">NORA will help you</h3><ul className="mt-5 flex flex-col gap-4 text-sm leading-6 text-[#5f7065]"><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />Clarify your distribution-list request</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />Explain how to use Free-Service</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />Remind you to include the distribution-list name</li></ul></aside>
          </div>
        </div>
      </section>
    </main>
  )
}
