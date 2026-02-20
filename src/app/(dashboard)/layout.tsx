'use client';

import { useAuth } from '@/hooks/useAuth';
import { useWebSocket } from '@/hooks/useWebSocket';
import Sidebar from '@/components/Layout/Sidebar';
import LoginForm from '@/components/Auth/LoginForm';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, loading, login } = useAuth();
  const { status } = useWebSocket(token);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!token) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: '100vh' }}>
      <Sidebar status={status} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}
