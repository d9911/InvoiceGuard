'use client'

import React, { useState } from 'react'
import { Navbar } from '@/widgets/Navbar'
import { MainHome } from '@/pages/MainHome/ui/MainHome'
import { SignUp } from '@/pages/SignUp/ui/SignUp'
import { SignIn } from '@/pages/SignIn/ui/SignIn'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from './shared/api/AuthContext'
import FooterMain from './widgets/FooterMain'

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('MainHome')
  const { accessToken, refreshToken, userEmail, is2FAEnabled, setIs2FAEnabled, login, logout } = useAuth()

  const handleAuthSuccess = (accessToken: string, refreshToken: string, email: string) => {
    login(accessToken, refreshToken, email);
    setCurrentPage('MainHome');
  };

  const handleLogout = () => {
    logout()
    setCurrentPage('MainHome')
  }

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans leading-none selection:bg-primaryselection:text-ink">
      {/* Sticky Navigation bar */}
      <Navbar userEmail={userEmail} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} is2FAEnabled={is2FAEnabled} />

      {/* Pages rendering */}
      {currentPage === 'MainHome' && <MainHome accessToken={accessToken} userEmail={userEmail} onNavigate={setCurrentPage} is2FAEnabled={is2FAEnabled} setIs2FAEnabled={setIs2FAEnabled} />}

      {currentPage === 'SignUp' && <SignUp onNavigate={setCurrentPage} onSuccess={handleAuthSuccess} />}

      {currentPage === 'SignIn' && <SignIn onNavigate={setCurrentPage} onSuccess={handleAuthSuccess} />}

      <FooterMain />
    </div>
  )
}
