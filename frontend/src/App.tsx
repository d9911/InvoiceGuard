import React, { useState } from 'react'
import { NavbarMain } from '@/widgets/NavbarMain'
import { MainHome } from '@/views/MainHome/ui/MainHome'
import { SignUp } from '@/views/SignUp/ui/SignUp'
import { SignIn } from '@/views/SignIn/ui/SignIn'
import { useAuth } from '@/shared/api/AuthContext'
import { FooterMain } from '@/widgets/FooterMain'
import { ShieldCheck } from 'lucide-react'

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('MainHome')
  const { token, userEmail, is2FAEnabled, setIs2FAEnabled, login, logout } = useAuth()

  // --- Session Handlers ---
  const handleAuthSuccess = (newToken: string, email: string) => {
    login(newToken, email)

    // Check if user has 2FA enabled on their account
    // We default to false and let the user enable it or we verify
    if (email === 'admin@d9911.org' && newToken) {
      // Demo admin might have 2FA enabled, but lets let user control state
      setIs2FAEnabled(false)
    }

    setCurrentPage('MainHome')
  }

  const handleLogout = () => {
    logout()
    setCurrentPage('MainHome')
  }

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans leading-none selection:bg-primary selection:text-ink">
      {/* Sticky Navigation bar */}
      <NavbarMain userEmail={userEmail} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} is2FAEnabled={is2FAEnabled} />

      {/* Pages rendering */}
      {currentPage === 'MainHome' && <MainHome token={token} userEmail={userEmail} onNavigate={setCurrentPage} is2FAEnabled={is2FAEnabled} setIs2FAEnabled={setIs2FAEnabled} />}

      {currentPage === 'SignUp' && <SignUp onNavigate={setCurrentPage} onSuccess={handleAuthSuccess} />}

      {currentPage === 'SignIn' && <SignIn onNavigate={setCurrentPage} onSuccess={handleAuthSuccess} />}

      {/* Footer Branding Area */}
      <FooterMain />
    </div>
  )
}
export default App
