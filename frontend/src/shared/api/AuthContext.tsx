// "use client"
'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

// ---------- Cookie utilities ----------
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : null
}

function setCookie(name: string, value: string, days = 7) {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Strict`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`
}

// ---------- Refresh token flow ----------
async function refreshAccessToken(): Promise<string | null> {
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) return null
    const data = await response.json()
    if (data.accessToken) {
      setCookie('accessToken', data.accessToken)
      return data.accessToken
    }
    return null
  } catch {
    return null
  }
}

// ---------- Context definition ----------
interface AuthContextType {
  accessToken: string | null
  refreshToken: string | null
  userEmail: string | null
  is2FAEnabled: boolean
  setIs2FAEnabled: React.Dispatch<React.SetStateAction<boolean>>
  login: (accessToken: string, refreshToken: string, email: string) => void
  logout: () => void
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<Response>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [is2FAEnabled, setIs2FAEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [mounted, setMounted] = useState<boolean>(false)

  // ---------- Helper actions ----------
  const login = (accessToken: string, refreshToken: string, email: string) => {
    setAccessToken(accessToken)
    setRefreshToken(refreshToken)
    setUserEmail(email)
    setCookie('accessToken', accessToken)
    if (refreshToken) {
      setCookie('refreshToken', refreshToken)
    }
    localStorage.setItem('invoice_guard_email', email)
  }

  const logout = () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUserEmail(null)
    setIs2FAEnabled(false)
    deleteCookie('accessToken')
    deleteCookie('refreshToken')
    deleteCookie('invoice_guard_token') // legacy cleanup
    deleteCookie('invoice_guard_email') // legacy cleanup
    localStorage.removeItem('invoice_guard_token')
    localStorage.removeItem('invoice_guard_email')
    localStorage.removeItem('invoice_guard_2fa_active')
    if (userEmail) {
      localStorage.removeItem(`invoice_guard_local_invoices_${userEmail}`)
    }
  }

  const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
    const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`
    const headers = new Headers(options.headers || {})
    const access = accessToken || getCookie('accessToken')
    if (access && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${access}`)
    }
    if (!headers.has('Content-Type') && !(options.body instanceof FormData) && options.body) {
      headers.set('Content-Type', 'application/json')
    }
    const mergedOptions: RequestInit = { ...options, headers }
    const response = await fetch(url, mergedOptions)
    if (response.status === 401 && access) {
      const newAccess = await refreshAccessToken()
      if (newAccess) {
        setAccessToken(newAccess)
        const retryHeaders = new Headers(options.headers || {})
        retryHeaders.set('Authorization', `Bearer ${newAccess}`)
        const retryOptions: RequestInit = { ...options, headers: retryHeaders }
        return fetch(url, retryOptions)
      }
      logout()
    }
    return response
  }

  // ---------- Initial load ----------
  useEffect(() => {
    setMounted(true)
    try {
      const savedToken = getCookie('accessToken')
      const savedRefresh = getCookie('refreshToken')
      const savedEmail = localStorage.getItem('invoice_guard_email')
      const saved2FA = localStorage.getItem('invoice_guard_2fa_active')
      if (savedToken && savedEmail) {
        setAccessToken(savedToken)
        setRefreshToken(savedRefresh)
        setUserEmail(savedEmail)
        setIs2FAEnabled(saved2FA === 'true')
      }
    } catch (e) {
      console.error('Failed to restore auth context from cookies/localStorage:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  // ---------- Auto refresh on start if access token missing ----------
  useEffect(() => {
    if (!accessToken && refreshToken) {
      refreshAccessToken().then((newToken) => {
        if (newToken) setAccessToken(newToken)
      })
    }
  }, [refreshToken])

  // Sync 2FA flag
  useEffect(() => {
    if (userEmail) {
      localStorage.setItem('invoice_guard_2fa_active', String(is2FAEnabled))
    }
  }, [is2FAEnabled, userEmail])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-[#e8ebe6] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 bg-[#9fe870] rounded-full flex items-center justify-center shrink-0 shadow animate-pulse">
          <div className="w-4 h-4 rounded-full bg-[#0e0f0c]" />
        </div>
        <div className="text-[#868685] text-sm font-semibold">Loading credentials context...</div>
      </div>
    )
  }

  return <AuthContext.Provider value={{ accessToken, refreshToken, userEmail, is2FAEnabled, setIs2FAEnabled, login, logout, apiFetch }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
