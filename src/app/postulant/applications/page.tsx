import { createClient } from '@/lib/supabase/server'

export default async function MyApplicationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: applications } = await supabase
    .from('applications')
    .select('*, jobs(title, department)')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      pending:  { bg: '#FEF3C7', color: '#D97706', label: '⏳ En attente' },
      reviewed: { bg: '#EDE9FE', color: '#7C3AED', label: '👁 En cours d\'examen' },
      accepted: { bg: '#DCFCE7', color: '#16A34A', label: '✅ Acceptée' },
      rejected: { bg: '#FEF2F2', color: '#DC2626', label: '❌ Refusée' },
    }
    const s = styles[status] ?? styles.pending
    return (
      <span style={{
        padding: '3px 10px', borderRadius: '99px',
        fontSize: '11px', fontWeight: 600,
        background: s.bg, color: s.color,
      }}>
        {s.label}
      </span>
    )
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
          Mes candidatures
        </h1>
        <p style={{ fontSize: '13px', color: '#475467' }}>
          Suivez l&apos;état de vos dossiers soumis.
        </p>
      </div>

      {(!applications || applications.length === 0) ? (
        <div style={{
          background: 'white', borderRadius: '12px', border: '1px solid #E4E7EC',
          padding: '60px', textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#101828', marginBottom: '8px' }}>
            Aucune candidature
          </h3>
          <p style={{ fontSize: '13px', color: '#475467', marginBottom: '20px' }}>
            Vous n&apos;avez pas encore soumis de candidature.
          </p>
          <a href="/postulant/jobs" style={{
            padding: '10px 24px', borderRadius: '8px', background: '#7C3AED',
            color: 'white', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
          }}>
            Voir les offres →
          </a>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {applications.map((app: any) => (
            <div key={app.id} style={{
              background: 'white', borderRadius: '12px',
              border: '1px solid #E4E7EC', padding: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '10px',
                  background: '#7C3AED', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '20px',
                }}>
                  💼
                </div>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#101828' }}>
                    {app.jobs?.title ?? 'Offre inconnue'}
                  </h4>
                  <p style={{ fontSize: '11px', color: '#7C3AED', fontWeight: 500 }}>
                    {app.jobs?.department}
                  </p>
                  <p style={{ fontSize: '11px', color: '#98A2B3', marginTop: '2px' }}>
                    Soumis le {new Date(app.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {statusBadge(app.status)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}