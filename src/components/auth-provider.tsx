'use client'

import { AuthProvider } from '@/services/AuthService'

export function AppAuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}
