import type { Metadata } from 'next'
import { ReactNode } from 'react'
import '../index.css'
import { AuthProvider } from '../shared/api/AuthContext'

export const metadata: Metadata = {
  title: 'InvoiceGuard',
  description: 'Vivid aesthetic design meets state-of-the-art POS invoice signature security',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-canvas-soft text-ink font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
