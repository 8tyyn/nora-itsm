"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { Plus, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

type Incident = {
  id: string
  number: string
  title: string
  status: string
  priority: string
  assignment_group: string | null
  application_service: string | null
  created_at: string | null
  updated_at: string | null
  creator_name: string
  caller_user_id: string | null
}

type IncidentUser = { id: string; name: string; email: string; role: string }

const initialForm = {
  title: "",
  description: "",
  caller_user_id: "",
  application_service: "",
  category: "",
  subcategory: "",
  impact: "single_user",
  urgency: "medium",
  priority: "medium",
  assignment_group: "",
}

export default function IncidentsPage() {
  return <ProtectedRoute allowedRoles={["user", "admin"]}><IncidentsWorkspace /></ProtectedRoute>
}

function IncidentsWorkspace() {
  const { token, user } = useAuth()
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [assignmentGroups, setAssignmentGroups] = useState<string[]>([])
  const [incidentUsers, setIncidentUsers] = useState<IncidentUser[]>([])
  const [form, setForm] = useState(initialForm)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState("")
  const apiUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""

  const loadIncidents = useCallback(async () => {
    if (!token) return
    const response = await fetch(`${apiUrl}/api/incidents`, { headers: { Authorization: `Bearer ${token}` } })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || "Unable to load incidents")
    setIncidents(data)
    const rulesResponse = await fetch(`${apiUrl}/api/assignment-groups`, { headers: { Authorization: `Bearer ${token}` } })
    if (rulesResponse.ok) {
      setAssignmentGroups(await rulesResponse.json())
    }
    const usersResponse = await fetch(`${apiUrl}/api/incident-users`, { headers: { Authorization: `Bearer ${token}` } })
    if (usersResponse.ok) setIncidentUsers(await usersResponse.json())
  }, [apiUrl, token])

  useEffect(() => {
    loadIncidents().catch((err) => setError(err.message))
  }, [loadIncidents])

  async function createIncident(event: FormEvent) {
    event.preventDefault()
    setError("")
    const response = await fetch(`${apiUrl}/api/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data?.error || "Unable to create incident")
      return
    }
    setIncidents((current) => [data, ...current])
    setForm(initialForm)
    setShowForm(false)
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2825]">
      <header className="border-b border-[#dfe5df] bg-white/80 px-5 py-5 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">NORA workspace</p><h1 className="mt-1 text-xl font-medium">Incidents</h1></div>
          <div className="flex items-center gap-4"><span className="hidden text-sm text-[#68756d] sm:block">{user?.name || user?.email}</span><Link href="/chat" className="text-sm text-[#68756d] hover:text-[#183b2b]">Ask NORA</Link></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-4"><div><h2 className="font-display text-4xl tracking-tight">Ticket workspace</h2><p className="mt-2 text-sm text-[#718078]">Create and follow incidents without leaving NORA.</p></div><Button onClick={() => setShowForm((value) => !value)} className="gap-2 rounded-lg bg-[#183b2b] hover:bg-[#28543e]"><Plus className="h-4 w-4" /> New incident</Button></div>
        {error && <p className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        {showForm && <form onSubmit={createIncident} className="mb-8 rounded-2xl border border-[#dfe5df] bg-white p-6">
          <h3 className="mb-5 font-medium">Create incident</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Short description *" value={form.title} onChange={(value) => setForm({ ...form, title: value })} className="md:col-span-2" />
            <label className="block text-sm font-medium">Caller<select required value={form.caller_user_id} onChange={(event) => setForm({ ...form, caller_user_id: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-[#7b9c82]"><option value="">Select a user</option>{incidentUsers.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.email})</option>)}</select></label>
            <Field label="Application / service" value={form.application_service} onChange={(value) => setForm({ ...form, application_service: value })} />
            <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} />
            <Field label="Subcategory" value={form.subcategory} onChange={(value) => setForm({ ...form, subcategory: value })} />
            <SelectField label="Impact" value={form.impact} options={{ single_user: "Single user", multiple_users: "Multiple users", site: "Site", multiple_sites: "Multiple sites", critical_service: "Critical service" }} onChange={(value) => setForm({ ...form, impact: value })} />
            <SelectField label="Urgency" value={form.urgency} options={{ low: "Low", medium: "Medium", high: "High", critical: "Critical" }} onChange={(value) => setForm({ ...form, urgency: value })} />
            <SelectField label="Priority" value={form.priority} options={{ low: "Low", medium: "Medium", high: "High", critical: "Critical" }} onChange={(value) => setForm({ ...form, priority: value })} />
            <label className="block text-sm font-medium">Assignment group<select value={form.assignment_group} onChange={(event) => setForm({ ...form, assignment_group: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-[#7b9c82]"><option value="">Not assigned</option>{assignmentGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
            <label className="block text-sm font-medium md:col-span-2">Description<textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 min-h-32 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" /></label>
          </div>
          <Button type="submit" className="mt-5 rounded-lg bg-[#183b2b] hover:bg-[#28543e]">Create incident</Button>
        </form>}
        <section className="overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
          <div className="border-b border-[#e6ebe6] p-6"><h3 className="font-medium">All incidents</h3><p className="mt-1 text-xs text-[#7c8981]">{incidents.length} ticket{incidents.length === 1 ? "" : "s"}</p></div>
          {incidents.length === 0 ? <div className="p-12 text-center text-sm text-[#8b968f]"><Ticket className="mx-auto mb-3 h-6 w-6" />No incidents yet.</div> : <div className="divide-y divide-[#edf0ed]">{incidents.map((incident) => <Link key={incident.id} href={`/incidents/${incident.id}`} className="flex flex-col gap-3 p-5 hover:bg-[#fbfdfb] md:flex-row md:items-center md:justify-between"><div><p className="font-mono text-xs text-[#6b8d75]">{incident.number}</p><p className="mt-1 font-medium">{incident.title}</p><p className="mt-1 text-xs text-[#7c8981]">Created by {incident.creator_name} · {incident.application_service || "No application"} {incident.assignment_group ? `· ${incident.assignment_group}` : ""}</p></div><div className="flex items-center gap-3 text-xs"><span className="rounded-full bg-[#edf1ee] px-2 py-1">{incident.status.replace("_", " ")}</span><span className="font-medium uppercase text-[#68756d]">{incident.priority}</span></div></Link>)}</div>}
        </section>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, className = "" }: { label: string; value: string; onChange: (value: string) => void; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{label}<input required={label.includes("*")} value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-[#dfe5df] px-3 text-sm outline-none focus:border-[#7b9c82]" /></label>
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Record<string, string>; onChange: (value: string) => void }) {
  return <label className="block text-sm font-medium">{label}<select value={value} onChange={(event) => onChange(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-[#dfe5df] bg-white px-3 text-sm outline-none focus:border-[#7b9c82]">{Object.entries(options).map(([key, text]) => <option key={key} value={key}>{text}</option>)}</select></label>
}
