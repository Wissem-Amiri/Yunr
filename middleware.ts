import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll()          { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path          = request.nextUrl.pathname
  const isAuthRoute   = path.startsWith('/auth')
  const isDashboard   = path.startsWith('/dashboard')
  const isAdminRoute  = path.startsWith('/dashboard/admin')

  
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (user && isAuthRoute) {
    const role = user.user_metadata?.role
    const dest = role === 'admin' ? '/dashboard/admin' : '/dashboard/employee'
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Pas admin → redirige
  if (user && isAdminRoute && user.user_metadata?.role !== 'admin') {
    return NextResponse.redirect(new URL('/dashboard/employee', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}