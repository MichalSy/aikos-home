'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import Sidebar from './Sidebar';
import LoginForm from '@/components/Auth/LoginForm';

interface AppShellProps {
  children: React.ReactNode;
  sidebarPaths: string[];
}

export function AppShell({ children, sidebarPaths }: AppShellProps) {
  const pathname = usePathname();
  const { session, loading, logout } = useAuth();
  const { status } = useWebSocket(session?.access_token || null);

  // Check if current path should show sidebar
  const showSidebar = sidebarPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Loading state
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Not authenticated
  if (!session) {
    // Show sidebar pages with login form, other pages as-is (auth callback etc)
    if (showSidebar) {
      return (
        <LoginForm 
          onLogin={() => {}}
          title="Okaeri! 🌸"
          subtitle="Welcome to Aiko's Home"
          buttonText="Sign in with Google"
          backgroundImage="/bg.jpg"
          avatarImage="/avatar.jpg"
        />
      );
    }
    // Non-sidebar pages (auth callback, etc) render without auth check
    return <>{children}</>;
  }

  // Authenticated - show with or without sidebar
  if (showSidebar) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh' }}>
        <Sidebar status={status} onLogout={logout} />
        <main className="main-content">
          {children}
        </main>
      </div>
    );
  }

  // No sidebar
  return <>{children}</>;
}
