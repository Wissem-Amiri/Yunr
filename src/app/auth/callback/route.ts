import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const role = data.user.user_metadata?.role

      let dest = '/auth/login'
      if (role === 'admin')     dest = '/dashboard/admin'
      if (role === 'employee')  dest = '/dashboard/employee'
      if (role === 'postulant') dest = '/postulant/jobs'

      
      return NextResponse.redirect(`${origin}${dest}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}