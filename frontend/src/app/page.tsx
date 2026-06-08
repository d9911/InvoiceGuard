'use client'

import dynamic from 'next/dynamic'
import { AuthProvider } from '../shared/api/AuthContext'

const App = dynamic(() => import('../App'), { ssr: false })

export default function Home() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}
