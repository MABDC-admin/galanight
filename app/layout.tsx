import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'JS Prom Night Check-In',
  description: 'Student check-in application for JS Prom Night',
  manifest: '/manifest.json',
  themeColor: '#d4af37',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d4af37" />
      </head>
      <body>{children}</body>
    </html>
  )
}
