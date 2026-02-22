'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import Sidebar from './Sidebar';
import { Topbar } from './Topbar';
import { TopbarActionsProvider } from '@/contexts/TopbarActionsContext';
import LoginForm from '@/components/Auth/LoginForm';

interface AppShellProps {
  children: React.ReactNode;
  sidebarPaths: string[];
}

// Page config for topbar
const PAGE_CONFIG: Record<string, { title: string; subtitle: string; icon: string }> = {
  '/dashboard': { title: 'Quest Board', subtitle: 'Ready for adventure? ✨', icon: '⚔️' },
  '/dashboard/kanban': { title: 'Quest Board', subtitle: 'Ready for adventure? ✨', icon: '⚔️' },
  '/dashboard/debug': { title: 'Quest Debug', subtitle: 'Debug your quests 🔍', icon: '🎯' },
  '/inventory': { title: 'Inventory', subtitle: 'Manage your resources 📦', icon: '📦' },
  '/settings': { title: 'Config', subtitle: 'Configure your setup ⚙️', icon: '🔧' },
};

export function AppShell({ children, sidebarPaths }: AppShellProps) {
  const pathname = usePathname();
  const { session, loading, logout } = useAuth();
  const { status } = useWebSocket(session?.access_token || null);

  // Check if current path should show sidebar
  const showSidebar = sidebarPaths.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Get page config for topbar
  const getPageConfig = () => {
    // Try exact match first, then prefix match
    if (PAGE_CONFIG[pathname]) return PAGE_CONFIG[pathname];
    for (const [path, config] of Object.entries(PAGE_CONFIG)) {
      if (pathname.startsWith(path + '/')) return config;
    }
    return { title: 'Aiko\'s Home', subtitle: '', icon: '🌸' };
  };

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
    const pageConfig = getPageConfig();
    
    return (
      <TopbarActionsProvider>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh' }}>
          <Sidebar status={status} onLogout={logout} />
          <main className="main-content">
            <Topbar 
              title={pageConfig.title} 
              subtitle={pageConfig.subtitle} 
              icon={pageConfig.icon} 
            />
            <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
              {children}
            </div>
          </main>
        </div>
      </TopbarActionsProvider>
    );
  }

  // No sidebar
  return <>{children}</>;
}
