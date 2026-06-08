import React from 'react'
import { Button } from '@/shared/ui/Button'
import { ShieldAlert, User, LogOut, CheckCircle2, Lock, Activity, ShieldCheck } from 'lucide-react'

interface NavbarProps {
  userEmail: string | null
  onNavigate: (page: string) => void
  currentPage: string
  onLogout: () => void
  is2FAEnabled: boolean
}

export function NavbarMain({ userEmail, onNavigate, currentPage, onLogout, is2FAEnabled }: NavbarProps) {
  return (
    <nav className="sticky top-0 w-full bg-white px-6 py-4 flex justify-between items-center z-50 border-b border-canvas-soft shadow-sm">
      <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-90 select-none group" onClick={() => onNavigate('MainHome')}>
        <div className="w-9 h-9 bg-primary group-hover:bg-primary-active transition-all rounded-full flex items-center justify-center font-black text-ink shadow-sm relative">
          <ShieldCheck className="w-5 h-5 text-ink" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-positive rounded-full border-2 border-white" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xl font-display font-black leading-tight tracking-tight">
            Invoice<span className="text-primary-pale bg-ink px-1.5 py-0.5 rounded ml-0.5 select-all font-mono text-[11px] uppercase tracking-normal">Guard</span>
          </span>
          <span className="text-[10px] text-mute font-medium uppercase tracking-widest -mt-0.5">Fintech Core</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-8">
        <button
          onClick={() => onNavigate('MainHome')}
          className={`text-sm font-semibold transition-colors hover:text-ink cursor-pointer ${currentPage === 'MainHome' ? 'text-ink border-b-2 border-primary pb-1' : 'text-body'}`}
        >
          Transfers
        </button>
        <button
          onClick={() => {
            if (userEmail) {
              onNavigate('MainHome')
              // Scroll to invoices list or trigger it
              setTimeout(() => {
                document.getElementById('invoices-section')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            } else {
              onNavigate('SignIn')
            }
          }}
          className="text-sm font-semibold text-body hover:text-ink transition-colors cursor-pointer"
        >
          My Invoices
        </button>
        <button
          onClick={() => {
            onNavigate('MainHome')
            setTimeout(() => {
              document.getElementById('webhook-section')?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
          }}
          className="text-sm font-semibold text-body hover:text-ink transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Activity className="w-4 h-4 text-primary" /> Webhook Console
        </button>
      </div>

      <div className="flex gap-4 items-center">
        {userEmail ? (
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs text-mute font-medium">Logged in</span>
              <span className="text-sm font-bold text-ink flex items-center gap-1 leading-none mt-0.5">
                {is2FAEnabled ? (
                  <span title="Protected by 2FA" className="flex items-center">
                    <Lock className="w-3.5 h-3.5 text-positive" />
                  </span>
                ) : (
                  <span title="2FA disabled" className="flex items-center">
                    <Lock className="w-3.5 h-3.5 text-warning" />
                  </span>
                )}
                {userEmail}
              </span>
            </div>

            {/* Custom 2FA status indicator pill */}
            {is2FAEnabled ? (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-primary-pale text-ink-deep text-xs font-semibold rounded-full border border-primary/20">
                <span className="w-1.5 h-1.5 bg-positive rounded-full animate-pulse" />
                2FA Secure
              </span>
            ) : (
              <button
                onClick={() => {
                  onNavigate('MainHome')
                  setTimeout(() => {
                    document.getElementById('security-section')?.scrollIntoView({ behavior: 'smooth' })
                  }, 100)
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-warning/15 text-warning-deep text-xs font-semibold rounded-full hover:bg-warning/25 transition-all"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Setup 2FA
              </button>
            )}

            <Button variant="tertiary" size="sm" onClick={onLogout} className="text-xs py-1.5 px-3.5 flex items-center gap-1 border-ink/40">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </Button>
          </div>
        ) : (
          <>
            <button onClick={() => onNavigate('SignIn')} className="text-sm font-semibold text-body hover:text-ink px-3 py-2 cursor-pointer transition-colors">
              Log in
            </button>
            <Button size="sm" onClick={() => onNavigate('SignUp')} className="text-sm py-2 px-4 shadow-sm">
              Register
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
export default NavbarMain

