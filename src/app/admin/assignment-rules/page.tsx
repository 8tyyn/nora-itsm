"use client"

import { useCallback, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

type AssignmentRule = {
  id: string
  title: string
  issue_description: string
  assignment_group: string
  instructions: string | null
  is_active: boolean
}

type RuleForm = Omit<AssignmentRule, "id">

const emptyForm: RuleForm = {
  title: "",
  issue_description: "",
  assignment_group: "",
  instructions: "",
  is_active: true,
}

export default function AssignmentRulesPage() {
  return <ProtectedRoute adminOnly><AssignmentRulesWorkspace /></ProtectedRoute>
}

function AssignmentRulesWorkspace() {
  const { token } = useAuth()
  const [rules, setRules] = useState<AssignmentRule[]>([])
  const [form, setForm] = useState<RuleForm>(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""

  const loadRules = useCallback(async () => {
    if (!token) return
    const response = await fetch(`${apiBaseUrl}/api/admin/assignment-rules`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data?.error || "Unable to load assignment rules")
    setRules(data)
  }, [apiBaseUrl, token])

  useEffect(() => {
    loadRules().catch((err) => setError(err.message))
  }, [loadRules])

  function editRule(rule: AssignmentRule) {
    setEditingId(rule.id)
    setForm({
      title: rule.title,
      issue_description: rule.issue_description,
      assignment_group: rule.assignment_group,
      instructions: rule.instructions || "",
      is_active: rule.is_active,
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function saveRule(event: FormEvent) {
    event.preventDefault()
    setError("")
    setSaving(true)
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/admin/assignment-rules${editingId ? `/${editingId}` : ""}`,
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(form),
        },
      )
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || "Unable to save assignment rule")
      setForm(emptyForm)
      setEditingId(null)
      await loadRules()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save assignment rule")
    } finally {
      setSaving(false)
    }
  }

  async function deleteRule(id: string) {
    if (!window.confirm("Delete this assignment rule?")) return
    const response = await fetch(`${apiBaseUrl}/api/admin/assignment-rules/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data?.error || "Unable to delete assignment rule")
      return
    }
    setRules((current) => current.filter((rule) => rule.id !== id))
    if (editingId === id) {
      setEditingId(null)
      setForm(emptyForm)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] px-5 py-8 text-[#1d2825] md:px-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="mb-8 inline-flex items-center gap-2 text-sm text-[#68756d] hover:text-[#183b2b]">
          <ArrowLeft className="h-4 w-4" /> Back to admin overview
        </Link>
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">NORA admin</p>
          <h1 className="mt-2 font-display text-4xl tracking-tight">Assignment rules</h1>
          <p className="mt-2 max-w-2xl text-sm text-[#718078]">
            These active rules are included in NORA&apos;s instructions. Update them when routing or support procedures change.
          </p>
        </div>

        <form onSubmit={saveRule} className="rounded-2xl border border-[#dfe5df] bg-white p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-medium">{editingId ? "Edit assignment rule" : "Add assignment rule"}</h2>
            {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm) }}>Cancel</Button>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Rule name" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="NORA disabled account on PUR" />
            <Field label="Assignment group" value={form.assignment_group} onChange={(value) => setForm({ ...form, assignment_group: value })} placeholder="TI.DMI" />
          </div>
          <label className="mt-4 block text-sm font-medium">Issue pattern<input value={form.issue_description} onChange={(event) => setForm({ ...form, issue_description: event.target.value })} placeholder="When should this rule match?" className="mt-2 h-10 w-full rounded-md border border-[#dfe5df] px-3 text-sm outline-none focus:border-[#7b9c82]" /></label>
          <label className="mt-4 block text-sm font-medium">Instructions for NORA<textarea value={form.instructions || ""} onChange={(event) => setForm({ ...form, instructions: event.target.value })} placeholder="Questions to ask and guidance to follow" className="mt-2 min-h-24 w-full rounded-md border border-[#dfe5df] px-3 py-2 text-sm outline-none focus:border-[#7b9c82]" /></label>
          <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active rule</label>
          {error && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <Button type="submit" disabled={saving} className="mt-5 gap-2 rounded-lg bg-[#183b2b] hover:bg-[#28543e]"><Plus className="h-4 w-4" /> {saving ? "Saving..." : editingId ? "Save changes" : "Add rule"}</Button>
        </form>

        <section className="mt-8 overflow-hidden rounded-2xl border border-[#dfe5df] bg-white">
          <div className="border-b border-[#e6ebe6] p-6"><h2 className="font-medium">Configured rules</h2><p className="mt-1 text-xs text-[#7c8981]">{rules.length} rule{rules.length === 1 ? "" : "s"} in the database</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="bg-[#fafcfa] text-xs text-[#839087]"><tr><th className="px-6 py-3 font-medium">Rule</th><th className="px-6 py-3 font-medium">Issue pattern</th><th className="px-6 py-3 font-medium">Group</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3" /></tr></thead>
              <tbody className="divide-y divide-[#edf0ed]">
                {rules.map((rule) => <tr key={rule.id} className="align-top hover:bg-[#fbfdfb]"><td className="px-6 py-4 font-medium">{rule.title}</td><td className="max-w-md px-6 py-4 text-xs text-[#68756d]">{rule.issue_description}</td><td className="px-6 py-4 font-mono text-xs">{rule.assignment_group}</td><td className="px-6 py-4"><span className={`rounded-full px-2 py-1 text-[11px] ${rule.is_active ? "bg-[#eaf1eb] text-[#52775b]" : "bg-[#f1f2f1] text-[#7c8981]"}`}>{rule.is_active ? "Active" : "Inactive"}</span></td><td className="px-6 py-4"><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => editRule(rule)} aria-label={`Edit ${rule.title}`}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="outline" size="sm" onClick={() => deleteRule(rule.id)} aria-label={`Delete ${rule.title}`}><Trash2 className="h-3.5 w-3.5 text-red-600" /></Button></div></td></tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder: string }) {
  return <label className="block text-sm font-medium">{label}<input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="mt-2 h-10 w-full rounded-md border border-[#dfe5df] px-3 text-sm outline-none focus:border-[#7b9c82]" /></label>
}
