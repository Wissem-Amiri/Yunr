'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ApplyPage() {
    const router = useRouter()
    const params = useParams()
    const jobId = params.id as string
    const supabase = createClient()

    const [cvFile, setCvFile] = useState<File | null>(null)
    const [letterFile, setLetterFile] = useState<File | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!cvFile || !letterFile) {
            setError('Veuillez joindre votre CV et votre lettre de motivation.')
            setLoading(false)
            return
        }

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Non authentifié')

            // Upload CV dans Supabase Storage
            const cvPath = `applications/${user.id}/${jobId}/cv_${Date.now()}.${cvFile.name.split('.').pop()}`
            const { error: cvError } = await supabase.storage
                .from('resumes')
                .upload(cvPath, cvFile)
            if (cvError) throw cvError

            // Upload Lettre de motivation
            const letterPath = `applications/${user.id}/${jobId}/letter_${Date.now()}.${letterFile.name.split('.').pop()}`
            const { error: letterError } = await supabase.storage
                .from('resumes')
                .upload(letterPath, letterFile)
            if (letterError) throw letterError

            // Enregistre la candidature en base de données
            const { error: dbError } = await supabase
                .from('applications')
                .insert({
                    job_id: jobId,
                    user_id: user.id,
                    cv_url: cvPath,
                    letter_url: letterPath,
                    message: message,
                    status: 'pending',
                })
            if (dbError) throw dbError

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div style={{ maxWidth: '500px', margin: '60px auto', textAlign: 'center' }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#101828', marginBottom: '10px' }}>
                    Candidature envoyée !
                </h2>
                <p style={{ fontSize: '14px', color: '#475467', lineHeight: 1.6, marginBottom: '24px' }}>
                    Votre dossier a bien été reçu. L&apos;équipe RH examinera votre candidature
                    et vous contactera dans les meilleurs délais.
                </p>
                <button
                    onClick={() => router.push('/postulant/jobs')}
                    style={{
                        padding: '11px 28px', borderRadius: '8px', border: 'none',
                        background: '#7C3AED', color: 'white', fontSize: '14px',
                        fontWeight: 600, cursor: 'pointer', fontFamily: "'Sora', sans-serif",
                    }}
                >
                    Voir d&apos;autres offres
                </button>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
            {/* Header */}
            <button
                onClick={() => router.back()}
                style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '8px',
                    border: '1.5px solid #D0D5DD', background: 'white',
                    fontSize: '12px', cursor: 'pointer', color: '#475467',
                    fontFamily: "'Sora', sans-serif", marginBottom: '24px',
                }}
            >
                ← Retour
            </button>

            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>
                Soumettre ma candidature
            </h1>
            <p style={{ fontSize: '13px', color: '#475467', marginBottom: '28px' }}>
                Joignez votre CV et votre lettre de motivation pour postuler.
            </p>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div style={{
                        background: '#FEF2F2', border: '1px solid #FECACA',
                        color: '#DC2626', padding: '10px 14px', borderRadius: '8px',
                        fontSize: '13px', marginBottom: '20px',
                    }}>
                        {error}
                    </div>
                )}

                {/* CV Upload */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#101828', marginBottom: '6px' }}>
                        CV / Resume *
                    </label>
                    <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '8px', padding: '24px', borderRadius: '10px',
                        border: `2px dashed ${cvFile ? '#7C3AED' : '#D0D5DD'}`,
                        background: cvFile ? '#EDE9FE' : 'white', cursor: 'pointer',
                    }}>
                        <span style={{ fontSize: '28px' }}>{cvFile ? '✅' : '📄'}</span>
                        <span style={{ fontSize: '13px', color: cvFile ? '#7C3AED' : '#475467', fontWeight: cvFile ? 600 : 400 }}>
                            {cvFile ? cvFile.name : 'Cliquez pour uploader ou glissez votre CV'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#98A2B3' }}>PDF, DOC, DOCX (max. 5 MB)</span>
                        <input
                            type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                            onChange={e => setCvFile(e.target.files?.[0] ?? null)}
                        />
                    </label>
                </div>

                {/* Lettre de motivation */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#101828', marginBottom: '6px' }}>
                        Lettre de motivation *
                    </label>
                    <label style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: '8px', padding: '24px', borderRadius: '10px',
                        border: `2px dashed ${letterFile ? '#7C3AED' : '#D0D5DD'}`,
                        background: letterFile ? '#EDE9FE' : 'white', cursor: 'pointer',
                    }}>
                        <span style={{ fontSize: '28px' }}>{letterFile ? '✅' : '✉️'}</span>
                        <span style={{ fontSize: '13px', color: letterFile ? '#7C3AED' : '#475467', fontWeight: letterFile ? 600 : 400 }}>
                            {letterFile ? letterFile.name : 'Cliquez pour uploader votre lettre de motivation'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#98A2B3' }}>PDF, DOC, DOCX (max. 5 MB)</span>
                        <input
                            type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }}
                            onChange={e => setLetterFile(e.target.files?.[0] ?? null)}
                        />
                    </label>
                </div>

                {/* Message optionnel */}
                <div style={{ marginBottom: '28px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#101828', marginBottom: '6px' }}>
                        Message (optionnel)
                    </label>
                    <textarea
                        placeholder="Présentez-vous brièvement ou ajoutez un message pour l'équipe RH..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: '8px',
                            border: '1.5px solid #D0D5DD', fontSize: '13px',
                            fontFamily: "'Sora', sans-serif", color: '#101828',
                            minHeight: '120px', resize: 'vertical', outline: 'none',
                        }}
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%', padding: '12px', borderRadius: '8px',
                        border: 'none', background: loading ? '#C4B5FD' : '#7C3AED',
                        color: 'white', fontSize: '14px', fontWeight: 600,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontFamily: "'Sora', sans-serif",
                    }}
                >
                    {loading ? 'Envoi en cours...' : '📤 Envoyer ma candidature'}
                </button>
            </form>
        </div>
    )
}