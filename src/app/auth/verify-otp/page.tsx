'use client'

import { useState, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Step = 'enter-code' | 'verified'

export default function VerifyOtpPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const email        = searchParams.get('email')    || ''
  const password     = searchParams.get('password') || ''
  const name         = searchParams.get('name')     || ''
  const supabase     = createClient()

  const [step,    setStep]    = useState<Step>('enter-code')
  const [otp,     setOtp]     = useState(['', '', '', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputs = useRef<(HTMLInputElement | null)[]>([])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)
    if (value && index < 7) inputs.current[index + 1]?.focus()
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    if (pasted.length > 0) {
      const newOtp = [...Array(8).fill('')]
      pasted.split('').forEach((c, i) => { newOtp[i] = c })
      setOtp(newOtp)
      inputs.current[Math.min(pasted.length, 7)]?.focus()
    }
  }

  const handleVerify = async () => {
    setLoading(true)
    setError('')
    const token = otp.join('')

    if (token.length < 8) {
      setError('Veuillez saisir les 8 chiffres.')
      setLoading(false)
      return
    }

    // ✅ Vérifier le code OTP 8 chiffres (envoyé par signInWithOtp)
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email', // ← type email pour signInWithOtp
    })

    if (error) {
      setError('Code incorrect ou expiré. Vérifiez et réessayez.')
      setLoading(false)
      return
    }

    // ✅ Code correct — mettre à jour les metadata du user
    if (name) {
      await supabase.auth.updateUser({
        data: { full_name: name, role: 'postulant' }
      })
    }

    setStep('verified')

    // Redirection selon le rôle
    const role = data.user?.user_metadata?.role ?? 'postulant'
    setTimeout(() => {
      if (role === 'admin')         router.push('/dashboard/admin')
      else if (role === 'employee') router.push('/dashboard/employee')
      else                          router.push('/postulant/jobs')
    }, 1500)
  }

  const handleResend = async () => {
    setOtp(['', '', '', '', '', '', '', ''])
    setError('')
    inputs.current[0]?.focus()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })
    if (error) setError('Impossible de renvoyer. Attendez quelques minutes.')
  }

  const steps = [
    { label: 'Check your email',  desc: 'Code envoyé à votre boîte mail' },
    { label: 'Verify Code',       desc: 'Entrez le code à 8 chiffres'    },
    { label: 'Continue to login', desc: 'Start collaborating'             },
  ]
  const currentStep = step === 'verified' ? 2 : 1

  return (
    <div className="verify-split">

      {/* SIDEBAR */}
      <div className="verify-sidebar">
        <div className="logo"><span className="logo-text">Yunr</span></div>
        <div className="step-list">
          {steps.map((s, i) => (
            <div className="step-item" key={i}>
              <div className={`step-icon ${i < currentStep ? 'done' : i === currentStep ? 'active' : ''}`}>
                {i < currentStep ? '✓' : i === currentStep ? '◉' : i + 1}
              </div>
              <div className="step-info">
                <h4 className={i === currentStep ? 'active-label' : ''}>{s.label}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN */}
      <div className="verify-main">

        {/* ─── Saisir OTP ─── */}
        {step === 'enter-code' && (
          <>
            <div className="verify-icon">✉️</div>
            <h2 className="verify-title">Entrez le code reçu</h2>
            <p className="verify-sub">
              Code à <strong>8 chiffres</strong> envoyé à<br />
              <strong>{email}</strong>
            </p>

            {error && (
              <p style={{
                color: '#F04438', fontSize: '12px',
                marginBottom: '12px', textAlign: 'center',
              }}>
                ⚠️ {error}
              </p>
            )}

            {/* 8 cases OTP */}
            <div className="otp-row" onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputs.current[i] = el }}
                  className={`otp-box ${digit ? 'filled' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              className="btn-verify"
              onClick={handleVerify}
              disabled={loading || otp.join('').length < 8}
              style={{ opacity: otp.join('').length < 8 ? 0.6 : 1 }}
            >
              {loading ? 'Vérification...' : "Vérifier l'email"}
            </button>

            <p className="resend-text">
              Pas reçu le code ?{' '}
              <span className="auth-link" onClick={handleResend} style={{ cursor: 'pointer' }}>
                Renvoyer
              </span>
            </p>
            <Link href="/auth/login" className="back-link">← Retour à la connexion</Link>
          </>
        )}

        {/* ─── Vérifié ─── */}
        {step === 'verified' && (
          <>
            <div className="verify-icon success">✅</div>
            <h2 className="verify-title">Email vérifié !</h2>
            <p className="verify-sub">
              Votre compte a été confirmé avec succès.<br />
              Redirection en cours...
            </p>
          </>
        )}

      </div>
    </div>
  )
}