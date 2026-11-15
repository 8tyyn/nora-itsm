"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowUp, Bot, CheckCircle2, FileText, Menu, Paperclip, ShieldCheck, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

const initialForm = {
  shortDescription: "",
  application: "",
  ipAddress: "",
  errorMessage: "",
  details: "",
}

const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""

function TypingResponse({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState("")

  useEffect(() => {
    setDisplayedText("")
    let characterIndex = 0
    let typingTimer: number | undefined
    const startTimer = window.setTimeout(() => {
      typingTimer = window.setInterval(() => {
        characterIndex += 1
        setDisplayedText(text.slice(0, characterIndex))
        if (characterIndex >= text.length && typingTimer !== undefined) window.clearInterval(typingTimer)
      }, 18)
    }, 180)

    return () => {
      window.clearTimeout(startTimer)
      if (typingTimer !== undefined) window.clearInterval(typingTimer)
    }
  }, [text])

  return (
    <div className="whitespace-pre-wrap text-sm leading-7 text-[#5f7065]">
      {displayedText}
      {displayedText.length < text.length && <span className="ml-1 inline-block h-4 w-1.5 translate-y-0.5 bg-[#547660] animate-pulse" />}
    </div>
  )
}

export default function TicketAssistantPage() {
  return <ProtectedRoute allowedRoles={["user", "admin"]}><TicketAssistantContent /></ProtectedRoute>
}

function TicketAssistantContent() {
  const { token } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [fileName, setFileName] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [response, setResponse] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function generateDocumentation() {
    if (!form.shortDescription.trim() || !form.application.trim() || !form.details.trim()) return
    const activeToken = token ?? window.localStorage.getItem("token")
    if (!activeToken) {
      setError("Your session has expired. Please sign in again.")
      return
    }

    setIsGenerating(true)
    setResponse("")
    setError("")

    const incidentPrompt = `Rewrite the following incident notes into an enhanced and professional version.

Short description: ${form.shortDescription}
Application: ${form.application}
IP address: ${form.ipAddress || "Not provided"}
Exact error message: ${form.errorMessage || "Not provided"}
What happened: ${form.details}

  Return ONLY these five fields, in this exact order, with clear line breaks:

  Short description
  Application
  IP address
  Error message
  Description

  Enhance the wording, grammar, clarity, and detail of each field without changing the facts. Do not add troubleshooting steps, assignment groups, priorities, questions, recommendations, introductions, conclusions, or any other fields. If a field is empty or not provided, write "Not provided". Do not invent information.`

    try {
      const apiResponse = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeToken}`,
        },
        body: JSON.stringify({ message: incidentPrompt }),
      })
      const data = await apiResponse.json()
      if (!apiResponse.ok) {
        if (apiResponse.status === 401) throw new Error("Your session has expired. Please sign in again.")
        throw new Error(data?.error || data?.reply || "Unable to generate incident guidance")
      }
      setResponse(data.reply || "NORA did not return a response. Please try again.")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to generate incident guidance")
    } finally {
      setIsGenerating(false)
    }
  }

  function resetForm() {
    setForm(initialForm)
    setFileName("")
    setResponse("")
    setError("")
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2825]">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-[#dfe5df] bg-white/80 px-5 py-6 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 flex items-center gap-2 px-3"><span className="font-display text-2xl tracking-tight">NORA</span><span className="font-mono text-[10px] text-[#738079]">WORKSPACE</span></Link>
        <a href="/chat" className="mb-7 flex items-center gap-2 px-3 text-sm text-[#6c7972] hover:text-[#183b2b]"><ArrowLeft className="h-4 w-4" /> Back to assistant</a>
        <p className="mb-3 px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#7b8880]">Workflows</p>
        <div className="space-y-1 text-sm"><a href="/chat" className="block rounded-xl px-3 py-3 text-[#6c7972] hover:bg-[#f2f5f1]">Ask NORA</a><div className="rounded-xl bg-[#edf2ed] px-3 py-3 font-medium">Create incident guidance</div></div>
        <div className="mt-auto rounded-2xl border border-[#dfe5df] bg-[#f7faf7] p-4"><div className="mb-2 flex items-center gap-2 text-sm font-medium"><ShieldCheck className="h-4 w-4 text-[#537c63]" /> NORA is grounded</div><p className="text-xs leading-5 text-[#728078]">Your request is analyzed against approved ServiceNow knowledge.</p></div>
      </aside>

      <section className="min-h-screen lg:ml-72">
        <header className="flex h-20 items-center justify-between border-b border-[#dfe5df] bg-white/70 px-5 backdrop-blur md:px-10"><div className="flex items-center gap-3"><button className="lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button><div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">NORA assistant</p><h1 className="text-lg font-medium">Incident documentation</h1></div></div><div className="flex items-center gap-3"><a href="/chat" className="hidden text-sm text-[#68756d] hover:text-[#1d2825] sm:block">Ask NORA</a><a href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dbe8dc] text-sm font-medium" aria-label="Open profile">AM</a></div></header>

        <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-14">
          <div className="mb-10 max-w-3xl"><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#183b2b] text-white shadow-sm"><Sparkles className="h-5 w-5" /></div><p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6b8d75]">During a support call</p><h2 className="font-display text-4xl tracking-tight md:text-5xl">Turn incident notes into clear next steps.</h2><p className="mt-4 max-w-2xl text-base leading-7 text-[#6f7c74]">Share the details you have and NORA will enrich them with troubleshooting guidance, the right assignment group, and the questions to ask next.</p></div>

          <div className="grid gap-7 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-3xl border border-[#d9e2da] bg-white p-6 shadow-sm md:p-8"><div className="mb-7 flex items-start justify-between gap-4"><div><h3 className="text-xl font-medium">Incident details</h3><p className="mt-1 text-sm text-[#7b8880]">Add the information shared during the call.</p></div><span className="rounded-full bg-[#edf5ee] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#547660]">Required fields marked *</span></div>
              <div className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">Short description <b className="text-[#6b8d75">*</b></span><input value={form.shortDescription} onChange={(event) => updateField("shortDescription", event.target.value)} placeholder="Users cannot access the finance portal" className="h-12 w-full rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
                <label className="space-y-2"><span className="text-sm font-medium">Application <b className="text-[#6b8d75">*</b></span><input value={form.application} onChange={(event) => updateField("application", event.target.value)} placeholder="e.g. Arbza" className="h-12 w-full rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
                <label className="space-y-2"><span className="text-sm font-medium">IP address</span><input value={form.ipAddress} onChange={(event) => updateField("ipAddress", event.target.value)} placeholder="e.g. 10.24.18.42" className="h-12 w-full rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
                <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">Error message</span><input value={form.errorMessage} onChange={(event) => updateField("errorMessage", event.target.value)} placeholder="Paste the exact error shown to the user" className="h-12 w-full rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 text-sm outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
                <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">What happened? <b className="text-[#6b8d75">*</b></span><textarea value={form.details} onChange={(event) => updateField("details", event.target.value)} placeholder="Describe what the user tried, when the issue started, and what you observed..." className="min-h-32 w-full resize-y rounded-xl border border-[#d5dfd6] bg-[#fbfcfa] px-4 py-3 text-sm leading-6 outline-none transition focus:border-[#7da087] focus:ring-2 focus:ring-[#dce9de]" /></label>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#edf1ed] pt-5"><div className="flex items-center gap-3"><input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" className="sr-only" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} /><Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2 rounded-xl border-[#cfd9d1] bg-white"><Paperclip className="h-4 w-4" /> Attach evidence</Button>{fileName && <span className="flex max-w-[180px] items-center gap-1 truncate text-xs text-[#6f7c74]"><FileText className="h-3.5 w-3.5 shrink-0" /> {fileName}<button type="button" onClick={() => setFileName("")} aria-label="Remove attachment"><X className="h-3.5 w-3.5" /></button></span>}</div><div className="flex gap-2"><Button type="button" variant="ghost" onClick={resetForm} className="rounded-xl text-[#6e7b73]">Clear</Button><Button type="button" onClick={generateDocumentation} disabled={isGenerating || !form.shortDescription.trim() || !form.application.trim() || !form.details.trim()} className="gap-2 rounded-xl bg-[#183b2b] px-5 hover:bg-[#28543e]">{isGenerating ? "Analyzing..." : "Generate guidance"}<ArrowUp className="h-4 w-4" /></Button></div></div>
            </section>

            <aside className="rounded-3xl border border-[#d9e2da] bg-[#edf4ed] p-6 md:p-7"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#183b2b]"><Bot className="h-5 w-5" /></div><h3 className="text-xl font-medium">What NORA will provide</h3><ul className="mt-5 space-y-4 text-sm leading-6 text-[#5f7065]"><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />A clearer incident summary ready for ServiceNow</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />Recommended assignment group and priority</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />Relevant troubleshooting steps from the KB</li><li className="flex gap-3"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#62856d]" />Follow-up questions for the caller</li></ul><div className="mt-8 border-t border-[#d4e2d5] pt-5 text-xs leading-5 text-[#728078]"><ShieldCheck className="mb-2 h-4 w-4 text-[#537c63]" />NORA uses approved knowledge sources. Verify critical decisions before submitting a ticket.</div></aside>
          </div>

          {error && <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

          {response && <section className="mt-7 rounded-3xl border border-[#c9ddcc] bg-white p-6 shadow-sm md:p-8"><div className="mb-6 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e2f0e3] text-[#477052]"><Bot className="h-5 w-5" /></div><div><p className="font-medium">NORA&apos;s enhanced documentation</p><p className="text-xs text-[#7b8880]">Prepared from your incident details and approved KB content</p></div></div><div className="border-t border-[#edf1ed] pt-5"><TypingResponse text={response} /></div></section>}
        </div>
      </section>
    </main>
  )
}
