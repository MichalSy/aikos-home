import type { Metadata } from 'next'
import './globals.css'
import '@michalsy/aiko-webapp-core/styles.css'
import { AuthProvider } from '@michalsy/aiko-webapp-core'
import { AppShell } from '@/components/Layout/AppShell'

export const metadata: Metadata = {
  title: "Aiko's Home - Control Center",
  description: 'AI Control Center with Agent Spawning',
}

// Pages that should show sidebar (all authenticated pages)
const SIDEBAR_PATHS = ['/dashboard', '/inventory', '/settings']

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>
        <AuthProvider>
          <AppShell sidebarPaths={SIDEBAR_PATHS}>
            {children}
          </AppShell>
        </AuthProvider>
      </body>
    </html>
  )
}
