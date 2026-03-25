import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PostulantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Seul le postulant accède à cet espace
  const role = user.user_metadata?.role
  if (role === 'admin')    redirect('/dashboard/admin')
  if (role === 'employee') redirect('/dashboard/employee')

  const fullName = (user.user_metadata?.full_name ?? user.email ?? '') as string
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Sora', sans-serif" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #E4E7EC',
        padding: '0 32px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        {/* Logo */}
        <Link href="/postulant/jobs" style={{ textDecoration: 'none' }}>
          <span style={{ fontSize: '22px', fontWeight: 700, color: '#7C3AED', fontStyle: 'italic', letterSpacing: '-1px' }}>
            Yunr
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/postulant/jobs" style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            fontWeight: 500, color: '#475467', textDecoration: 'none',
          }}>
            💼 Offres d&apos;emploi
          </Link>
          <Link href="/postulant/applications" style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
            fontWeight: 500, color: '#475467', textDecoration: 'none',
          }}>
            📄 Mes candidatures
          </Link>
        </div>

        {/* User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: '#EDE9FE', color: '#7C3AED',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '12px', fontWeight: 700,
          }}>
            {initials}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#101828' }}>{fullName}</span>
            <span style={{ fontSize: '10px', color: '#98A2B3' }}>Postulant</span>
          </div>
          <Link href="/auth/logout" style={{
            padding: '6px 14px', borderRadius: '8px',
            border: '1.5px solid #D0D5DD', fontSize: '12px',
            fontWeight: 500, color: '#475467', textDecoration: 'none',
          }}>
            Déconnexion
          </Link>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        {children}
      </main>

    </div>
  )
}