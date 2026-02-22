'use client';

export const dynamic = 'force-dynamic';

import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import Sidebar from '@/components/Layout/Sidebar';
import LoginForm from '@/components/Auth/LoginForm';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, loading, logout } = useAuth();
  const { status } = useWebSocket(session?.access_token || null);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!session) {
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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh' }}>
      <Sidebar status={status} onLogout={logout} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
