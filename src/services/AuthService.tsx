'use client'

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

export type Account = {
  id: string
  email: string
  name?: string | null
  fullName?: string | null
  role: 'user' | 'admin' | 'client'
}

type AuthContextValue = {
  user: Account | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<Account>
  register: (name: string, email: string, password: string, accountType: 'user' | 'employee') => Promise<{ pending: boolean }>
  updateProfile: (name: string, email: string) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const apiBaseUrl = process.env.NEXT_PUBLIC_COACH_API_URL ?? ''
const TOKEN_KEY = 'token'

async function fetchJson<T>(path: string, init?: RequestInit, timeoutMs = 5000): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  let res: Response
  try {
    res = await fetch(`${apiBaseUrl}${path}`, { ...init, signal: controller.signal })
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') throw new Error(`API request timeout after ${timeoutMs}ms`)
    throw new Error(`Cannot reach API (${apiBaseUrl}). Start the Flask server.`)
  } finally {
    clearTimeout(timeout)
  }
  if (!res.ok) {
    let msg = 'Request failed'
    try {
      const data = await res.json()
      msg = data?.error || JSON.stringify(data)
    } catch {
      msg = await res.text()
    }
    throw new Error(msg || 'Request failed')
  }
  return (await res.json()) as T
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<Account | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    window.location.assign('/login')
  }, [])

  const loadMe = useCallback(async (activeToken: string) => {
    const me = await fetchJson<Account>('/api/me', {
      headers: { Authorization: `Bearer ${activeToken}` },
    })
    setUser(me)
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY)
    if (!saved) {
      setIsLoading(false)
      return
    }
    setToken(saved)
    loadMe(saved).catch(() => logout()).finally(() => setIsLoading(false))
  }, [loadMe, logout])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const data = await fetchJson<{ token: string; user: Account }>('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      localStorage.setItem(TOKEN_KEY, data.token)
      setToken(data.token)
      setUser(data.user)
      return data.user
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, accountType: 'user' | 'employee') => {
    setIsLoading(true)
    try {
      const data = await fetchJson<{ pending: boolean }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, account_type: accountType }),
      })
      return data
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (name: string, email: string) => {
    if (!token) throw new Error('You must be signed in')
    const data = await fetchJson<{ user: Account }>('/api/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, email }),
    })
    setUser(data.user)
  }, [token])

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error('You must be signed in')
    await fetchJson<{ ok: boolean }>('/api/me/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    })
  }, [token])

  const value = useMemo(() => ({
    user, token, isAuthenticated: Boolean(token && user), isLoading,
    login, register, updateProfile, changePassword, logout,
  }), [user, token, isLoading, login, register, updateProfile, changePassword, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
