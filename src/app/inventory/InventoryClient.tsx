'use client';

import { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import '../../../components/UI/Tabs.css';

// Tab definitions
const TABS = [
  { id: 'nuggets', label: 'Nuggets', icon: '🧠' },
  { id: 'secrets', label: 'Secrets', icon: '🔐' },
  { id: 'logs', label: 'Logs', icon: '📋' },
];

interface Nugget {
  name: string;
  path: string;
  title?: string;
}

export function InventoryClient() {
  const [activeTab, setActiveTab] = useState('nuggets');
  const [nuggets, setNuggets] = useState<Nugget[]>([]);
  const [selectedNugget, setSelectedNugget] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gitStatus, setGitStatus] = useState<string[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load nuggets list
  useEffect(() => {
    if (activeTab === 'nuggets') {
      loadNuggets();
      checkGitStatus();
    }
  }, [activeTab]);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('aiko_token');
    }
    return null;
  };

  const loadNuggets = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/inventory/nuggets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNuggets(data.nuggets || []);
      }
    } catch (e) {
      console.error('Failed to load nuggets', e);
    } finally {
      setLoading(false);
    }
  };

  const loadNuggetContent = async (name: string) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/inventory/nuggets/${name}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        setEditedContent(data.content);
        setSelectedNugget(name);
        setIsEditing(false);
      }
    } catch (e) {
      console.error('Failed to load nugget', e);
    } finally {
      setLoading(false);
    }
  };

  const checkGitStatus = async () => {
    try {
      const token = getToken();
      const res = await fetch('/api/inventory/git', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data.changes || []);
      }
    } catch (e) {
      console.error('Failed to check git status', e);
    }
  };

  const handleSave = async () => {
    if (!selectedNugget) return;
    
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/inventory/nuggets/${selectedNugget}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: editedContent })
      });
      
      if (res.ok) {
        setContent(editedContent);
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Saved! Don\'t forget to commit.' });
        checkGitStatus();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCommitPush = async () => {
    if (!commitMessage.trim()) {
      setMessage({ type: 'error', text: 'Commit message required' });
      return;
    }
    
    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/inventory/git', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: commitMessage })
      });
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Committed and pushed! ✅' });
        setCommitMessage('');
        setGitStatus([]);
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to commit' });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.75rem', fontWeight: 700 }}>
        📦 Inventory
      </h1>

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '1.5rem' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem',
          borderRadius: '0.5rem',
          marginBottom: '1rem',
          background: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
        }}>
          {message.text}
        </div>
      )}

      {/* NUGGETS TAB */}
      {activeTab === 'nuggets' && (
        <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: 0 }}>
          {/* Left: Nugget List */}
          <div style={{
            width: '250px',
            background: 'var(--card-bg)',
            borderRadius: '1rem',
            padding: '1rem',
            overflow: 'auto',
            boxShadow: 'var(--shadow)'
          }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#888' }}>
              {nuggets.length} Nuggets
            </h3>
            {loading && !nuggets.length ? (
              <div style={{ color: '#888' }}>Loading...</div>
            ) : (
              nuggets.map(nugget => (
                <button
                  key={nugget.name}
                  onClick={() => loadNuggetContent(nugget.name)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    marginBottom: '0.5rem',
                    borderRadius: '0.5rem',
                    border: selectedNugget === nugget.name ? '2px solid #ff99bb' : '1px solid rgba(0,0,0,0.1)',
                    background: selectedNugget === nugget.name ? 'rgba(255,153,187,0.1)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{nugget.title || nugget.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                    {nugget.name}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right: Content / Editor */}
          <div style={{
            flex: 1,
            background: 'var(--card-bg)',
            borderRadius: '1rem',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow)',
            minHeight: 0
          }}>
            {!selectedNugget ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
                Select a nugget from the list to view
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ margin: 0 }}>
                    {selectedNugget}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => { setIsEditing(false); setEditedContent(content); }}
                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: '0.5rem', 
                            border: 'none',
                            background: '#ff99bb',
                            color: 'white',
                            cursor: 'pointer',
                            opacity: saving ? 0.5 : 1
                          }}
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditing(true)}
                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}
                        >
                          ✏️ Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={e => setEditedContent(e.target.value)}
                      style={{
                        width: '100%',
                        height: '100%',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        resize: 'none',
                        background: 'var(--bg)',
                        color: 'var(--text)'
                      }}
                    />
                  ) : (
                    <div className="markdown-body" style={{ lineHeight: 1.6 }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Git Status Sidebar */}
          {gitStatus.length > 0 && (
            <div style={{
              width: '250px',
              background: 'var(--card-bg)',
              borderRadius: '1rem',
              padding: '1rem',
              boxShadow: 'var(--shadow)'
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#ff6b6b' }}>
                ⚠️ Uncommitted Changes
              </h3>
              <div style={{ fontSize: '0.75rem', marginBottom: '1rem', maxHeight: '150px', overflow: 'auto' }}>
                {gitStatus.map((change, i) => (
                  <div key={i} style={{ padding: '0.25rem 0', color: '#666' }}>
                    {change}
                  </div>
                ))}
              </div>
              <input
                type="text"
                value={commitMessage}
                onChange={e => setCommitMessage(e.target.value)}
                placeholder="Commit message..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(0,0,0,0.1)',
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem'
                }}
              />
              <button
                onClick={handleCommitPush}
                disabled={saving || !commitMessage.trim()}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: '#4CAF50',
                  color: 'white',
                  cursor: 'pointer',
                  opacity: saving || !commitMessage.trim() ? 0.5 : 1
                }}
              >
                {saving ? 'Pushing...' : 'Commit & Push'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECRETS TAB */}
      {activeTab === 'secrets' && (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
          🔐 Secrets viewer coming soon...
        </div>
      )}

      {/* LOGS TAB */}
      {activeTab === 'logs' && (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
          📋 Logs viewer coming soon...
        </div>
      )}
    </div>
  );
}
