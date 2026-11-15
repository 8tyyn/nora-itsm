import React from "react"
import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { AppAuthProvider } from '@/components/auth-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'NORA - Intelligent IT Incident Guidance',
  description: 'Use your ServiceNow knowledge base with RAG and AI to troubleshoot incidents, choose the right assignment group, and help IT teams resolve issues faster.',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppAuthProvider>{children}</AppAuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
