import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PostulantJobsPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  const deptColors: Record<string, { bg: string; color: string }> = {
    Design:       { bg: '#EDE9FE', color: '#7C3AED' },
    Engineering:  { bg: '#DBEAFE', color: '#1D4ED8' },
    Marketing:    { bg: '#FEF3C7', color: '#D97706' },
    Business:     { bg: '#DCFCE7', color: '#16A34A' },
    HR:           { bg: '#FEE2E2', color: '#DC2626' },
    Informatics:  { bg: '#E0F2FE', color: '#0369A1' },
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
          Offres d&apos;emploi
        </h1>
        <p style={{ fontSize: '14px', color: '#475467' }}>
          Découvrez nos opportunités et postulez en quelques clics.
        </p>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {['Tous', 'Design', 'Engineering', 'Business', 'Marketing', 'HR', 'Informatics'].map((cat, i) => (
          <span key={cat} style={{ padding: '6px 16px', borderRadius: '99px', fontSize: '12px', fontWeight: 500, cursor: 'pointer', border: `1.5px solid ${i === 0 ? '#7C3AED' : '#D0D5DD'}`, background: i === 0 ? '#EDE9FE' : 'white', color: i === 0 ? '#7C3AED' : '#475467' }}>
            {cat}
          </span>
        ))}
      </div>

      {/* Grid */}
      {!jobs || jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'white', borderRadius: '12px', border: '1px solid #E4E7EC' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#101828', marginBottom: '8px' }}>Aucune offre disponible</h3>
          <p style={{ fontSize: '13px', color: '#475467' }}>Revenez bientôt, de nouvelles offres seront publiées.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {jobs.map((job: any) => {
            const colors = deptColors[job.department] ?? { bg: '#F3F4F6', color: '#374151' }
            return (
              <div key={job.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #E4E7EC', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow .2s' }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>💼</div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#101828', marginBottom: '3px' }}>{job.title}</h3>
                      <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, background: colors.bg, color: colors.color }}>
                        {job.department}
                      </span>
                    </div>
                  </div>
                  <span style={{ padding: '2px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: 600, background: '#DCFCE7', color: '#16A34A' }}>Open</span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '12px', color: '#475467', lineHeight: 1.6 }}>
                  {job.description?.slice(0, 100)}{job.description?.length > 100 ? '...' : ''}
                </p>

                {/* Info */}
                <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: '#98A2B3' }}>
                  <span>🪑 {job.seats} poste{job.seats > 1 ? 's' : ''}</span>
                  {job.deadline && <span>📅 {new Date(job.deadline).toLocaleDateString('fr-FR')}</span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <Link href={`/postulant/jobs/${job.id}`} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1.5px solid #D0D5DD', background: 'white', fontSize: '12px', fontWeight: 500, color: '#475467', textAlign: 'center', textDecoration: 'none' }}>
                    Voir le détail
                  </Link>
                  <Link href={`/postulant/jobs/${job.id}/apply`} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: 'none', background: '#7C3AED', fontSize: '12px', fontWeight: 600, color: 'white', textAlign: 'center', textDecoration: 'none' }}>
                    Postuler →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}