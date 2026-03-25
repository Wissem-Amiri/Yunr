import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const role = user.user_metadata?.role
  if (role === 'admin')     redirect('/dashboard/admin')
  if (role === 'employee')  redirect('/dashboard/employee')
  if (role === 'postulant') redirect('/postulant/jobs')

  redirect('/auth/login')
}