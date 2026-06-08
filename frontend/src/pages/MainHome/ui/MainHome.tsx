import React, { useState, useEffect } from 'react'
import { Card } from '@/src/shared/ui/Card'
import { Button } from '@/src/shared/ui/Button'
import { Input } from '@/src/shared/ui/Input'
import { 
  ArrowRight, ArrowUpDown, Check, Lock, ShieldCheck, CheckCircle2, AlertCircle, 
  AlertTriangle, Copy, CreditCard, Plus, RefreshCw, User, Activity, Wallet, 
  Send, Share2, FileText, Building2, Timer, Globe, ExternalLink, ShieldAlert
} from 'lucide-react'
import { IInvoice, IMerchant, I2FASetupResponse } from '@/src/types'
import { useAuth } from '../../../shared/api/AuthContext'

interface MainHomeProps {
  token: string | null
  userEmail: string | null
  onNavigate: (page: string) => void
  is2FAEnabled: boolean
  setIs2FAEnabled: React.Dispatch<React.SetStateAction<boolean>>
}

// Fixed exchange rates relative to GBP (1.00) for hero calculator
const CURRENCY_RATES: { [key: string]: number } = {
  GBP: 1.00,
  EUR: 1.16,
  USD: 1.25,
  AUD: 1.88
}

export function MainHome({ token, userEmail, onNavigate, is2FAEnabled, setIs2FAEnabled }: MainHomeProps) {
  const { apiFetch } = useAuth()
  // --- Hero Converter State ---
  const [sendAmount, setSendAmount] = useState<number>(1000)
  const [fromCurrency, setFromCurrency] = useState<string>('GBP')
  const [toCurrency, setToCurrency] = useState<string>('EUR')
  const [convertedAmount, setConvertedAmount] = useState<number>(1160)

  // --- Invoice Creation State ---
  const [invoiceAmount, setInvoiceAmount] = useState<string>('250.00')
  const [invoiceCurrency, setInvoiceCurrency] = useState<string>('USD')
  const [selectedMerchant, setSelectedMerchant] = useState<string>('merchant_123')
  const [merchantFeePercent, setMerchantFeePercent] = useState<number>(2.5)
  const [merchantSecret, setMerchantSecret] = useState<string>('super_secret_key')

  // --- DB / Collection States ---
  const [invoices, setInvoices] = useState<IInvoice[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<IInvoice | null>(null)
  
  // --- 2FA Activation State ---
  const [tfaSetup, setTfaSetup] = useState<I2FASetupResponse | null>(null)
  const [tfaInputCode, setTfaInputCode] = useState<string>('')
  const [tfaSuccess, setTfaSuccess] = useState<string>('')
  const [tfaError, setTfaError] = useState<string>('')
  
  // --- Webhook Testing State ---
  const [webhookStatus, setWebhookStatus] = useState<'paid' | 'failed'>('paid')
  const [webhookLogs, setWebhookLogs] = useState<string[]>([])
  const [isSignaturesLoading, setIsSignaturesLoading] = useState<boolean>(false)
  const [simulatedNonce, setSimulatedNonce] = useState<string>('')
  const [simulatedTimestamp, setSimulatedTimestamp] = useState<number>(0)

  // --- Copy Clipboard Helpers ---
  const [copiedInvoiceId, setCopiedInvoiceId] = useState<string | null>(null)
  const [copiedSecret, setCopiedSecret] = useState<boolean>(false)

  // --- Notification Toast info ---
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Trigger brief Toast alert
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

  // --- Effects ---
  // Convert money dynamically in Hero
  useEffect(() => {
    const fromRate = CURRENCY_RATES[fromCurrency] || 1
    const toRate = CURRENCY_RATES[toCurrency] || 1
    const baseValue = sendAmount / fromRate
    const finalVal = baseValue * toRate
    setConvertedAmount(parseFloat(finalVal.toFixed(2)))
  }, [sendAmount, fromCurrency, toCurrency])

  // Fetch live invoices if authenticated
  const fetchInvoices = async () => {
    if (!token) return
    try {
      const res = await apiFetch('/my-invoices')
      if (res.ok) {
        const list = await res.json()
        setInvoices(list)
        localStorage.setItem(`invoice_guard_local_invoices_${userEmail}`, JSON.stringify(list))
        // Auto-select first invoice to populate details if none selected yet
        if (list.length > 0 && !selectedInvoice) {
          setSelectedInvoice(list[0])
        }
      } else if (res.status === 404) {
        // Fallback for stateless external backends that do not have list endpoint
        const localListStr = localStorage.getItem(`invoice_guard_local_invoices_${userEmail}`)
        if (localListStr) {
          const localList: IInvoice[] = JSON.parse(localListStr)
          setInvoices(localList)
          if (localList.length > 0 && !selectedInvoice) {
            setSelectedInvoice(localList[0])
          }
          
          // Background update of each invoice status from the live backend
          const updatedList = [...localList]
          let changed = false
          for (let i = 0; i < updatedList.length; i++) {
            const inv = updatedList[i]
            try {
              const checkRes = await apiFetch(`/invoice/${inv.invoiceId}`)
              if (checkRes.ok) {
                const updatedInv = await checkRes.json()
                if (updatedInv.status !== inv.status) {
                  updatedList[i] = updatedInv
                  changed = true
                }
              }
            } catch (err) {
              console.error('Failed to update invoice in background:', err)
            }
          }
          if (changed) {
            setInvoices(updatedList)
            localStorage.setItem(`invoice_guard_local_invoices_${userEmail}`, JSON.stringify(updatedList))
            if (selectedInvoice) {
              const match = updatedList.find(i => i.invoiceId === selectedInvoice.invoiceId)
              if (match) setSelectedInvoice(match)
            }
          }
        }
      }
    } catch (e) {
      console.error('Failed to load user invoices:', e)
    }
  }

  useEffect(() => {
    fetchInvoices()
  }, [token])

  // Set fresh random Webhook details on selection
  useEffect(() => {
    if (selectedInvoice) {
      setSimulatedNonce('nonce_' + Math.random().toString(36).slice(2, 10))
      setSimulatedTimestamp(Math.floor(Date.now() / 1000))
    }
  }, [selectedInvoice])

  // Keep timestamp rolling while waiting in simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTimestamp(Math.floor(Date.now() / 1000))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Copy helper
  const handleCopyText = (text: string, type: 'secret' | 'id') => {
    navigator.clipboard.writeText(text)
    if (type === 'secret') {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    } else {
      setCopiedInvoiceId(text)
      setTimeout(() => setCopiedInvoiceId(null), 2000)
    }
    showToast('Copied payload parameters.')
  }

  // Swap currencies
  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    const tempAmount = sendAmount
    setSendAmount(convertedAmount)
  }

  // --- Form Handlers ---
  const handleHeroConverterAction = () => {
    if (!token) {
      showToast('Welcome inside! Please sign up or login to start making transfers.')
      onNavigate('SignIn')
    } else {
      // Transfer values to create invoice panel
      setInvoiceAmount(convertedAmount.toFixed(2))
      setInvoiceCurrency(toCurrency)
      showToast(`Converter values passed. Ready to generate your ${toCurrency} invoice!`)
      // Scroll to Invoice creation panel
      document.getElementById('merchant-section')?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Create standard fintech Invoice
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) {
      showToast('Authentication token expired. Please login.')
      return
    }

    const floatVal = parseFloat(invoiceAmount)
    if (isNaN(floatVal) || floatVal <= 0) {
      showToast('Please specify a positive invoice amount.')
      return
    }

    // Convert major units to minor units (e.g. 250.00 -> 25000 cents)
    const minorUnits = Math.round(floatVal * 100)

    try {
      const res = await apiFetch('/invoice', {
        method: 'POST',
        body: JSON.stringify({
          amount: minorUnits,
          currency: invoiceCurrency,
          merchantId: selectedMerchant
        })
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create invoice')
      }

      showToast(`Success! Generated Invoice ${data.invoiceId}`)
      
      // Save locally to support stateless backend configuration
      try {
        const localListStr = localStorage.getItem(`invoice_guard_local_invoices_${userEmail}`)
        let localList: IInvoice[] = localListStr ? JSON.parse(localListStr) : []
        if (!localList.some(i => i.invoiceId === data.invoiceId)) {
          localList = [data, ...localList]
          localStorage.setItem(`invoice_guard_local_invoices_${userEmail}`, JSON.stringify(localList))
        }
      } catch (err) {
        console.error('LocalStorage persistence failed:', err)
      }

      await fetchInvoices()
      setSelectedInvoice(data)
      
      // Scroll to detail portal below
      setTimeout(() => {
        document.getElementById('webhook-section')?.scrollIntoView({ behavior: 'smooth' })
      }, 200)

    } catch (e: any) {
      showToast(e.message)
    }
  }

  // 2FA setups
  const handleInit2FA = async () => {
    if (!token) return
    setTfaError('')
    setTfaSuccess('')

    try {
      const res = await apiFetch('/auth/2fa/enable', {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        setTfaSetup(data)
        showToast('Generated secure Authenticator tokens!')
      } else {
        throw new Error(data.error || 'Failed generating secrets')
      }
    } catch (e: any) {
      setTfaError(e.message)
    }
  }

  const handleVerify2FA = async () => {
    if (!token || !tfaInputCode) return
    setTfaError('')
    setTfaSuccess('')

    try {
      const res = await apiFetch('/auth/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ token: tfaInputCode })
      })
      const data = await res.json()
      if (res.ok) {
        setIs2FAEnabled(true)
        setTfaSuccess('Awesome! Two-Factor Authentication is fully verified and enabled.')
        setTfaSetup(null)
        showToast('Account successfully secured.')
      } else {
        throw new Error(data.error || 'Verification code declined')
      }
    } catch (e: any) {
      setTfaError(e.message)
    }
  }

  // Dynamic status check
  const handleCheckLiveStatus = async (id: string) => {
    try {
      const res = await apiFetch(`/invoice/${id}`)
      if (res.ok) {
        const inv = await res.json()
        setSelectedInvoice(inv)
        setInvoices(prev => prev.map(i => i.invoiceId === id ? inv : i))
        showToast(`Invoice status: ${inv.status.toUpperCase()}`)
      }
    } catch (e) {
      console.error('Error fetching live invoice state:', e)
    }
  }

  // --- HMAC SHA-256 Webhook simulator payload executor ---
  const handleTriggerWebhookSimulator = async () => {
    if (!selectedInvoice) return
    setIsSignaturesLoading(true)

    // Form payload matching Zod webhook validation contract
    const payloadObject = {
      invoiceId: selectedInvoice.invoiceId,
      status: webhookStatus
    }
    const payloadStr = JSON.stringify(payloadObject)

    // Compute direct SHA-256 HMAC of the payloadStr using Web Crypto API in client layer
    // to strictly match the Server HMAC validation rules
    try {
      // 1. Convert secret to ArrayBuffer
      const encoder = new TextEncoder()
      const secretKeyBuffer = encoder.encode(merchantSecret)
      const payloadBuffer = encoder.encode(payloadStr)

      // 2. Import cryptographic Key representation
      const CryptoKey = await window.crypto.subtle.importKey(
        'raw', 
        secretKeyBuffer, 
        { name: 'HMAC', hash: 'SHA-256' }, 
        false, 
        ['sign']
      )

      // 3. Perform Sign calculation
      const signatureBuffer = await window.crypto.subtle.sign('HMAC', CryptoKey, payloadBuffer)
      
      // 4. Transform sig array byte elements to Hex blocks
      const signatureArray = Array.from(new Uint8Array(signatureBuffer))
      const calculatedHexSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // 5. Send post requests representing the Bank Webhook callback
      const webhookResponse = await fetch('/api/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Signature': calculatedHexSignature,
          'X-Timestamp': simulatedTimestamp.toString(),
          'X-Nonce': simulatedNonce
        },
        body: payloadStr
      })

      const outcome = await webhookResponse.json()
      
      // Add debug traces inside local visual Logger
      const timestampString = new Date().toLocaleTimeString()
      let logMsg = `[${timestampString}] Webhook POST: StatusCode ${webhookResponse.status}. Outcome: ${JSON.stringify(outcome)}`
      if (!webhookResponse.ok) {
        logMsg = `[${timestampString}] ❌ Failed POST: ${outcome.error}`
      } else {
        logMsg = `[${timestampString}] ✅ Verified! Signature matching. Invoice toggled to: ${outcome.status}`
        // Trigger live refresh
        await handleCheckLiveStatus(selectedInvoice.invoiceId)
      }
      setWebhookLogs(prev => [logMsg, ...prev])
      showToast(webhookResponse.ok ? 'Status synchronized!' : 'Verification failed!')

      // Rotate random Nonce for next sequence to bypass replay lock filters
      setSimulatedNonce('nonce_' + Math.random().toString(36).slice(2, 10))

    } catch (err: any) {
      console.error(err)
      setWebhookLogs(prev => [`[${new Date().toLocaleTimeString()}] Crypto Error: ${err.message}`, ...prev])
    } finally {
      setIsSignaturesLoading(false)
    }
  }

  const qrCodeSrc = tfaSetup ? (tfaSetup.qrCode || (tfaSetup as any).qr || (tfaSetup as any).qrcode || (tfaSetup as any).qr_code || '') : ''
  const secretKey = tfaSetup ? (tfaSetup.secret || (tfaSetup as any).secretKey || (tfaSetup as any).secret_key || '') : ''

  return (
    <div className="space-y-0.5 bg-canvas-soft min-h-screen pb-16">
      
      {/* Toast alert system banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 max-w-sm bg-ink text-white font-semibold text-sm px-5 py-4 rounded-xl shadow-2xl border border-primary/20 flex items-center gap-3 z-[9999] animate-bounce">
          <Activity className="w-5 h-5 text-primary animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- SECTION 1: HERO BAND VIBRANT CANVAS --- */}
      <section className="bg-canvas-soft px-6 py-16 md:py-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8 xl:gap-16">
        <div className="w-full lg:w-1/2 flex flex-col text-left">
          <div className="inline-flex items-center gap-2 bg-primary-pale text-ink-deep text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider mb-6 w-fit border border-primary/15">
            <span className="w-2 h-2 bg-positive rounded-full animate-ping" />
            Vibrant Wise Aesthetic Pairing
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-black leading-[0.95] tracking-tight text-ink">
            Global money-transfer security.
          </h1>
          <p className="text-lg sm:text-xl text-body mt-6 mb-8 font-sans leading-relaxed max-w-lg">
            InvoiceGuard utilizes premium HMAC signatures, unique transaction nonces, cryptographic 2FA shield codes, and fully real-time tracing logs. Simple, Scandinavian-sleek, and robust.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="lg" className="font-bold cursor-pointer" onClick={() => {
              if (userEmail) {
                document.getElementById('merchant-section')?.scrollIntoView({ behavior: 'smooth' })
              } else {
                onNavigate('SignUp')
              }
            }}>
              {userEmail ? 'Create Live Invoice' : 'Open Free Account'}
            </Button>
            <Button variant="tertiary" size="lg" className="font-bold cursor-pointer border-ink/30" onClick={() => {
              document.getElementById('webhook-section')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Try Webhook Sandbox
            </Button>
          </div>
        </div>

        {/* Dynamic Currency Converter Card - Hero Signature Widget */}
        <div className="w-full lg:w-1/2 max-w-[480px]">
          <Card className="bg-white border-2 border-ink p-8 hover:transform hover:scale-[1.01] transition-transform duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-display font-black leading-none text-ink">Exchange Rate Rates</h3>
              <span className="bg-canvas-soft px-3 py-1 text-xs font-black rounded-lg text-body uppercase tracking-wider font-mono">Real-Time</span>
            </div>

            <div className="space-y-4 relative">
              {/* You Send field */}
              <div className="bg-canvas-soft p-5 rounded-xl border border-ink/10 flex justify-between items-center">
                <div className="flex flex-col text-left space-y-1">
                  <label className="text-xs text-mute font-bold uppercase tracking-wider">You Send</label>
                  <input 
                    type="number" 
                    value={sendAmount} 
                    onChange={(e) => setSendAmount(parseFloat(e.target.value) || 0)}
                    className="bg-transparent text-2xl font-black text-ink outline-none w-full"
                  />
                </div>
                <select 
                  value={fromCurrency} 
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="bg-white text-ink text-lg font-black p-2.5 rounded-lg border border-ink/10 cursor-pointer outline-none shadow-sm"
                >
                  <option value="GBP">🇬🇧 GBP</option>
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="AUD">🇦🇺 AUD</option>
                </select>
              </div>

              {/* Middle swap decorative arrow button */}
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 top-[47%] z-10">
                <button 
                  onClick={handleSwapCurrencies}
                  className="w-10 h-10 bg-primary hover:bg-primary-active rounded-full flex items-center justify-center border-2 border-ink shadow transition-all hover:rotate-180 duration-300 cursor-pointer active:scale-90"
                  title="Swap currencies"
                >
                  <ArrowUpDown className="w-4 h-4 text-ink" />
                </button>
              </div>

              {/* Recipient Gets field */}
              <div className="bg-canvas-soft p-5 rounded-xl border border-ink/10 flex justify-between items-center">
                <div className="flex flex-col text-left space-y-1">
                  <label className="text-xs text-mute font-bold uppercase tracking-wider">Recipient Gets</label>
                  <input 
                    type="number" 
                    value={convertedAmount} 
                    readOnly
                    className="bg-transparent text-2xl font-black text-mute outline-none w-full cursor-not-allowed"
                  />
                </div>
                <select 
                  value={toCurrency} 
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="bg-white text-ink text-lg font-black p-2.5 rounded-lg border border-ink/10 cursor-pointer outline-none shadow-sm"
                >
                  <option value="EUR">🇪🇺 EUR</option>
                  <option value="GBP">🇬🇧 GBP</option>
                  <option value="USD">🇺🇸 USD</option>
                  <option value="AUD">🇦🇺 AUD</option>
                </select>
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-canvas-soft flex flex-col text-left space-y-3.5 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-mute font-medium flex items-center gap-1"><InfoCircle className="w-4 h-4" /> Calculated Rate:</span>
                <span className="font-bold text-ink">
                  1 {fromCurrency} = {((CURRENCY_RATES[toCurrency] || 1) / (CURRENCY_RATES[fromCurrency] || 1)).toFixed(4)} {toCurrency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mute font-medium">Standard Transfer Fee:</span>
                <span className="font-bold text-positive">Free (0.00%)</span>
              </div>
            </div>

            <Button 
              className="w-full text-lg py-4 font-black tracking-tight mt-6"
              onClick={handleHeroConverterAction}
            >
              Get Started with {toCurrency}
            </Button>
          </Card>
        </div>
      </section>

      {/* --- SECTION 2: MARKETING FEATURE GRID (3-up Bento cards) --- */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-display font-black leading-none mb-4">Secure Financial Engineering</h2>
            <p className="text-body text-base">We combine deep cryptographic compliance with beautiful responsive experiences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card variant="sage" className="p-8 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-positive" />
              </div>
              <h4 className="text-xl font-display font-black mb-3">HMAC-SHA256 Signatures</h4>
              <p className="text-sm text-body leading-relaxed">Every webhook is dynamically validated, ensuring payload integrity through custom security hashes of the raw transaction body.</p>
            </Card>

            <Card variant="green" className="p-8 hover:shadow-lg transition-shadow border border-primary/20">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Lock className="w-6 h-6 text-ink" />
              </div>
              <h4 className="text-xl font-display font-black mb-3">Modular 2FA MFA Protect</h4>
              <p className="text-sm text-body leading-relaxed">Protects crucial accounts from breaches. Instantly connect Google Authenticator using local secrets or manual emergency backups.</p>
            </Card>

            <Card variant="dark" className="p-8 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h4 className="text-xl font-display font-black text-primary mb-3">In-Memory Audit Log</h4>
              <p className="text-sm text-primary-pale/80 leading-relaxed">NoSQL records are equipped with optimistic concurrency version locks and strict timestamp boundaries to stop billing race conditions.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* If logged out, show visual placeholder card inviting user to sign up */}
      {!userEmail && (
        <section className="bg-canvas-soft py-16 px-6 max-w-7xl mx-auto">
          <Card className="bg-white p-12 text-center border border-ink/10 max-w-3xl mx-auto">
            <Lock className="w-16 h-16 text-warning mx-auto mb-6" />
            <h2 className="text-3xl font-display font-black mb-4">Fintech Operations Dashboard</h2>
            <p className="text-body text-base max-w-lg mx-auto mb-8">
              Authenticate into the sandbox to generate invoices, configure secure two-factor permissions, and play inside the HMAC dynamic signature validation testing laboratory.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" onClick={() => onNavigate('SignUp')}>Create Sandbox Account</Button>
              <Button variant="secondary" size="lg" onClick={() => onNavigate('SignIn')}>Sign In</Button>
            </div>
          </Card>
        </section>
      )}

      {/* --- AUTHENTICATED SANDBOX WORKSPACE --- */}
      {userEmail && (
        <div className="max-w-7xl mx-auto px-6 space-y-12 py-10">
          
          <div className="border-b border-ink/5 pb-6 text-left">
            <h2 className="text-4xl font-display font-black tracking-tight text-ink flex items-center gap-2">
              <Wallet className="w-10 h-10 text-primary" /> Financial Security Sandbox
            </h2>
            <p className="text-body text-sm mt-1">
              Active workspace for <code className="font-bold bg-white text-ink px-2 py-0.5 rounded border border-ink/10 text-xs">{userEmail}</code>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT PORTFOLIO GRID: INVOICE GENERATOR (SPAN 5) --- */}
            <div id="merchant-section" className="lg:col-span-5 space-y-8">
              
              {/* Creator Form */}
              <Card className="bg-white border border-ink/10 text-left">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-display font-black">Generate Secure Invoice</h3>
                    <p className="text-xs text-mute">Creates a billable minor-unit transaction</p>
                  </div>
                  <FileText className="w-6 h-6 text-primary" />
                </div>

                <form onSubmit={handleCreateInvoice} className="space-y-5">
                  <Input 
                    label="Amount (in standard decimal units)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 250.00"
                    suffix={invoiceCurrency}
                    value={invoiceAmount}
                    onChange={(e) => {
                      setSendAmount(parseFloat(e.target.value) || 0);
                      setInvoiceAmount(e.target.value);
                    }}
                    required
                  />

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-ink">Bill-To Currency</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['USD', 'EUR', 'GBP', 'AUD'].map((curr) => (
                        <button
                          key={curr}
                          type="button"
                          onClick={() => setInvoiceCurrency(curr)}
                          className={`py-2 px-3 text-xs font-black rounded-lg border transition-all cursor-pointer ${
                            invoiceCurrency === curr 
                              ? 'bg-primary text-ink border-ink' 
                              : 'bg-canvas-soft text-body border-transparent hover:border-ink/20'
                          }`}
                        >
                          {curr}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-ink">Select Merchant Contract</label>
                    <select
                      value={selectedMerchant}
                      onChange={(e) => setSelectedMerchant(e.target.value)}
                      className="w-full bg-white text-ink rounded-lg border border-ink/20 px-4 py-3 text-base font-medium outline-none cursor-pointer focus:border-ink"
                    >
                      <option value="merchant_123">Test Merchant (ID: merchant_123)</option>
                    </select>
                  </div>

                  {/* Calculations card preview */}
                  <div className="bg-canvas-soft p-4 rounded-xl border border-ink/10 text-xs text-body space-y-2">
                    <div className="flex justify-between">
                      <span>Standard Settlement Fee ({merchantFeePercent}%):</span>
                      <span className="font-bold text-ink">
                        {invoiceCurrency} {((parseFloat(invoiceAmount) || 0) * (merchantFeePercent / 100)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-ink/5 text-sm">
                      <span className="font-bold text-ink">Net Cash Outflow to Merchant:</span>
                      <span className="font-black text-ink">
                        {invoiceCurrency} {((parseFloat(invoiceAmount) || 0) * (1 - merchantFeePercent / 100)).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full font-bold uppercase tracking-wider py-4">
                    Create Invoice & Get UUID
                  </Button>
                </form>
              </Card>

              {/* Security Shield Console (2FA Setup Control Panel) */}
              <Card id="security-section" className="bg-white border border-ink/10 text-left">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-display font-black flex items-center gap-1.5">
                      <Lock className="w-5 h-5 text-primary" /> Shield MFA Security
                    </h3>
                    <p className="text-xs text-mute">Two-Factor Authenticator access settings</p>
                  </div>
                  <User className="w-5 h-5 text-body" />
                </div>

                {is2FAEnabled ? (
                  <div className="bg-primary-pale/60 p-6 rounded-xl border border-primary/20 text-center space-y-3">
                    <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto text-ink">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-black text-ink-deep leading-none">2FA Protection Active</h4>
                    <p className="text-xs text-body leading-relaxed">
                      Every session login is armored behind cryptographically linked TOTP variables. Security logs are synced with system rules.
                    </p>
                    <div className="text-left font-mono text-[10px] bg-white border border-ink/5 p-3 rounded-lg text-mute space-y-1">
                      <div>ENFORCEMENT: [STRICT_TOTP_MFA]</div>
                      <div>HASH: SHA1_160_OCTETS</div>
                      <div>TOLERANCE: +/- 30s DRIFT_WINDOW</div>
                    </div>
                    <Button 
                      variant="tertiary" 
                      size="sm" 
                      className="border-negative/30 text-negative hover:bg-negative/5 w-full font-bold"
                      onClick={() => {
                        setIs2FAEnabled(false)
                        showToast('2FA Security protection disabled.')
                      }}
                    >
                      Disable 2FA Protection
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-body leading-relaxed">
                      Shield your merchant vault. Integrate Google Authenticator or custom TOTP credentials to protect high-volume transfers.
                    </p>

                    {!tfaSetup ? (
                      <Button variant="secondary" className="w-full font-bold flex items-center gap-2 justify-center" onClick={handleInit2FA}>
                        <ShieldAlert className="w-4 h-4 text-primary" /> Setup Authenticator Profile
                      </Button>
                    ) : (
                      <div className="space-y-4 pt-4 border-t border-canvas-soft">
                        <div className="flex flex-col items-center p-4 bg-canvas-soft rounded-xl text-center">
                          <p className="text-[11px] text-body font-bold mb-3 uppercase tracking-wider">Scan with Authenticator App</p>
                          <img 
                            src={qrCodeSrc} 
                            alt="Authenticator QR Code" 
                            className="bg-white p-3 rounded-lg border border-ink/10 shadow-sm w-44 h-44 cursor-crosshair select-none"
                            referrerPolicy="no-referrer"
                          />
                          <div className="mt-4 text-center">
                            <span className="text-[10px] text-mute uppercase font-black tracking-widest block mb-1">Or Copy Secret Base32</span>
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-ink/10">
                              <code className="font-mono text-xs font-black text-ink tracking-wider">{secretKey}</code>
                              <button 
                                onClick={() => handleCopyText(secretKey, 'secret')}
                                className="hover:text-primary transition-colors cursor-pointer text-mute"
                                title="Copy 2FA key"
                              >
                                {copiedSecret ? <Check className="w-3.5 h-3.5 text-positive" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {tfaError && (
                          <div className="p-3 bg-negative-bg border border-negative/20 text-rose-200 text-xs rounded-lg">
                            {tfaError}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Input 
                            label="Type 6-Digit Verification Code"
                            type="text"
                            maxLength={6}
                            placeholder="000000"
                            value={tfaInputCode}
                            onChange={(e) => setTfaInputCode(e.target.value.replace(/\D/g, ''))}
                            className="font-mono text-center tracking-[0.5em] text-lg pl-4 pr-4"
                          />
                          <p className="text-[10px] text-mute leading-normal">
                            Enter the dynamic code from your phone setup, or use standard mock <code className="font-bold bg-white text-ink px-1 rounded">123456</code> to test instantly.
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button className="w-full font-bold h-11 text-xs" onClick={handleVerify2FA}>
                            Verify & Activate Shield
                          </Button>
                          <Button variant="secondary" className="font-bold h-11 text-xs" onClick={() => setTfaSetup(null)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

            </div>

            {/* --- RIGHT PORTFOLIO GRID: INVOICES BOARD & WEBHOOK LAB (SPAN 7) --- */}
            <div id="invoices-section" className="lg:col-span-7 space-y-8 text-left">
              
              {/* Invoices collection table view */}
              <Card className="bg-white border border-ink/10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex flex-col">
                    <h3 className="text-xl font-display font-black">My Invoices Ledger</h3>
                    <p className="text-xs text-mute">Overview of generated client requests</p>
                  </div>
                  <Button variant="tertiary" size="sm" className="px-3.5 py-1.5 text-xs font-bold" onClick={fetchInvoices}>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-hover mr-1" /> Reload table
                  </Button>
                </div>

                {invoices.length === 0 ? (
                  <div className="py-12 text-center text-mute text-sm space-y-3.5 bg-canvas-soft/40 rounded-xl border border-dashed border-ink/10">
                    <CreditCard className="w-12 h-12 text-ink/15 mx-auto" />
                    <p className="font-semibold">No invoices generated yet</p>
                    <p className="text-xs max-w-xs mx-auto">Generate bills using the form on the left to activate the sandbox console.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-ink/5">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-canvas-soft border-b border-ink/5 text-ink text-xs font-black uppercase tracking-wider font-mono">
                          <th className="p-4">Invoice ID / Created At</th>
                          <th className="p-4">Amount</th>
                          <th className="p-4">Computed Fee</th>
                          <th className="p-4 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-ink/5">
                        {invoices.map((inv) => (
                          <tr 
                            key={inv.invoiceId}
                            onClick={() => setSelectedInvoice(inv)}
                            className={`hover:bg-primary-pale/20 transition-colors cursor-pointer ${
                              selectedInvoice?.invoiceId === inv.invoiceId ? 'bg-primary-pale/40 font-bold' : ''
                            }`}
                          >
                            <td className="p-4 space-y-0.5">
                              <div className="font-mono text-xs text-ink flex items-center gap-1">
                                {inv.invoiceId}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleCopyText(inv.invoiceId, 'id')
                                  }}
                                  className="text-[10px] text-mute hover:text-ink cursor-pointer"
                                  title="Copy Code"
                                >
                                  {copiedInvoiceId === inv.invoiceId ? (
                                    <Check className="text-positive w-3 h-3" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <span className="text-[10px] text-mute flex items-center gap-1 font-medium font-sans">
                                <Timer className="w-3 h-3" />
                                {new Date(inv.createdAt || '').toLocaleString()}
                              </span>
                            </td>
                            
                            <td className="p-4 text-ink font-mono font-bold text-sm">
                              {inv.currency} {(inv.amount / 100).toFixed(2)}
                            </td>
                            
                            <td className="p-4 text-body font-mono text-xs">
                              {inv.currency} {(inv.fee / 100).toFixed(2)}
                            </td>

                            <td className="p-4 text-center">
                              {inv.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-warning/15 text-warning-deep border border-warning/10">
                                  ● Pending
                                </span>
                              )}
                              {inv.status === 'paid' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-primary-pale text-ink-deep border border-primary/20">
                                  ✓ Paid
                                </span>
                              )}
                              {inv.status === 'failed' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-negative-bg text-rose-300 border border-negative/20">
                                  ✗ Failed
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Dynamic Invoice Detail & HMAC signature generator sandbox */}
              {selectedInvoice && (
                <div id="webhook-section" className="space-y-8 animate-fade-in">
                  
                  {/* Part A: Client billable checkout portal view */}
                  <Card className="bg-white border-2 border-ink">
                    <div className="flex justify-between items-start border-b border-canvas-soft pb-5 mb-5">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-mute uppercase font-black tracking-widest leading-none mb-1">Selected Checkout View</span>
                        <h4 className="text-2xl font-display font-black leading-none">{selectedInvoice.invoiceId}</h4>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs text-mute font-medium block">Invoice Status</span>
                        <div className="flex items-center gap-1.5 mt-1 justify-end">
                          <button 
                            onClick={() => handleCheckLiveStatus(selectedInvoice.invoiceId)}
                            className="p-1 hover:bg-canvas-soft rounded cursor-pointer text-mute hover:text-ink transition-colors"
                            title="Query Backend State"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          {selectedInvoice.status === 'pending' ? (
                            <span className="bg-warning/20 text-warning-deep text-xs font-black px-3 py-1 rounded-full border border-warning/15">PENDING ACCEPTANCE</span>
                          ) : selectedInvoice.status === 'paid' ? (
                            <span className="bg-primary text-ink text-xs font-black px-3 py-1 rounded-full">✓ SETTLED FULLY</span>
                          ) : (
                            <span className="bg-negative text-white text-xs font-black px-3 py-1 rounded-full">FAILED CANCELLED</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                      <div className="space-y-4">
                        <div className="flex flex-col bg-canvas-soft p-5 rounded-xl border border-ink/5">
                          <span className="text-xs text-mute font-bold uppercase tracking-wider mb-1">Total Due</span>
                          <span className="text-4xl font-display font-black text-ink font-mono">
                            {selectedInvoice.currency} {(selectedInvoice.amount / 100).toFixed(2)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-body space-y-1 bg-primary-pale/30 p-4 border border-primary/10 rounded-xl">
                          <div className="flex justify-between">
                            <span className="font-semibold text-ink">Associated Merchant:</span>
                            <span>{selectedInvoice.merchantId}</span>
                          </div>
                          <div className="flex justify-between font-mono">
                            <span>Transferred Rate Net (after 2.5% fee):</span>
                            <span className="font-bold text-ink-deep">
                              {selectedInvoice.currency} {(selectedInvoice.amountToReceive / 100).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1 border-t border-ink/5 font-mono">
                            <span>Platform Fee Margin:</span>
                            <span className="text-mute">
                              {selectedInvoice.currency} {(selectedInvoice.fee / 100).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mock credit card scan visual design pattern */}
                      <div className="bg-ink text-primary-pale p-6 rounded-2xl border border-primary/20 space-y-6 relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-15 translate-x-12 translate-y-12">
                          <ShieldCheck className="w-44 h-44 text-primary" />
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs uppercase font-mono tracking-widest text-primary font-black">SECURE TRANSIT PORTAL</span>
                          <Globe className="w-6 h-6 text-primary" />
                        </div>
                        <div className="space-y-1.5 text-left font-mono">
                          <div className="text-[12px] text-mute uppercase">Billing Key ID</div>
                          <div className="text-sm font-bold text-white tracking-wider select-all">{selectedInvoice.invoiceId}</div>
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="text-left font-mono">
                            <div className="text-[10px] text-mute uppercase">System Channel</div>
                            <div className="text-xs font-semibold text-white">HMAC_SHA256_RING</div>
                          </div>
                          <div className="w-9 h-6 bg-primary rounded-md opacity-95 flex items-center justify-center font-bold text-ink text-[10px]">
                            IG
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Part B: Full developer workspace container showing live cryptographic logs and Webhook triggers */}
                  <Card className="bg-ink text-white border-2 border-primary/30 text-left p-8 rounded-xl space-y-6">
                    <div className="flex justify-between items-center border-b border-primary/10 pb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                        <h4 className="text-lg font-display font-black text-primary uppercase tracking-wider">Dynamic POS Webhook Simulator</h4>
                      </div>
                      <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded uppercase tracking-widest font-black">
                        Developer Lab
                      </span>
                    </div>

                    <p className="text-xs text-primary-pale/85 leading-relaxed font-sans">
                      Fintech networks broadcast automated status webhooks once bank wires clear. Use our secure terminal to simulate the payment processor's signed <code className="text-primary font-mono bg-primary/5 px-1 rounded">POST /api/webhook</code> message!
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
                      
                      {/* Left Block: Config Controls */}
                      <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-primary/10">
                        <span className="text-[11px] text-primary font-black uppercase tracking-wider block">Simulator Parameters</span>
                        
                        <div className="space-y-1">
                          <label className="text-primary-pale/75 font-semibold block">Target Endpoint Address:</label>
                          <div className="bg-ink p-2.5 rounded border border-primary/15 text-[11px] text-white overflow-x-auto select-all">
                            POST <span className="text-primary">/api/webhook</span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-primary-pale/75 font-semibold block">Target Event Status Selection:</label>
                          <div className="flex gap-2">
                            {['paid', 'failed'].map((val) => (
                              <button
                                key={val}
                                onClick={() => setWebhookStatus(val as any)}
                                className={`flex-1 py-1.5 px-3 rounded font-black uppercase text-[10px] transition-all cursor-pointer ${
                                  webhookStatus === val 
                                    ? 'bg-primary text-ink' 
                                    : 'bg-white/5 text-primary-pale/60 hover:bg-white/10'
                                }`}
                              >
                                {val === 'paid' ? 'Paid (Successful)' : 'Failed (Declined)'}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2 text-[11px] text-primary-pale/80 space-y-3 pt-3 border-t border-primary/10">
                          <div className="flex justify-between">
                            <span>X-Timestamp Header:</span>
                            <span className="text-white text-right font-bold">{simulatedTimestamp}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>X-Nonce Header:</span>
                            <span className="text-white text-right font-bold tracking-tight">{simulatedNonce}</span>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="block">Merchant Secret Config:</span>
                            <input 
                              type="text" 
                              value={merchantSecret}
                              onChange={(e) => setMerchantSecret(e.target.value)}
                              className="bg-ink text-white border border-primary/15 rounded p-1.5 w-full text-xs font-mono focus:border-primary outline-none"
                            />
                            <p className="text-[9px] text-mute leading-tight">Must match the merchant webhook's secret (<code className="text-primary">super_secret_key</code>) to successfully clear the controller checks.</p>
                          </div>
                        </div>
                      </div>

                      {/* Right Block: Live Signature Output Preview */}
                      <div className="space-y-4 bg-white/5 p-5 rounded-xl border border-primary/10 flex flex-col justify-between">
                        <div className="space-y-3.5">
                          <span className="text-[11px] text-primary font-black uppercase tracking-wider block">Live Payload & Signature Output</span>
                          
                          <div className="space-y-1.5 text-left">
                            <span className="text-primary-pale/70 block font-semibold text-[10px]">1. Constructed Body Parameters (rawBody):</span>
                            <pre className="bg-ink text-[11px] p-2.5 rounded border border-primary/15 text-white overflow-x-auto whitespace-pre-wrap select-all">
                              {JSON.stringify({ invoiceId: selectedInvoice.invoiceId, status: webhookStatus })}
                            </pre>
                          </div>

                          <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center">
                              <span className="text-primary-pale/70 text-[10px] font-semibold">2. Live HMAC-SHA256 Token Header:</span>
                              <span className="text-[9px] bg-primary/10 text-primary px-1 rounded">Dynamic</span>
                            </div>
                            <div className="bg-ink text-[10px] p-2.5 rounded border border-primary/15 text-primary break-all select-all font-mono leading-relaxed">
                              {/* Standard text indication for the visual panel */}
                              [HMAC Signature recalculates instantly upon sending webhook]
                            </div>
                          </div>
                        </div>

                        <Button 
                          className="w-full h-11 bg-primary text-ink hover:bg-primary-active border-none text-xs font-black uppercase tracking-widest mt-4 cursor-pointer"
                          onClick={handleTriggerWebhookSimulator}
                          disabled={isSignaturesLoading}
                        >
                          {isSignaturesLoading ? (
                            <span className="flex items-center gap-2 justify-center">
                              <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                              Calculating HMAC Signature...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 justify-center">
                              <Send className="w-4 h-4" /> Execute Webhook Payload
                            </span>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Logging Console Display */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-primary/10">
                      <span className="text-[11px] text-primary font-black uppercase tracking-wider block">Local Network Output Logs</span>
                      <div className="bg-ink text-[11px] p-4 rounded-lg font-mono border border-primary/20 text-primary-pale h-36 overflow-y-auto space-y-2 text-left leading-relaxed">
                        {webhookLogs.length === 0 ? (
                          <div className="text-mute italic text-center py-8">Waiting for webhooks status updates...</div>
                        ) : (
                          webhookLogs.map((log, index) => (
                            <div key={index} className="font-mono border-b border-white/5 pb-1">
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>

                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  )
}

// Simple Helper Info Icons to keep things zero-dependency
function InfoCircle({ className = '' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}
export default MainHome
