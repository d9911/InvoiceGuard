'use client'

import React from 'react'
import { App } from '../App'
import { AuthProvider } from '../shared/api/AuthContext'

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
