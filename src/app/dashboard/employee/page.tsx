import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EmployeeHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: leaves } = await supabase
    .from('leaves')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const countByType = (type: string) => leaves?.filter((l: any) => l.type === type).length ?? 0

  const fullName = (profile?.full_name ?? user.user_metadata?.full_name ?? user.email ?? 'Employé') as string
  const initials = fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  const balance  = profile?.leave_balance ?? 30

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Sora', sans-serif" }}>
      <main style={{ flex: 1, padding: '28px 32px', background: 'white' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#101828' }}>Home</h1>
          <span style={{ fontSize: '16px', cursor: 'pointer', color: '#98A2B3' }}>🔍</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Vacation', value: countByType('Vacation') },
            { label: 'Casual',   value: countByType('Casual')   },
            { label: 'Personal', value: countByType('Personal') },
            { label: 'Sick',     value: countByType('Sick')     },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #E4E7EC', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#475467', fontWeight: 500, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                {s.label} <span style={{ cursor: 'pointer' }}>⋯</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#101828' }}>
                {String(s.value).padStart(2, '0')}
              </div>
            </div>
          ))}
        </div>

        {/* Latest Leaves Table */}
        <div style={{ border: '1px solid #E4E7EC', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E7EC' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#101828' }}>Latest Leaves</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={th}><input type="checkbox" /></th>
                <th style={th}>Submission Date ↓</th>
                <th style={th}>From – to</th>
                <th style={th}>Type</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {leaves && leaves.length > 0 ? leaves.map((leave: any) => (
                <tr key={leave.id}>
                  <td style={td}><input type="checkbox" /></td>
                  <td style={{ ...td, fontWeight: 600, color: '#101828' }}>
                    {new Date(leave.created_at).toLocaleDateString('fr-FR')} {new Date(leave.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={td}>
                    {new Date(leave.start_date).toLocaleDateString('fr-FR')} to {new Date(leave.end_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={td}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 500, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FED7AA' }}>
                      ☀ {leave.type}
                    </span>
                  </td>
                  <td style={td}>
                    <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, background: leave.status === 'pending' ? '#FEF3C7' : leave.status === 'approved' ? '#DCFCE7' : '#FEF2F2', color: leave.status === 'pending' ? '#D97706' : leave.status === 'approved' ? '#16A34A' : '#DC2626' }}>
                      {leave.status === 'pending' ? 'Pending' : leave.status === 'approved' ? 'Approved' : 'Rejected'}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#98A2B3', fontSize: '13px' }}>
                    Aucune demande de congé pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #E4E7EC' }}>
            <button style={btnPage}>← Previous</button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', background: n === 1 ? '#EDE9FE' : 'transparent', color: n === 1 ? '#7C3AED' : '#475467' }}>{n}</div>
              ))}
            </div>
            <button style={btnPage}>Next →</button>
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <div style={{ width: '240px', background: '#F9FAFB', borderLeft: '1px solid #E4E7EC', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, margin: '0 auto 10px', overflow: 'hidden' }}>
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#101828' }}>{fullName}</div>
          <div style={{ fontSize: '11px', color: '#475467', marginBottom: '14px' }}>
            {profile?.department ?? 'Employee'}
          </div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
            <a href="/dashboard/settings" style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, border: '1.5px solid #D0D5DD', background: 'white', color: '#101828', textDecoration: 'none' }}>Settings</a>
            <a href="/dashboard/employee/profile" style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, border: 'none', background: '#7C3AED', color: 'white', textDecoration: 'none' }}>View profile</a>
          </div>
          <div style={{ background: 'white', border: '1px solid #E4E7EC', borderRadius: '10px', padding: '14px', textAlign: 'left', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#475467', fontWeight: 500, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>Balance <span>⚖️</span></div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#101828' }}>{balance}</div>
          </div>
          <a href="/dashboard/employee/leaves/apply" style={{ display: 'block', width: '100%', padding: '10px', borderRadius: '8px', background: '#7C3AED', color: 'white', fontSize: '12px', fontWeight: 600, textAlign: 'center', textDecoration: 'none' }}>
            Apply for leave
          </a>
        </div>
      </div>
    </div>
  )
}

const th: React.CSSProperties = { padding: '9px 16px', textAlign: 'left', fontSize: '11px', color: '#98A2B3', fontWeight: 500, borderBottom: '1px solid #E4E7EC' }
const td: React.CSSProperties = { padding: '11px 16px', fontSize: '12px', color: '#475467', borderBottom: '1px solid #F2F4F7', verticalAlign: 'middle' }
const btnPage: React.CSSProperties = { padding: '6px 12px', border: '1.5px solid #D0D5DD', borderRadius: '6px', background: 'white', fontSize: '11px', cursor: 'pointer', fontFamily: "'Sora',sans-serif" }