'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Step = 'enter-email' | 'check-email' | 'set-password' | 'success'

export default function ForgotPasswordPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [step,            setStep]            = useState<Step>('enter-email')
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState('')

  const stepList = [
    { label: 'Enter your Email',     desc: 'Please provide your email' },
    { label: 'Check your email',     desc: 'Choose a secure password' },
    { label: 'Set new password',     desc: 'Create your new password' },
    { label: 'Continue to Dashboard', desc: 'Start collaborating' },
  ]
  const stepIndex: Record<Step, number> = {
    'enter-email': 0, 'check-email': 1, 'set-password': 2, 'success': 3,
  }
  const current = stepIndex[step]

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/forgot-password?step=set-password`,
    })
    if (error) { setError(error.message); setLoading(false); return }
    setStep('check-email'); setLoading(false)
  }

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères.'); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) { setError(error.message); setLoading(false); return }
    setStep('success'); setLoading(false)
  }

  return (
    <div className="verify-split">

      {/* ── SIDEBAR ── */}
      <div className="verify-sidebar">
        <div className="logo"><span className="logo-text">Yunr</span></div>
        <div className="step-list">
          {stepList.map((s, i) => (
            <div className="step-item" key={i}>
              <div className={`step-icon ${i < current ? 'done' : i === current ? 'active' : ''}`}>
                {i < current ? '✓' : i === current ? '◉' : i + 1}
              </div>
              <div className="step-info">
                <h4 className={i === current ? 'active-label' : ''}>{s.label}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div className="verify-main">

        {/* Step 1 */}
        {step === 'enter-email' && (
          <>
            <div className="verify-icon">🔑</div>
            <h2 className="verify-title">Forgot password?</h2>
            <p className="verify-sub">No worries, we&apos;ll send you reset instructions.</p>
            {error && <p style={{ color:'var(--error)', fontSize:'12px', marginBottom:'12px' }}>{error}</p>}
            <form onSubmit={handleSendReset} style={{ width:'100%', maxWidth:'320px' }}>
              <div className="field" style={{ marginBottom:'14px' }}>
                <label>Email</label>
                <input type="email" placeholder="Enter your email"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <button type="submit" className="btn-verify" disabled={loading}>
                {loading ? 'Sending...' : 'Reset password'}
              </button>
            </form>
            <Link href="/auth/login" className="back-link">← Back to log in</Link>
          </>
        )}

        {/* Step 2 */}
        {step === 'check-email' && (
          <>
            <div className="verify-icon">✉️</div>
            <h2 className="verify-title">Check your email</h2>
            <p className="verify-sub">
              We sent a password reset link to<br />
              <strong>{email}</strong>
            </p>
            <button className="btn-verify" onClick={() => setStep('set-password')}>
              Open email app
            </button>
            <p className="resend-text">
              Didn&apos;t receive the email?{' '}
              <span className="auth-link"
                onClick={() => handleSendReset({ preventDefault: () => {} } as React.FormEvent)}>
                Click to resend
              </span>
            </p>
            <Link href="/auth/login" className="back-link">← Back to log in</Link>
          </>
        )}

        {/* Step 3 */}
        {step === 'set-password' && (
          <>
            <div className="verify-icon">🔑</div>
            <h2 className="verify-title">Set new password</h2>
            <p className="verify-sub">
              Your new password must be different<br />to previously used passwords.
            </p>
            {error && <p style={{ color:'var(--error)', fontSize:'12px', marginBottom:'12px' }}>{error}</p>}
            <form onSubmit={handleSetPassword} style={{ width:'100%', maxWidth:'320px' }}>
              <div className="field" style={{ marginBottom:'12px' }}>
                <label>Password</label>
                <input type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required />
                <p className="field-hint">Must be at least 8 characters.</p>
              </div>
              <div className="field" style={{ marginBottom:'16px' }}>
                <label>Confirm password</label>
                <input type="password" placeholder="••••••••"
                  value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-verify" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
            <Link href="/auth/login" className="back-link">← Back to log in</Link>
          </>
        )}

        {/* Step 4 */}
        {step === 'success' && (
          <>
            <div className="verify-icon success">✅</div>
            <h2 className="verify-title">Password reset</h2>
            <p className="verify-sub">
              Your password has been successfully reset.<br />
              Click below to log in magically.
            </p>
            <button className="btn-verify" onClick={() => router.push('/auth/login')}>
              Continue
            </button>
            <Link href="/auth/login" className="back-link">← Back to log in</Link>
          </>
        )}

      </div>
    </div>
  )
}