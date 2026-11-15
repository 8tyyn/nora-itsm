"use client"

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

type Incident = {
  id: string; number: string; title: string; description: string | null
  caller_name: string | null; caller_user_id: string | null
  application_service: string | null; category: string | null; subcategory: string | null
  impact: string; urgency: string; priority: string; status: string
  assignment_group: string | null; resolution: string | null; creator_name: string
  assigned_to_user_id: string | null; assigned_to_name: string | null
  created_at: string | null
  notes: { id: string; content: string; author_name: string; created_at: string | null }[]
  status_history: { id: string; previous_status: string | null; new_status: string; changed_by_name: string; created_at: string | null }[]
  attachments: { id: string; file_name: string; file_size: number }[]
}
type IncidentUser = { id: string; name: string; email: string; role: string }

const inputClass = "mt-2 h-10 w-full rounded-md border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-[#7b9c82]"

export default function IncidentDetailPage() {
  return <ProtectedRoute allowedRoles={["user", "admin"]}><IncidentDetail /></ProtectedRoute>
}

function IncidentDetail() {
  const { token } = useAuth()
  const [incident, setIncident] = useState<Incident | null>(null)
  const [incidentUsers, setIncidentUsers] = useState<IncidentUser[]>([])
  const [assignmentGroups, setAssignmentGroups] = useState<string[]>([])
  const [note, setNote] = useState("")
  const [resolution, setResolution] = useState("")
  const [error, setError] = useState("")
  const [notice, setNotice] = useState("")
  const apiUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""
  const id = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : ""

  const showNotice = (message: string) => {
    setNotice(message)
    window.setTimeout(() => setNotice(""), 3000)
  }

  const loadIncident = useCallback(async () => {
    if (!token || !id) return
    const headers = { Authorization: `Bearer ${token}` }
    const response = await fetch(`${apiUrl}/api/incidents/${id}`, { headers })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || "Unable to load incident")
    setIncident(data)
    setResolution(data.resolution || "")
    const [usersResponse, groupsResponse] = await Promise.all([
      fetch(`${apiUrl}/api/incident-users`, { headers }),
      fetch(`${apiUrl}/api/assignment-groups`, { headers }),
    ])
    if (usersResponse.ok) setIncidentUsers(await usersResponse.json())
    if (groupsResponse.ok) setAssignmentGroups(await groupsResponse.json())
  }, [apiUrl, id, token])

  useEffect(() => {
    loadIncident().catch((err) => setError(err instanceof Error ? err.message : "Unable to load incident"))
  }, [loadIncident])

  async function updateIncident(values: Record<string, string>) {
    setError("")
    const response = await fetch(`${apiUrl}/api/incidents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(values),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || "Unable to update incident")
    setIncident(data)
    showNotice("Incident saved successfully.")
  }

  async function addNote(event: FormEvent) {
    event.preventDefault()
    if (!note.trim()) return
    try {
      const response = await fetch(`${apiUrl}/api/incidents/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: note }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Unable to add note")
      setNote("")
      await loadIncident()
      showNotice("Work note added successfully.")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add note")
    }
  }

  async function uploadFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const body = new FormData()
    body.append("file", file)
    const response = await fetch(`${apiUrl}/api/incidents/${id}/attachments`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body,
    })
    const data = await response.json()
    if (!response.ok) setError(data?.error || "Unable to upload attachment")
    else {
      await loadIncident()
      showNotice("Attachment uploaded successfully.")
    }
    event.target.value = ""
  }

  if (!incident) return <main className="min-h-screen bg-[#f6f7f4] p-10">{error || "Loading incident..."}</main>

  return <main className="min-h-screen bg-[#f6f7f4] px-5 py-8 text-[#1d2825] md:px-10"><div className="mx-auto max-w-6xl">
    {notice && <div role="status" className="fixed right-5 top-5 z-50 rounded-lg bg-[#183b2b] px-4 py-3 text-sm text-white shadow-lg">{notice}</div>}
    <nav className="mb-5 flex flex-wrap items-center gap-4 text-sm text-[#68756d]">
      <Link href="/chat" className="hover:text-[#183b2b]">Ask NORA</Link><Link href="/incidents" className="hover:text-[#183b2b]">All incidents</Link><Link href="/profile" className="hover:text-[#183b2b]">Profile</Link>
    </nav>
    <Link href="/incidents" className="mb-8 inline-flex items-center gap-2 text-sm text-[#68756d] hover:text-[#183b2b]"><ArrowLeft className="h-4 w-4" /> Back to incidents</Link>
    {error && <p role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
    <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-start"><div><p className="font-mono text-xs text-[#6b8d75]">{incident.number}</p><h1 className="mt-2 font-display text-4xl tracking-tight">{incident.title}</h1><p className="mt-2 text-sm text-[#718078]">Created {incident.created_at ? new Date(incident.created_at).toLocaleString() : "—"}</p></div><select value={incident.status} onChange={(event) => updateIncident({ status: event.target.value }).catch((err) => setError(err.message))} className={inputClass}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></div>
    <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_320px]"><div className="space-y-7">
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="mb-5 font-medium">Edit incident</h2><form onSubmit={(event) => { event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget).entries()) as Record<string, string>; updateIncident(values).catch((err) => setError(err.message)) }} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Short description<input name="title" defaultValue={incident.title} required className={inputClass} /></label>
        <label className="text-sm font-medium">Caller<select name="caller_user_id" defaultValue={incident.caller_user_id || ""} className={inputClass}><option value="">Select a user</option>{incidentUsers.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}</select></label>
        <label className="text-sm font-medium">Application / service<input name="application_service" defaultValue={incident.application_service || ""} className={inputClass} /></label>
        <label className="text-sm font-medium">Category<input name="category" defaultValue={incident.category || ""} className={inputClass} /></label><label className="text-sm font-medium">Subcategory<input name="subcategory" defaultValue={incident.subcategory || ""} className={inputClass} /></label>
        <label className="text-sm font-medium">Impact<select name="impact" defaultValue={incident.impact} className={inputClass}><option value="single_user">Single user</option><option value="multiple_users">Multiple users</option><option value="site">Site</option><option value="multiple_sites">Multiple sites</option><option value="critical_service">Critical service</option></select></label>
        <label className="text-sm font-medium">Urgency<select name="urgency" defaultValue={incident.urgency} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label><label className="text-sm font-medium">Priority<select name="priority" defaultValue={incident.priority} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
        <label className="text-sm font-medium">Assignment group<select name="assignment_group" defaultValue={incident.assignment_group || ""} className={inputClass}><option value="">Not assigned</option>{assignmentGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
        <label className="text-sm font-medium sm:col-span-2">Description<textarea name="description" defaultValue={incident.description || ""} required className="mt-2 min-h-32 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" /></label><Button type="submit" className="sm:col-span-2 rounded-lg bg-[#183b2b] hover:bg-[#28543e]">Save incident</Button>
      </form></section>
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="mb-4 font-medium">Work notes</h2><div className="space-y-3">{incident.notes.length ? incident.notes.map((item) => <div key={item.id} className="rounded-lg bg-[#f7faf7] p-3 text-sm"><p className="whitespace-pre-wrap">{item.content}</p><p className="mt-2 text-[11px] text-[#8b968f]">{item.author_name} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p></div>) : <p className="text-sm text-[#8b968f]">No notes yet.</p>}</div><form onSubmit={addNote} className="mt-4"><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add an internal work note" className="min-h-24 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" /><Button type="submit" className="mt-3 rounded-lg bg-[#183b2b] hover:bg-[#28543e]">Add note</Button></form></section>
    </div><aside className="space-y-7">
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Assignment</h2><p className="mt-2 text-sm text-[#68756d]">{incident.assigned_to_name || "Not assigned"}</p><select value={incident.assigned_to_user_id || ""} onChange={(event) => updateIncident({ assigned_to_user_id: event.target.value }).catch((err) => setError(err.message))} className={inputClass}><option value="">Unassigned</option>{incidentUsers.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}</select></section>
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Resolution</h2><textarea value={resolution} onChange={(event) => setResolution(event.target.value)} className="mt-4 min-h-32 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" placeholder="Document the resolution" /><Button onClick={() => updateIncident({ resolution, status: resolution.trim() ? "resolved" : incident.status }).catch((err) => setError(err.message))} className="mt-3 w-full rounded-lg bg-[#183b2b] hover:bg-[#28543e]">Save resolution</Button></section>
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Attachments</h2><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[#b8c8bb] p-4 text-sm text-[#68756d] hover:bg-[#f7faf7]"><Paperclip className="h-4 w-4" /> Upload file<input type="file" className="hidden" onChange={uploadFile} /></label><div className="mt-4 space-y-2">{incident.attachments.map((file) => <p key={file.id} className="truncate text-xs text-[#68756d]">{file.file_name}</p>)}</div></section>
      <section className="rounded-2xl border border-[#dfe5df] bg-white p-6"><h2 className="font-medium">Status history</h2><div className="mt-4 space-y-3 text-xs">{incident.status_history.map((item) => <div key={item.id}><p>{item.previous_status || "Created"} → {item.new_status}</p><p className="text-[#8b968f]">{item.changed_by_name} · {item.created_at ? new Date(item.created_at).toLocaleString() : ""}</p></div>)}</div></section>
    </aside></div>
  </div></main>
}
