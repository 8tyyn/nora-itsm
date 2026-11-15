"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import {
  Activity,
  BarChart3,
  Check,
  Clock3,
  LayoutDashboard,
  MessageSquare,
  MoreHorizontal,
  Search,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

type AssignmentGroupStat = {
  group: string
  count: number
  applications: { name: string; count: number }[]
}

type Overview = {
  users: number
  conversations: number
  messages: number
  knowledge_documents: number
  assignment_group_stats: AssignmentGroupStat[]
}

type PendingAccount = {
  id: string
  name: string | null
  email: string
  account_type: "user" | "employee"
  created_at: string | null
}

const emptyOverview: Overview = {
  users: 0,
  conversations: 0,
  messages: 0,
  knowledge_documents: 0,
  assignment_group_stats: [],
}

const assignmentGroups = ["TI.DMI", "TI.ISC.OB", "TI.DEP"]

export default function AdminPage() {
  return <ProtectedRoute adminOnly><AdminWorkspace /></ProtectedRoute>
}

function AdminWorkspace() {
  const { token, user, logout } = useAuth()
  const [query, setQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string; role: string; is_active: boolean; created_at: string | null }[]>([])
  const [overview, setOverview] = useState<Overview>(emptyOverview)
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([])
  const [pendingError, setPendingError] = useState("")

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token ?? ""}` }
    const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""

    Promise.all([
      fetch(`${apiBaseUrl}/api/admin/users`, { headers }),
      fetch(`${apiBaseUrl}/api/admin/overview`, { headers }),
      fetch(`${apiBaseUrl}/api/admin/pending-accounts`, { headers }),
    ]).then(async ([usersResponse, overviewResponse, pendingResponse]) => {
      const [data, overviewData, pendingData] = await Promise.all([usersResponse.json(), overviewResponse.json(), pendingResponse.json()])
      if (!usersResponse.ok) throw new Error(data?.error || "Unable to load users")
      if (!overviewResponse.ok) throw new Error(overviewData?.error || "Unable to load overview")
      if (!pendingResponse.ok) throw new Error(pendingData?.error || "Unable to load pending accounts")
      setUsers(data)
      setPendingAccounts(pendingData)
      setOverview({
        ...emptyOverview,
        ...overviewData,
        assignment_group_stats: assignmentGroups.map((group) =>
          overviewData.assignment_group_stats?.find((stat: AssignmentGroupStat) => stat.group === group) ?? {
            group,
            count: 0,
            applications: [],
          }
        ),
      })
    }).catch(() => {
      setUsers([])
      setPendingAccounts([])
      setOverview(emptyOverview)
    })
  }, [token])

  async function updatePendingAccount(id: string, action: "approve" | "reject") {
    setPendingError("")
    const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ""
    const response = await fetch(`${apiBaseUrl}/api/admin/pending-accounts/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
    })
    const data = await response.json()
    if (!response.ok) {
      setPendingError(data?.error || "Unable to update account")
      return
    }
    setPendingAccounts((accounts) => accounts.filter((account) => account.id !== id))
  }

  const filteredUsers = users.filter((member) =>
    `${member.name} ${member.email}`.toLowerCase().includes(query.toLowerCase())
  )
  const initials = (user?.name || user?.email || "A").split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2825]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-[#dfe5df] bg-white px-4 py-6 lg:flex lg:flex-col">
        <Link href="/" className="mb-10 flex items-center gap-2 px-3"><span className="font-display text-2xl tracking-tight">NORA</span><span className="font-mono text-[10px] text-[#738079]">ADMIN</span></Link>
        <nav className="space-y-1 text-sm">
          <a href="/admin" className="flex items-center gap-3 rounded-xl bg-[#eaf1eb] px-3 py-3 font-medium"><LayoutDashboard className="h-4 w-4" /> Overview</a>
          <a href="#users" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#718078] hover:bg-[#f3f6f3]"><Users className="h-4 w-4" /> Users</a>
          <a href="#conversations" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#718078] hover:bg-[#f3f6f3]"><MessageSquare className="h-4 w-4" /> Conversations</a>
          <a href="#analytics" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#718078] hover:bg-[#f3f6f3]"><BarChart3 className="h-4 w-4" /> Analytics</a>
          <Link href="/incidents" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#718078] hover:bg-[#f3f6f3]"><MessageSquare className="h-4 w-4" /> Incidents</Link>
          <Link href="/admin/assignment-rules" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#718078] hover:bg-[#f3f6f3]"><Settings className="h-4 w-4" /> Assignment rules</Link>
        </nav>
        <div className="mt-auto space-y-1 text-sm">
          <a href="#settings" className="flex items-center gap-3 rounded-xl px-3 py-3 text-[#718078]"><Settings className="h-4 w-4" /> Settings</a>
          <a href="/chat" className="flex items-center gap-3 rounded-xl border border-[#dce5dd] px-3 py-3 font-medium"><MessageSquare className="h-4 w-4" /> Open workspace</a>
        </div>
      </aside>

      <section className="lg:ml-64">
        <header className="flex h-20 items-center justify-between border-b border-[#dfe5df] bg-white/70 px-5 backdrop-blur md:px-10">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">NORA admin</p><h1 className="text-lg font-medium">Workspace overview</h1></div>
          <div className="flex items-center gap-3"><Link href="/profile" className="flex h-9 w-9 items-center justify-center rounded-full bg-[#183b2b] text-sm font-medium text-white" aria-label="Open profile">{initials}</Link><button onClick={logout} className="text-sm text-[#68756d] hover:text-[#1d2825]">Disconnect</button></div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 md:px-10">
          <div className="mb-8"><h2 className="font-display text-4xl tracking-tight">Good morning, Admin</h2><p className="mt-2 text-sm text-[#718078]">Monitor how your team uses NORA to resolve IT incidents.</p></div>
          <div id="analytics" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat icon={<Users />} label="Total users" value={String(overview.users)} change="Live" note="from NORA database" />
            <Stat icon={<MessageSquare />} label="Conversations" value={String(overview.conversations)} change="Live" note="saved conversations" />
            <Stat icon={<Activity />} label="Messages" value={String(overview.messages)} change="Live" note="user and assistant" />
            <Stat icon={<Clock3 />} label="Knowledge files" value={String(overview.knowledge_documents)} change="Live" note="uploaded documents" />
          </div>

          <section id="assignment-groups" className="mt-8 rounded-2xl border border-[#dfe5df] bg-white p-6">
            <div className="mb-6"><h3 className="font-medium">Suggested assignment groups</h3><p className="mt-1 text-xs text-[#7c8981]">Recommendations found in saved assistant conversations</p></div>
            <div className="grid gap-4 md:grid-cols-3">
              {overview.assignment_group_stats.map((stat) => (
                <div key={stat.group} className="rounded-xl border border-[#e5ebe5] bg-[#fafcfa] p-4">
                  <div className="flex items-center justify-between"><span className="font-mono text-sm font-medium">{stat.group}</span><span className="text-2xl font-medium">{stat.count}</span></div>
                  <p className="mt-1 text-xs text-[#7c8981]">suggestions</p>
                  <div className="mt-4 border-t border-[#e5ebe5] pt-3"><p className="mb-2 text-xs font-medium text-[#66736b]">Applications in these conversations</p>{stat.applications.length ? <div className="space-y-1">{stat.applications.slice(0, 4).map((application) => <div key={application.name} className="flex justify-between gap-3 text-xs text-[#7c8981]"><span className="truncate">{application.name}</span><span className="font-mono">{application.count}</span></div>)}</div> : <p className="text-xs text-[#a0aaa3]">No application recorded</p>}</div>
                </div>
              ))}
            </div>
          </section>

          <section id="pending-accounts" className="mt-8 rounded-2xl border border-[#dfe5df] bg-white">
            <div className="border-b border-[#e6ebe6] p-6">
              <div className="flex items-center justify-between gap-4">
                <div><h3 className="font-medium">Awaiting approval</h3><p className="mt-1 text-xs text-[#7c8981]">Review new User and Employee account requests before granting access.</p></div>
                <span className="rounded-full bg-[#f2eee2] px-3 py-1 text-xs font-medium text-[#927a45]">{pendingAccounts.length} pending</span>
              </div>
              {pendingError && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{pendingError}</p>}
            </div>
            {pendingAccounts.length === 0 ? <p className="p-6 text-sm text-[#8b968f]">No accounts are waiting for approval.</p> : <div className="divide-y divide-[#edf0ed]">{pendingAccounts.map((account) => <div key={account.id} className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{account.name || "Unnamed applicant"}</p><p className="text-xs text-[#8b968f]">{account.email}</p><div className="mt-2 flex gap-2 text-[11px]"><span className="rounded-full bg-[#eaf1eb] px-2 py-1 text-[#52775b]">{account.account_type === "employee" ? "Employee" : "User"}</span><span className="rounded-full bg-[#f5f6f5] px-2 py-1 text-[#7c8981]">{account.created_at ? new Date(account.created_at).toLocaleDateString() : "Pending"}</span></div></div><div className="flex gap-2"><Button onClick={() => updatePendingAccount(account.id, "approve")} className="gap-2 rounded-lg bg-[#183b2b] text-xs hover:bg-[#28543e]"><Check className="h-3.5 w-3.5" /> Approve</Button><Button onClick={() => updatePendingAccount(account.id, "reject")} variant="outline" className="gap-2 rounded-lg border-red-200 text-xs text-red-700 hover:bg-red-50"><X className="h-3.5 w-3.5" /> Reject</Button></div></div>)}</div>}
          </section>

          <section id="users" className="mt-8 rounded-2xl border border-[#dfe5df] bg-white">
            <div className="flex flex-col justify-between gap-4 border-b border-[#e6ebe6] p-6 md:flex-row md:items-center"><div><h3 className="font-medium">Team members</h3><p className="mt-1 text-xs text-[#7c8981]">Manage access to the NORA workspace</p></div><div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9aa59e]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search users" className="h-9 w-full rounded-lg border border-[#dfe5df] pl-9 pr-3 text-sm outline-none focus:border-[#7b9c82] md:w-56" /></div><Button className="h-9 rounded-lg bg-[#183b2b] text-xs hover:bg-[#28543e]">Invite user</Button></div></div>
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[#fafcfa] text-xs text-[#839087]"><tr><th className="px-6 py-3 font-medium">User</th><th className="px-6 py-3 font-medium">Role</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3 font-medium">Last active</th><th className="px-6 py-3" /></tr></thead><tbody className="divide-y divide-[#edf0ed]">{filteredUsers.map((member) => <tr key={member.email} className="hover:bg-[#fbfdfb]"><td className="px-6 py-4"><div className="flex items-center gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dbe8dc] text-xs font-medium text-[#41604a]">{(member.name || member.email).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</div><div><p className="font-medium">{member.name || "Unnamed user"}</p><p className="text-xs text-[#8b968f]">{member.email}</p></div></div></td><td className="px-6 py-4 text-[#66736b]">{member.role === "admin" ? "Administrator" : "User"}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[11px] ${member.is_active ? "bg-[#e5f1e6] text-[#4f7758]" : "bg-[#f2eee2] text-[#927a45]"}`}>{member.is_active ? "Active" : "Inactive"}</span></td><td className="px-6 py-4 text-[#8b968f]">{member.created_at ? new Date(member.created_at).toLocaleDateString() : "—"}</td><td className="px-6 py-4 text-right"><Button variant="ghost" size="icon" onClick={() => setSelectedUser(selectedUser === member.email ? null : member.email)} aria-label={`Manage ${member.name || member.email}`}><MoreHorizontal className="h-4 w-4" /></Button>{selectedUser === member.email && <button onClick={() => setSelectedUser(null)} className="ml-2 inline-flex items-center gap-1 text-xs text-[#a35b55]"><Trash2 className="h-3 w-3" /> Delete</button>}</td></tr>)}</tbody></table></div>
          </section>
        </div>
      </section>
    </main>
  )
}

function Stat({ icon, label, value, change, note }: { icon: ReactNode; label: string; value: string; change: string; note: string }) {
  return <div className="rounded-2xl border border-[#dfe5df] bg-white p-5"><div className="mb-5 flex items-center justify-between"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e9f1ea] text-[#52775b]">{icon}</span><span className="font-mono text-[10px] text-[#679071]">{change}</span></div><p className="text-xs text-[#7d8981]">{label}</p><p className="mt-1 text-2xl font-medium tracking-tight">{value}</p><p className="mt-1 text-[11px] text-[#a0aaa3]">{note}</p></div>
}
