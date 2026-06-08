import React, { createContext, useContext, useState, useEffect } from 'react'

interface AuthContextType {
  token: string | null
  userEmail: string | null
  is2FAEnabled: boolean
  setIs2FAEnabled: React.Dispatch<React.SetStateAction<boolean>>
  login: (token: string, email: string) => void
  logout: () => void
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)

  // Load context from local storage on mount
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
      console.error('Failed to restore auth context from localStorage:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // Keep 2FA preference synchronized
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('invoice_guard_2fa_active', String(is2FAEnabled))
    }
  }, [is2FAEnabled, userEmail])

  const login = (newToken: string, email: string) => {
    setToken(newToken)
    setUserEmail(email)
    localStorage.setItem('invoice_guard_token', newToken)
    localStorage.setItem('invoice_guard_email', email)
  }

  const logout = () => {
    setToken(null)
    setUserEmail(null)
    setIs2FAEnabled(false)
    localStorage.removeItem('invoice_guard_token')
    localStorage.removeItem('invoice_guard_email')
    localStorage.removeItem('invoice_guard_2fa_active')

    // Clear page-specific local ledger caches too
    if (userEmail) {
      localStorage.removeItem(`invoice_guard_local_invoices_${userEmail}`)
    }
  }

  /**
   * Universal HTTP wrapper context for backend API communication
   * Automatically handles JWT headers, JSON types, and unauthorized (401) sessions.
   */
  const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    // Format full path relative to system proxy
    const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`

    // Inject dynamic authorization headers context
    const headers = new Headers(options.headers || {})

    if (token) {
      if (!headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`)
      }
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData) && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    const mergedOptions: RequestInit = {
      ...options,
      headers,
    }

    const response = await fetch(url, mergedOptions)

    // Revoke session context if token expires or is rejected by backend
    if (response.status === 401 && token) {
      console.warn('Session expired (401 Unauthorized API response received). Revoking local context.')
      logout()
    }

    return response
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e8ebe6] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-[#9fe870] rounded-full flex items-center justify-center shrink-0 shadow animate-pulse">
          <div className="w-4 h-4 rounded-full bg-[#0e0f0c]" />
        </div>
        <div className="text-[#868685] text-sm font-semibold">Loading credentials context...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ token, userEmail, is2FAEnabled, setIs2FAEnabled, login, logout, apiFetch }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
