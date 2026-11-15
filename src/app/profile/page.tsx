"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Eye, EyeOff, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/custom/ProtectedRoute"
import { useAuth } from "@/services/AuthService"

export default function ProfilePage() {
  return <ProtectedRoute><ProfileContent /></ProtectedRoute>
}

function ProfileContent() {
  const { user, updateProfile, changePassword, logout } = useAuth()
  const [name, setName] = useState(user?.name ?? "")
  const [email, setEmail] = useState(user?.email ?? "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  if (!user) return null
  const initials = (user.name || user.email).split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()

  async function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")
    try {
      await updateProfile(name, email)
      setMessage("Profile updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update profile")
    }
  }

  async function handlePasswordSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setMessage("")
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
      return
    }
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setMessage("Password updated")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password")
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1d2825]">
      <header className="border-b border-[#dfe5df] bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 md:px-10">
          <Link href="/chat" className="flex items-center gap-3 text-sm text-[#68756d] transition hover:text-[#1d2825]">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to workspace</span>
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-tight">NORA</span>
            <span className="font-mono text-[10px] text-[#738079]">PROFILE</span>
          </Link>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-[#68756d] transition hover:text-[#1d2825]">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-10 md:px-10 md:py-16">
        <div className="mb-10 max-w-2xl">
          <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em] text-[#718078]">Account settings</p>
          <h1 className="font-display text-4xl tracking-tight md:text-5xl">Your NORA profile</h1>
          <p className="mt-3 text-[#6f7c74]">Manage your account details, security, and access to the IT support workspace.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 md:p-8">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#183b2b] text-xl font-medium text-white">{initials}</div>
              <div>
                <h2 className="text-xl font-medium">{user.name || "NORA user"}</h2>
                <p className="mt-1 text-sm capitalize text-[#7a877f]">{user.role}</p>
              </div>
            </div>
            <div className="space-y-5 border-t border-[#edf1ed] pt-6">
              <div className="flex items-start gap-3">
                <UserRound className="mt-0.5 h-4 w-4 text-[#6b8d75]" />
                <div><p className="text-xs text-[#8a968e]">Full name</p><p className="mt-1 text-sm">{user.name || "Not set"}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-[#6b8d75]" />
                <div><p className="text-xs text-[#8a968e]">Work email</p><p className="mt-1 text-sm">{user.email}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-[#6b8d75]" />
                <div><p className="text-xs text-[#8a968e]">Workspace access</p><p className="mt-1 text-sm">NORA IT Support workspace</p></div>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit} className="mt-8 space-y-4 border-t border-[#edf1ed] pt-6">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" className="h-11 w-full rounded-xl border border-[#d7e0d8] px-4 text-sm" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="Work email" className="h-11 w-full rounded-xl border border-[#d7e0d8] px-4 text-sm" />
              <Button type="submit" className="rounded-full bg-[#183b2b] hover:bg-[#28543e]">Save profile</Button>
            </form>
          </section>

          <section className="rounded-3xl border border-[#dfe5df] bg-white p-6 md:p-8">
            <div className="mb-8">
              <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#718078]">Security</p>
              <h2 className="text-2xl font-medium tracking-tight">Change password</h2>
              <p className="mt-2 text-sm leading-6 text-[#7a877f]">Keep your NORA account secure with a strong, private password.</p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <PasswordField label="Current password" value={currentPassword} onChange={setCurrentPassword} show={showCurrent} onToggle={() => setShowCurrent(!showCurrent)} />
              <PasswordField label="New password" value={newPassword} onChange={setNewPassword} show={showNew} onToggle={() => setShowNew(!showNew)} />
              <PasswordField label="Confirm new password" value={confirmPassword} onChange={setConfirmPassword} show={showConfirm} onToggle={() => setShowConfirm(!showConfirm)} />
              <p className="text-xs text-[#8a968e]">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
              <div className="flex items-center gap-4 pt-2">
                <Button type="submit" className="rounded-full bg-[#183b2b] px-6 hover:bg-[#28543e]">Update password</Button>
                {message && <span className="flex items-center gap-1.5 text-sm text-[#52775b]"><Check className="h-4 w-4" /> {message}</span>}
              </div>
            </form>
          </section>
        </div>

        <section className="mt-6 flex flex-col gap-4 rounded-3xl border border-[#eaded9] bg-[#fffaf8] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div><h2 className="text-base font-medium">Ready to leave NORA?</h2><p className="mt-1 text-sm text-[#897b75]">Disconnect from this workspace on the current device.</p></div>
          <Button onClick={logout} variant="outline" className="rounded-full border-[#d9c9c2] bg-transparent text-[#7c5f55] hover:bg-[#f8eeea]"><LogOut className="mr-2 h-4 w-4" /> Disconnect</Button>
        </section>
        {error && <p className="mt-4 text-sm text-red-700">{error}</p>}
      </div>
    </main>
  )
}

function PasswordField({ label, value, onChange, show, onToggle }: { label: string; value: string; onChange: (value: string) => void; show: boolean; onToggle: () => void }) {
  return <label className="block"><span className="mb-2 block text-sm text-[#536159]">{label}</span><span className="relative block"><input value={value} onChange={(event) => onChange(event.target.value)} type={show ? "text" : "password"} required minLength={8} className="h-12 w-full rounded-xl border border-[#d7e0d8] bg-[#fbfcfb] px-4 pr-12 text-sm outline-none transition focus:border-[#7da184] focus:ring-2 focus:ring-[#dceade]" placeholder="••••••••" /><button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#819087] hover:text-[#183b2b]" aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} aria-pressed={show}>{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></span></label>
}
