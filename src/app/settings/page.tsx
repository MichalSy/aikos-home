'use client';

import { useState, useEffect } from 'react';
import { Tabs } from '@/components/UI/Tabs';
import { Button } from '@/components/UI/Button';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('security');
  const [settings, setSettings] = useState({ gateway_url: '', gateway_token: '' });
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [pwStatus, setPwStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const token = localStorage.getItem('aiko_token');
    try {
      const res = await fetch('/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(prev => ({...prev, ...data}));
      }
    } catch (e) {
      console.error("Failed to load settings", e);
    }
  };

  const handleSave = async () => {
    const token = localStorage.getItem('aiko_token');
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save settings", e);
    }
  };

  const handleChangePassword = async () => {
    setErrorMessage('');
    if (!newPassword.trim()) {
      setErrorMessage('Password cannot be empty');
      return;
    }
    if (newPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    setPwStatus('saving');
    
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      
      const data = await res.json();

      if (res.ok) {
        setPwStatus('success');
        setNewPassword('');
        setTimeout(() => setPwStatus(''), 3000);
      } else {
        setPwStatus('error');
        setErrorMessage(data.error || 'Failed to change password');
        setTimeout(() => setPwStatus(''), 3000);
      }
    } catch (e) {
      setPwStatus('error');
      setErrorMessage('Network error. Please try again.');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  return (
    <div className="settings-page" style={{padding: '2rem'}}>
      
      {/* Tabs */}
      <Tabs
        items={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* GENERAL TAB */}
      {activeTab === 'general' && (
        <div className="settings-section fade-in">
          <div style={{background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow)'}}>
            <h2 style={{marginTop: 0, marginBottom: '1.25rem'}}>App Info</h2>
            <div style={{display: 'flex', gap: '1.25rem', alignItems: 'center'}}>
              <div style={{width: '3.75rem', height: '3.75rem', background: 'linear-gradient(135deg, #ff99bb, #ffb3d9)', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem'}}>🌸</div>
              <div>
                <h3 style={{margin: 0}}>Aiko's Home</h3>
                <p style={{margin: '0.3rem 0 0', color: '#888'}}>Version 1.0.0 • Next.js 14 • React 18</p>
              </div>
            </div>
            <p style={{marginTop: '1.25rem', lineHeight: '1.6', color: '#666'}}>
              This is the control center for Aiko. It serves as a shared workspace for managing tasks, monitoring status, and configuring the AI agent system.
            </p>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === 'security' && (
        <div className="settings-section fade-in" style={{display: 'flex', flexDirection: 'column', gap: '2rem'}}>
          
          {/* Connection Settings */}
          <div style={{background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow)'}}>
            <h2 style={{marginTop: 0, marginBottom: '2rem'}}>Gateway Connection</h2>
            
            <div style={{marginBottom: '1.25rem'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#5a5a5a'}}>WebSocket URL</label>
              <input 
                type="text" 
                value={settings.gateway_url}
                onChange={(e) => setSettings({...settings, gateway_url: e.target.value})}
                style={{width: '100%', padding: '0.75rem', borderRadius: '0.625rem', border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '1rem'}}
                placeholder="wss://claw.sytko.de"
              />
            </div>

            <div style={{marginBottom: '2rem'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#5a5a5a'}}>Gateway Token</label>
              <input 
                type="password" 
                value={settings.gateway_token}
                onChange={(e) => setSettings({...settings, gateway_token: e.target.value})}
                style={{width: '100%', padding: '0.75rem', borderRadius: '0.625rem', border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '1rem'}}
                placeholder="Enter Gateway Token"
              />
            </div>

            <Button onClick={handleSave}>
              {saved ? 'Saved! ✅' : 'Save Connection'}
            </Button>
          </div>

          {/* Password Change */}
          <div style={{background: 'var(--card-bg)', padding: '2.5rem', borderRadius: '1.5rem', boxShadow: 'var(--shadow)', border: '1px solid rgba(255, 107, 107, 0.1)'}}>
            <h2 style={{marginTop: 0, marginBottom: '2rem', color: '#ff6b6b'}}>Login Security</h2>
            
            <div style={{marginBottom: '2rem'}}>
              <label style={{display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#5a5a5a'}}>Change Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrorMessage(''); }}
                style={{
                  width: '100%', 
                  padding: '0.75rem', 
                  borderRadius: '0.625rem', 
                  border: errorMessage ? '1.5px solid #ff6b6b' : '1.5px solid rgba(0,0,0,0.1)', 
                  fontSize: '1rem'
                }}
                placeholder="Enter new password"
              />
              {errorMessage && (
                <p style={{color: '#ff6b6b', marginTop: '0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}}>
                  ⚠️ {errorMessage}
                </p>
              )}
              <p style={{fontSize: '0.85rem', color: '#888', marginTop: '0.5rem'}}>
                This password protects access to the dashboard.
              </p>
            </div>

            <Button onClick={handleChangePassword} variant="danger" disabled={pwStatus === 'saving'}>
              {pwStatus === 'saving' ? 'Updating...' : pwStatus === 'success' ? 'Password Changed! ✅' : 'Update Password'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
