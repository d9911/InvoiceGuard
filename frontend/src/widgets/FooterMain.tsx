import React from 'react'
import { ShieldCheck } from 'lucide-react'

export function FooterMain() {
  return (
    <footer className="bg-ink text-canvas-soft py-16 px-6 mt-20 text-left border-t border-primary/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 text-sm">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-ink" />
            </div>
            <span className="text-lg font-display font-black text-white">InvoiceGuard</span>
          </div>
          <p className="text-xs text-mute leading-relaxed">Vivid aesthetic design meets state-of-the-art POS invoice signature security, engineered under active telemetry compliance rules.</p>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Product</h5>
          <ul className="space-y-2 text-xs text-mute">
            <li className="hover:text-primary transition-colors cursor-pointer">Global Transfers</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Settlement Pool</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Merchant SDK</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Developer Console</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h5 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Regulatory</h5>
          <ul className="space-y-2 text-xs text-mute">
            <li className="hover:text-primary transition-colors cursor-pointer">E-Money Protection</li>
            <li className="hover:text-primary transition-colors cursor-pointer">MFA Compliance regulations</li>
            <li className="hover:text-primary transition-colors cursor-pointer">HMAC HMAC Signing Keys</li>
            <li className="hover:text-primary transition-colors cursor-pointer">Audit Ledger Log</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h5 className="font-semibold text-white text-xs uppercase tracking-wider font-mono">Developer Contact</h5>
          <p className="text-xs text-mute leading-normal">
            Denis Gutsuliak
            <br />
            Email:{' '}
            <a href="mailto:admin@d9911.org" className="underline hover:text-primary">
              admin@d9911.org
            </a>
            <br />
            Telegram:{' '}
            <a href="https://t.me/d9911/" target="_blank" rel="noreferrer" className="underline hover:text-primary">
              @d9911
            </a>
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-mute gap-4 leading-none">
        <span>&copy; {new Date().getFullYear()} InvoiceGuard. Custom crafted fintech simulator module. GPL-3.0 License.</span>
        <div className="flex gap-6">
          <span className="hover:text-white cursor-pointer hover:underline">Privacy Charter</span>
          <span className="hover:text-white cursor-pointer hover:underline">Terms of Service</span>
          <span className="hover:text-white cursor-pointer hover:underline">API Docs</span>
        </div>
      </div>
    </footer>
  )
}

export default FooterMain
