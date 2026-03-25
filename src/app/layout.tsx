import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import './globals.css'

const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sora',
})

export const metadata: Metadata = {
  title: 'Yunr HR Management',
  description: 'Plateforme RH intelligente — Présence IA, Congés, Recrutement',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={sora.variable}>
      <body>{children}</body>
    </html>
  )
}