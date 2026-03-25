import type { Metadata } from 'next'
import './auth.css'

export const metadata: Metadata = {
  title: 'Authentification | Yunr HR',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="auth-wrapper">
      {children}
    </div>
  )
}