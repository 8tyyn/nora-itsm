"use client"

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

type Incident = {
  id: string
  number: string
  title: string
  description: string | null
  caller_name: string | null
  application_service: string | null
  category: string | null
  subcategory: string | null
  impact: string
  urgency: string
  priority: string
  status: string
  assignment_group: string | null
  resolution: string | null
  creator_name: string
  caller_user_id: string | null
  assigned_to_user_id: string | null
  assigned_to_name: string | null
  notes: { id: string; content: string; author_name: string; created_at: string | null }[]
  status_history: { id: string; previous_status: string | null; new_status: string; changed_by_name: string; created_at: string | null }[]
  attachments: { id: string; file_name: string; file_size: number }[]
}

type IncidentUser = { id: string; name: string; email: string; role: string }

export default function IncidentDetailPage() {
  return <ProtectedRoute allowedRoles={["user", "admin"]}><IncidentDetail /></ProtectedRoute>
}

function IncidentDetail() {
  const { token } = useAuth()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [note, setNote] = useState("")
  const [resolution, setResolution] = useState("")
  const [incidentUsers, setIncidentUsers] = useState<IncidentUser[]>([])
  const [error, setError] = useState("")
  const apiUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""
  const id = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : ""

  const loadIncident = useCallback(async () => {
    if (!token || !id) return
    const response = await fetch(`${apiUrl}/api/incidents/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || "Unable to load incident")
    setIncident(data)
    setResolution(data.resolution || "")
    const usersResponse = await fetch(`${apiUrl}/api/incident-users`, { headers: { Authorization: `Bearer ${token}` } })
    if (usersResponse.ok) setIncidentUsers(await usersResponse.json())
  }, [apiUrl, id, token])

  useEffect(() => {
    loadIncident().catch((err) => setError(err.message))
  }, [loadIncident])

  async function updateIncident(values: Record<string, string>) {
    const response = await fetch(`${apiUrl}/api/incidents/${id}`, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(values) })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || "Unable to update incident")
    setIncident(data)
  }

  async function addNote(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) return
    try {
      const response = await fetch(`${apiUrl}/api/incidents/${id}/notes`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: note }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Unable to add note")
      setNote("")
      await loadIncident()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add note")
    }
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const body = new FormData()
    body.append("file", file)
    const response = await fetch(`${apiUrl}/api/incidents/${id}/attachments`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body })
    const data = await response.json()
    if (!response.ok) setError(data?.error || "Unable to upload attachment")
    else await loadIncident()
    event.target.value = ""
  }

  if (!incident) return <main className="min-h-screen bg-[#f6f7f4] p-10">{error || "Loading incident..."}</main>

  return <main className="min-h-screen bg-[#f6f7f4] px-5 py-8 text-[#1d2825] md:px-10"><div className="mx-auto max-w-6xl">
    <Link href="/incidents" className="mb-8 inline-flex items-center gap-2 text-sm text-[#68756d] hover:text-[#183b2b]"><ArrowLeft className="h-4 w-4" /> Back to incidents</Link>
    {error && <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="font-mono text-xs text-[#6b8d75]">{incident.number}</p><h1 className="mt-2 font-display text-4xl tracking-tight">{incident.title}</h1><p className="mt-2 text-sm text-[#718078]">Created {incident.created_at ? new Date(incident.created_at).toLocaleString() : "—"}</p></div><div className="flex items-center gap-2"><select value={incident.status} onChange={(event) => updateIncident({ status: event.target.value }).catch((err) => setError(err.message))} className="h-10 rounded-md border border-[#dfe5df] bg-white px-3 text-sm"><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select><span className="rounded-full bg-[#edf1ee] px-3 py-2 text-xs uppercase">{incident.priority}</span></div></div>
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-7">
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="mb-5 font-medium">Incident details</h2><dl className="grid gap-5 text-sm sm:grid-cols-2">{[["Created by", incident.creator_name], ["Caller", incident.caller_name], ["Application / service", incident.application_service], ["Category", incident.category], ["Subcategory", incident.subcategory], ["Impact", incident.impact], ["Urgency", incident.urgency], ["Assignment group", incident.assignment_group]].map(([label, value]) => <div key={label}><dt className="text-xs text-[#7c8981]">{label}</dt><dd className="mt-1">{value || "Not provided"}</dd></div>)}</dl><div className="mt-6 border-t border-[#edf0ed] pt-5"><p className="text-xs text-[#7c8981]">Description</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{incident.description || "No description"}</p></div></section>
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="mb-4 font-medium">Work notes</h2><div className="space-y-3">{incident.notes.length ? incident.notes.map((item) => <div key={item.id} className="rounded-lg bg-[#f7faf7] p-3 text-sm"><p className="whitespace-pre-wrap">{item.content}</p>      <p className="mt-2 text-[11px] text-[#8b968f]">{item.author_name} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p></div>) : <p className="text-sm text-[#8b968f]">No notes yet.</p>}</div><form onSubmit={addNote} className="mt-4"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal work note" className="min-h-24 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" /><Button type="submit" className="mt-3 rounded-lg bg-[#183b2b] hover:bg-[#28543e]">Add note</Button></form></section>
    </div><aside className="space-y-7"><section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Assignment</h2><p className="mt-2 text-sm text-[#68756d]">{incident.assigned_to_name || "Not assigned"}</p><select value={incident.assigned_to_user_id || ""} onChange={(event) => updateIncident({ assigned_to_user_id: event.target.value }).catch((err) => setError(err.message))} className="mt-4 h-10 w-full rounded-md border border-[#dfe5df] bg-white px-3 text-sm"><option value="">Unassigned</option>{incidentUsers.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}</select><p className="mt-2 text-xs text-[#8b968f]">Users can assign their own ticket to themselves. Administrators can assign it to any active user.</p></section><section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Resolution</h2><textarea value={resolution} onChange={(event) => setResolution(event.target.value)} className="mt-4 min-h-32 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" placeholder="Document the resolution" /><Button onClick={() => updateIncident({ resolution, status: resolution.trim() ? "resolved" : incident.status }).catch((err) => setError(err.message))} className="mt-3 w-full rounded-lg bg-[#183b2b] hover:bg-[#28543e]">Save resolution</Button></section><section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Attachments</h2><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#b8c8bb] p-4 text-sm text-[#68756d] hover:bg-[#f7faf7]"><Paperclip className="h-4 w-4" /> Upload file<input type="file" className="hidden" onChange={uploadFile} /></label><div className="mt-4 space-y-2">{incident.attachments.map((file) => <p key={file.id} className="truncate text-xs text-[#68756d]">{file.file_name}</p>)}</div></section><section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Status history</h2><div className="mt-4 space-y-3 text-xs">{incident.status_history.map((item) => <div key={item.id}><p>{item.previous_status || "Created"} → {item.new_status}</p>    <p className="text-[#8b968f]">{item.changed_by_name} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p></div>)}</div></section></aside></div>
  </div></main>
}
