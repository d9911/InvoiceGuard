import React, { useState, useEffect } from 'react'
import { Navbar } from '@/widgets/NavbarMain'

import { MainHome } from '@/pages/MainHome/ui/MainHome'
import { SignUp } from '@/pages/SignUp/ui/SignUp'
import { SignIn } from '@/pages/SignIn/ui/SignIn'
import { FooterMain } from '@/widgets/FooterMain';
import { ShieldCheck, Loader2 } from 'lucide-react'

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('MainHome')
  const [token, setToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false)
  const [bootstrapping, setBootstrapping] = useState<boolean>(true)

  // --- Bootstrap Session ---
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem('invoice_guard_token')
      const savedEmail = localStorage.getItem('invoice_guard_email')
      const saved2FA = localStorage.getItem('invoice_guard_2fa_active')

      if (savedToken && savedEmail) {
        setToken(savedToken)
        setUserEmail(savedEmail)
        setIs2FAEnabled(saved2FA === 'true')
      }
    } catch (e) {
      console.error('Session restoration failed:', e)
    } finally {
      setTimeout(() => {
        setBootstrapping(false)
      }, 400)
    }
  }, [])

  // Sync 2FA state to localstorage for robustness
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('invoice_guard_2fa_active', String(is2FAEnabled))
    } else {
      localStorage.removeItem('invoice_guard_2fa_active')
    }
  }, [is2FAEnabled, userEmail])

  // --- Session Handlers ---
  const handleAuthSuccess = (newToken: string, email: string) => {
    setToken(newToken)
    setUserEmail(email)
    localStorage.setItem('invoice_guard_token', newToken)
    localStorage.setItem('invoice_guard_email', email)

    // Check if user has 2FA enabled on their account
    // We default to false and let the user enable it or we verify
    if (email === 'admin@d9911.org' && newToken) {
      // Demo admin might have 2FA enabled, but lets let user control state
      setIs2FAEnabled(false)
    }

    setCurrentPage('MainHome')
  }

  const handleLogout = () => {
    setToken(null)
    setUserEmail(null)
    setIs2FAEnabled(false)
    localStorage.removeItem('invoice_guard_token')
    localStorage.removeItem('invoice_guard_email')
    localStorage.removeItem('invoice_guard_2fa_active')
    setCurrentPage('MainHome')
  }

  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-canvas-soft flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shrink-0 shadow animate-pulse">
          <ShieldCheck className="w-6 h-6 text-ink" />
        </div>
        <div className="flex items-center gap-2 text-mute text-sm font-semibold">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>Synchronizing security logs...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas-soft text-ink font-sans leading-none selection:bg-primaryselection:text-ink">
      {/* Sticky Navigation bar */}
      <Navbar userEmail={userEmail} currentPage={currentPage} onNavigate={setCurrentPage} onLogout={handleLogout} is2FAEnabled={is2FAEnabled} />

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
