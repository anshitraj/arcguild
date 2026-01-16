import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ArcGuilds Admin',
  description: 'Admin dashboard for ArcGuilds',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
