'use client'

import React, { useState } from 'react'
import { Navbar } from '@/src/widgets/Navbar'
import { MainHome } from '@/src/pages/MainHome/ui/MainHome'
import { SignUp } from '@/src/pages/SignUp/ui/SignUp'
import { SignIn } from '@/src/pages/SignIn/ui/SignIn'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from './shared/api/AuthContext'
import FooterMain from './widgets/FooterMain'

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('MainHome')
  const { token, userEmail, is2FAEnabled, setIs2FAEnabled, login, logout } = useAuth()

  const handleAuthSuccess = (newToken: string, email: string) => {
    login(newToken, email)
    setCurrentPage('MainHome')
  }

  const handleLogout = () => {
    logout()
    setCurrentPage('MainHome')
  }

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans leading-none selection:bg-primaryselection:text-ink">
      {/* Sticky Navigation bar */}
      <Navbar userEmail={userEmail} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} is2FAEnabled={is2FAEnabled} />

      {/* Pages rendering */}
      {currentPage === 'MainHome' && <MainHome token={token} userEmail={userEmail} onNavigate={setCurrentPage} is2FAEnabled={is2FAEnabled} setIs2FAEnabled={setIs2FAEnabled} />}

      {currentPage === 'SignUp' && <SignUp onNavigate={setCurrentPage} onSuccess={handleAuthSuccess} />}

      {currentPage === 'SignIn' && <SignIn onNavigate={setCurrentPage} onSuccess={handleAuthSuccess} />}

      <FooterMain />
    </div>
  )
}
