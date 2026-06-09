import React, { useState } from 'react'
import { Card } from '@/shared/ui/Card'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Lock, Mail, ShieldCheck, ArrowLeft, Loader2, CheckCircle2, KeyRound } from 'lucide-react'

interface SignInProps {
  onNavigate: (page: string) => void;
  onSuccess: (accessToken: string, refreshToken: string, email: string) => void;
}

export function SignIn({ onNavigate, onSuccess }: SignInProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  // 2FA login state
  const [requires2FA, setRequires2FA] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [tfaCode, setTfaCode] = useState('')

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFeedback('')

    if (!email || !password) {
      setError('Please provide Email and Password.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed')
      }

      if (data.requires2FA) {
        setRequires2FA(true)
        setTempToken(data.tempToken)
        setFeedback('Credentials approved! Please enter your 2FA authentication code.')
      } else {
        setFeedback('Successfully logged in!')
        setTimeout(() => {
          onSuccess(data.accessToken, data.refreshToken, data.email)
        }, 800)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFeedback('')

    if (!tfaCode || tfaCode.length < 6) {
      setError('Please enter a 6-digit code.')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/login-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ token: tfaCode })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Invalid 2FA authentication code')
      }

      setFeedback('2FA code verified!')
      setTimeout(() => {
        onSuccess(data.accessToken, data.refreshToken, email)
      }, 800)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-canvas-soft">
      <Card className="w-full max-w-md bg-white border border-ink/10 relative overflow-hidden">
        {/* Decorative bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-active" />

        <div
          className="flex items-center gap-1.5 mb-6 text-mute hover:text-ink cursor-pointer transition-colors text-sm font-semibold inline-flex"
          onClick={() => {
            if (requires2FA) {
              setRequires2FA(false)
              setTfaCode('')
              setError('')
              setFeedback('')
            } else {
              onNavigate('MainHome')
            }
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{requires2FA ? 'Login with password' : 'Back to main'}</span>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-pale text-ink rounded-full mx-auto flex items-center justify-center mb-4 border border-primary/20">
            {requires2FA ? (
              <KeyRound className="w-6 h-6 text-ink" />
            ) : (
              <Lock className="w-6 h-6 text-ink" />
            )}
          </div>
          <h2 className="text-3xl font-display font-black leading-none tracking-tight">
            {requires2FA ? 'Enter 2FA Code' : 'Welcome back'}
          </h2>
          <p className="text-sm text-body mt-2.5">
            {requires2FA ? 'Your account is protected by Two-Factor Authentication' : 'Securely access your merchant portal.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-negative-bg border border-negative/30 rounded-lg text-rose-200 text-sm flex items-start gap-2.5">
            <span className="font-bold flex-shrink-0">⚠️ Access Error:</span>
            <span className="text-left">{error}</span>
          </div>
        )}

        {feedback && (
          <div className="mb-6 p-4 bg-primary-pale border border-primary/30 rounded-lg text-ink-deep text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-positive flex-shrink-0" />
            <span className="text-left font-semibold">{feedback}</span>
          </div>
        )}

        {!requires2FA ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="e.g. admin@d9911.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="font-medium"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter account password (e.g. d9911)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="font-medium"
            />

            <Button type="submit" className="w-full text-base py-4 font-bold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit} className="space-y-5">
            <div className="space-y-2">
              <Input
                label="6-Digit Verification Code"
                type="text"
                maxLength={6}
                placeholder="000000 or your mobile code"
                value={tfaCode}
                onChange={(e) => setTfaCode(e.target.value.replace(/\D/g, ''))}
                required
                className="font-mono text-center tracking-[0.5em] text-2xl pr-4 pl-4"
              />
              <p className="text-xs text-mute text-left">
                Enter the 6-digit TOTP code generated by Google Authenticator, or type <code className="bg-canvas-soft px-1.5 py-0.5 rounded font-mono font-bold text-ink">123456</code> to test/demo.
              </p>
            </div>

            <Button type="submit" className="w-full text-base py-4 font-bold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying code...
                </span>
              ) : (
                'Verify & Login'
              )}
            </Button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-canvas-soft text-center text-sm text-body">
          <span>New to InvoiceGuard? </span>
          <button
            onClick={() => onNavigate('SignUp')}
            className="font-bold text-ink underline hover:text-mute transition-colors cursor-pointer"
          >
            Create an Account
          </button>
        </div>
      </Card>
    </div>
  )
}
export default SignIn
