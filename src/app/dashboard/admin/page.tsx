import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminHomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const [{ count: regCount }, { count: leaveCount }, { count: jobCount }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'postulant').eq('status', 'pending'),
    supabase.from('leaves').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
  ])

  const { data: activity } = await supabase
    .from('leaves')
    .select('*, profiles(full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(10)

  const adminName = (user.user_metadata?.full_name ?? user.email ?? 'Admin') as string
  const adminInitials = adminName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Sora', sans-serif" }}>
      <main style={{ flex: 1, padding: '28px 32px', background: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#101828' }}>Home</h1>
          <span style={{ fontSize: '16px', cursor: 'pointer', color: '#98A2B3' }}>🔍</span>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Registration requests', value: regCount ?? 0 },
            { label: 'Leave requests',        value: leaveCount ?? 0 },
            { label: 'Job submissions',       value: jobCount ?? 0 },
          ].map(s => (
            <div key={s.label} style={{ background: 'white', border: '1px solid #E4E7EC', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: '#475467', fontWeight: 500, marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                {s.label} <span>⋯</span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#101828' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ border: '1px solid #E4E7EC', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E7EC' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: '#101828' }}>Recent activity</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', color: '#98A2B3', fontWeight: 500, borderBottom: '1px solid #E4E7EC' }}><input type="checkbox" /></th>
                <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', color: '#98A2B3', fontWeight: 500, borderBottom: '1px solid #E4E7EC' }}>Submission Date ↓</th>
                <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', color: '#98A2B3', fontWeight: 500, borderBottom: '1px solid #E4E7EC' }}>Date</th>
                <th style={{ padding: '9px 16px', textAlign: 'left', fontSize: '11px', color: '#98A2B3', fontWeight: 500, borderBottom: '1px solid #E4E7EC' }}>Activity</th>
              </tr>
            </thead>
            <tbody>
              {activity && activity.length > 0 ? activity.map((item: any) => (
                <tr key={item.id}>
                  <td style={{ padding: '11px 16px', fontSize: '12px', borderBottom: '1px solid #F2F4F7' }}><input type="checkbox" /></td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', borderBottom: '1px solid #F2F4F7' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>
                        {item.profiles?.full_name?.[0] ?? 'U'}
                      </div>
                      <span style={{ fontWeight: 600, color: '#101828' }}>{item.profiles?.full_name ?? 'Unknown'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', color: '#475467', borderBottom: '1px solid #F2F4F7' }}>
                    {new Date(item.start_date).toLocaleDateString('fr-FR')} to {new Date(item.end_date).toLocaleDateString('fr-FR')}
                  </td>
                  <td style={{ padding: '11px 16px', fontSize: '12px', borderBottom: '1px solid #F2F4F7' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 600, background: '#FEF3C7', color: '#D97706' }}>
                      Requested Leave {item.type}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: '#98A2B3', fontSize: '13px' }}>
                    Aucune activité récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderTop: '1px solid #E4E7EC' }}>
            <button style={{ padding: '6px 12px', border: '1.5px solid #D0D5DD', borderRadius: '6px', background: 'white', fontSize: '11px', cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>← Previous</button>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[1,2,3].map(n => (
                <div key={n} style={{ width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', cursor: 'pointer', background: n === 1 ? '#EDE9FE' : 'transparent', color: n === 1 ? '#7C3AED' : '#475467' }}>{n}</div>
              ))}
            </div>
            <button style={{ padding: '6px 12px', border: '1.5px solid #D0D5DD', borderRadius: '6px', background: 'white', fontSize: '11px', cursor: 'pointer', fontFamily: "'Sora',sans-serif" }}>Next →</button>
          </div>
        </div>
      </main>

      {/* Right Panel */}
      <div style={{ width: '240px', background: '#F9FAFB', borderLeft: '1px solid #E4E7EC', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#EDE9FE', color: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700, margin: '0 auto 10px' }}>
            {adminInitials}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#101828' }}>{adminName}</div>
          <div style={{ fontSize: '11px', color: '#475467', marginBottom: '14px' }}>Admin</div>
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
            <a href="/dashboard/admin/settings" style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, border: '1.5px solid #D0D5DD', background: 'white', color: '#101828', textDecoration: 'none' }}>Settings</a>
            <a href="/dashboard/admin/profile"  style={{ padding: '6px 14px', borderRadius: '7px', fontSize: '11px', fontWeight: 500, border: 'none', background: '#7C3AED', color: 'white', textDecoration: 'none' }}>View profile</a>
          </div>
        </div>
      </div>
    </div>
  )
}