import React from 'react'
import './globals.css'

export const metadata = {
  title: 'InvoiceGuard',
  description: 'Secure fintech invoice and payment collection platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="referrer" content="no-referrer" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
