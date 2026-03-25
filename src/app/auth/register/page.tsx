'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      setLoading(false)
      return
    }

    // Creer un compte sans email de confirmation
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, role: 'postulant' },
        emailRedirectTo: undefined, //  pas d'email de confirmation
      },
    })

    if (signUpError && !signUpError.message.toLowerCase().includes('already registered')) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    // Envoyer OTP avec 8 chiffres via la fct signInWithOtp
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (otpError) {
      if (otpError.message.toLowerCase().includes('rate limit') ||
          otpError.message.toLowerCase().includes('exceeded')) {
        setError('⏳ Trop de tentatives. Attendez 1 heure et réessayez, ou utilisez un autre email.')
      } else {
        setError(otpError.message)
      }
      setLoading(false)
      return
    }

    // redirection vers OTP avec email + password en query (pour login après vérification)
    router.push(
      `/auth/verify-otp?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&name=${encodeURIComponent(name)}`
    )
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div>
          <div className="logo"><span className="logo-text">Yunr</span></div>
          <h1 className="form-title">Sign up</h1>
          <p className="form-sub">Start your journey with us today.</p>

          <form onSubmit={handleRegister}>
            {error && <div className="error-banner">{error}</div>}

            <div className="field">
              <label htmlFor="name">Name*</label>
              <input id="name" type="text" placeholder="Enter your name"
                value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email*</label>
              <input id="email" type="email" placeholder="Enter your email"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password*</label>
              <input id="password" type="password" placeholder="Create a password"
                value={password} onChange={e => setPassword(e.target.value)} required />
              <p className="field-hint">Must be at least 8 characters.</p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <button className="btn-google" onClick={handleGoogle}>
            <GoogleSVG /> Sign up with Google
          </button>
          <p className="auth-footer">
            Already have an account?{' '}
            <Link href="/auth/login" className="auth-link">Log in</Link>
          </p>
        </div>
        <div className="auth-page-footer">
          <span>© SoftyEducation</span>
          <span>✉ help@SoftyEducation.com</span>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-right-overlay">
          <div className="sparkles">✦ ✦✦</div>
          <h2>The smarter way to manage your team</h2>
          <p>Automatisez la présence avec l'IA, gérez les congés, publiez des offres d'emploi.</p>
          <div className="avatars-row">
            <div className="avatar-stack">
              {['#C4B5FD','#A78BFA','#D4A574','#C4B5FD'].map((c,i) => (
                <span key={i} style={{ background: c }} />
              ))}
            </div>
            <p>Join 40,000+ users</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleSVG() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}