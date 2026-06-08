import React, { useState } from 'react'
import { Card } from '@/src/shared/ui/Card'
import { Button } from '@/src/shared/ui/Button'
import { Input } from '@/src/shared/ui/Input'
import { CheckCircle2, Lock, Mail, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react'

interface SignUpProps {
  onNavigate: (page: string) => void
  onSuccess: (token: string, email: string) => void
}

export function SignUp({ onNavigate, onSuccess }: SignUpProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setFeedback('')

    if (!email || !password) {
      setError('Please fill in all details.')
      return
    }

    if (password.length < 5) {
      setError('Password must be at least 5 characters long (e.g., "d9911").')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setFeedback('Account created successfully!')
      setTimeout(() => {
        onSuccess(data.token, data.email)
      }, 1000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-6 bg-canvas-soft">
      <Card className="w-full max-w-md bg-white border border-ink/10 relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-primary-active" />

        <div className="flex items-center gap-1.5 mb-6 text-mute hover:text-ink cursor-pointer transition-colors text-sm font-semibold" onClick={() => onNavigate('MainHome')}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to main</span>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-primary-pale text-ink rounded-full mx-auto flex items-center justify-center mb-4 border border-primary/20">
            <ShieldCheck className="w-6 h-6 text-ink" />
          </div>
          <h2 className="text-3xl font-display font-black leading-none tracking-tight">
            Create account
          </h2>
          <p className="text-sm text-body mt-2.5">
            Join InvoiceGuard secure payments pool.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-negative-bg border border-negative/30 rounded-lg text-rose-200 text-sm flex items-start gap-2.5">
            <span className="font-bold flex-shrink-0">⚠️ Error:</span>
            <span className="text-left">{error}</span>
          </div>
        )}

        {feedback && (
          <div className="mb-6 p-4 bg-primary-pale border border-primary/30 rounded-lg text-ink-deep text-sm flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-positive flex-shrink-0" />
            <span className="text-left font-semibold">{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="e.g. user@d9911.org"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="font-medium"
          />

          <Input
            label="Create password"
            type="password"
            placeholder="min 5 characters (e.g. d9911)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="font-medium"
          />

          <div className="text-xs text-mute leading-relaxed text-left">
            By registering, you agree to our automated 2FA policy protection, real-time logging, and signature encryption protocols.
          </div>

          <Button type="submit" className="w-full text-base py-4 font-bold" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating your account...
              </span>
            ) : (
              'Create account'
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-canvas-soft text-center text-sm text-body">
          <span>Already have an account? </span>
          <button
            onClick={() => onNavigate('SignIn')}
            className="font-bold text-ink underline hover:text-mute transition-colors cursor-pointer"
          >
            Log In
          </button>
        </div>
      </Card>
    </div>
  )
}
export default SignUp
