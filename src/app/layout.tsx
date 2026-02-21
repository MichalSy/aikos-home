import type { Metadata } from 'next'
import './globals.css'
import '@michalsy/aiko-webapp-core/styles.css'
import { AuthProvider } from '@michalsy/aiko-webapp-core'

export const metadata: Metadata = {
  title: "Aiko's Home - Control Center",
  description: 'AI Control Center with Agent Spawning',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
