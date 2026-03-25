'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps { user: User }

const navAdmin = [
  { href: '/dashboard/admin',               icon: '🏠', label: 'Home',          badge: true },
  { href: '/dashboard/admin/registrations', icon: '📋', label: 'Registrations', badge: true },
  { href: '/dashboard/admin/leaves',        icon: '🏖️', label: 'Leaves'     },
  { href: '/dashboard/admin/employees',     icon: '👥', label: 'Employee'   },
  { href: '/dashboard/admin/jobs',          icon: '💼', label: 'Jobs'       },
  { href: '/dashboard/admin/recordings',    icon: '🎥', label: 'Recordings' },
]

const navEmployee = [
  { href: '/dashboard/employee',               icon: '🏠', label: 'Home', badge: true },
  { href: '/dashboard/employee/registrations', icon: '📋', label: 'Registrations' },
  { href: '/dashboard/employee/leaves',        icon: '🏖️', label: 'Leaves' },
  { href: '/dashboard/employee/jobs',          icon: '💼', label: 'Jobs'   },
  { href: '/dashboard/employee/recordings',    icon: '🎥', label: 'Recordings' },
]

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()

  const role      = (user.user_metadata?.role ?? 'employee') as string
  const fullName  = (user.user_metadata?.full_name ?? user.email ?? 'Utilisateur') as string
  const initials  = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const shortMail = user.email ? (user.email.length > 18 ? user.email.slice(0, 18) + '…' : user.email) : ''

  const navItems    = role === 'admin' ? navAdmin : navEmployee
  const settingsHref = '/dashboard/settings'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <aside style={{ width: '180px', minWidth: '180px', background: 'white', borderRight: '1px solid #E4E7EC', display: 'flex', flexDirection: 'column', minHeight: '100vh', fontFamily: "'Sora', sans-serif", position: 'sticky', top: 0, height: '100vh', overflowY: 'auto' }}>

      <div style={{ padding: '18px 18px 14px', borderBottom: '1px solid #E4E7EC' }}>
        <span style={{ fontSize: '22px', fontWeight: 700, color: '#7C3AED', fontStyle: 'italic', letterSpacing: '-1px' }}>Yunr</span>
      </div>

      <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(item => (
          <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, color: isActive(item.href) ? '#7C3AED' : '#475467', background: isActive(item.href) ? '#EDE9FE' : 'transparent', textDecoration: 'none' }}>
            <span style={{ fontSize: '14px', width: '18px', textAlign: 'center' }}>{item.icon}</span>
            <span style={{ flex: 1 }}>{item.label}</span>
            {item.badge && <span style={{ background: '#7C3AED', color: 'white', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px' }}>10</span>}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '12px 10px 16px', borderTop: '1px solid #E4E7EC' }}>
        <Link href={settingsHref} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 500, color: isActive(settingsHref) ? '#7C3AED' : '#475467', background: isActive(settingsHref) ? '#EDE9FE' : 'transparent', textDecoration: 'none', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px' }}>⚙️</span> Settings
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
            {user.user_metadata?.avatar_url ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#101828', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</div>
            <div style={{ fontSize: '10px', color: '#98A2B3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortMail}</div>
          </div>
          <button onClick={handleLogout} title="Déconnexion" style={{ border: 'none', background: 'none', fontSize: '14px', color: '#98A2B3', cursor: 'pointer', padding: '2px' }}>↗</button>
        </div>
      </div>
    </aside>
  )
}