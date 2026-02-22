'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tabs } from '@/components/UI/Tabs';

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
  const [filteredNames, setFilteredNames] = useState<string[] | null>(null); // null = no filter
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [selectedNugget, setSelectedNugget] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [gitStatus, setGitStatus] = useState<string[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (activeTab === 'nuggets') {
      loadNuggets();
      checkGitStatus();
    }
  }, [activeTab]);

  const getToken = () => {
    if (typeof window !== 'undefined') return localStorage.getItem('aiko_token');
    return null;
  };

  const authHeader = () => ({ 'Authorization': `Bearer ${getToken()}` });

  const loadNuggets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory/nuggets', { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setNuggets(data.nuggets || []);
      }
    } catch (e) { console.error('Failed to load nuggets', e); }
    finally { setLoading(false); }
  };

  const loadNuggetContent = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/nuggets/${name}`, { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setContent(data.content);
        setEditedContent(data.content);
        setSelectedNugget(name);
        setIsEditing(false);
      }
    } catch (e) { console.error('Failed to load nugget', e); }
    finally { setLoading(false); }
  };

  const checkGitStatus = async () => {
    try {
      const res = await fetch('/api/inventory/git', { headers: authHeader() });
      if (res.ok) {
        const data = await res.json();
        setGitStatus(data.changes || []);
      }
    } catch (e) { console.error('Git status error', e); }
  };

  const handleSave = async () => {
    if (!selectedNugget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/inventory/nuggets/${selectedNugget}`, {
        method: 'PUT',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editedContent })
      });
      if (res.ok) {
        setContent(editedContent);
        setIsEditing(false);
        setMessage({ type: 'success', text: "Saved! Don't forget to commit." });
        checkGitStatus();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to save' });
      }
    } catch { setMessage({ type: 'error', text: 'Network error' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!selectedNugget) return;
    if (!confirm(`Nugget "${selectedNugget}" wirklich löschen?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/inventory/nuggets/${selectedNugget}`, {
        method: 'DELETE',
        headers: authHeader()
      });
      if (res.ok) {
        setNuggets(prev => prev.filter(n => n.name !== selectedNugget));
        setSelectedNugget(null);
        setContent('');
        setMessage({ type: 'success', text: 'Nugget deleted. Commit to apply.' });
        checkGitStatus();
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Failed to delete' });
      }
    } catch { setMessage({ type: 'error', text: 'Network error' }); }
    finally { setDeleting(false); }
  };

  const handleCommitPush = async () => {
    if (!commitMessage.trim()) {
      setMessage({ type: 'error', text: 'Commit message required' });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/inventory/git', {
        method: 'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
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
    } catch { setMessage({ type: 'error', text: 'Network error' }); }
    finally { setSaving(false); }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const res = await fetch('/api/inventory/reindex', {
        method: 'POST',
        headers: authHeader()
      });
      if (res.ok) {
        setMessage({ type: 'success', text: '✅ Index neu aufgebaut (qmd embed)' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch { setMessage({ type: 'error', text: 'Reindex fehlgeschlagen' }); }
    finally { setReindexing(false); }
  };

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!q.trim()) {
      setFilteredNames(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/inventory/search?q=${encodeURIComponent(q)}`, {
          headers: authHeader()
        });
        if (res.ok) {
          const data = await res.json();
          setFilteredNames(data.names || []);
        }
      } catch { setFilteredNames([]); }
      finally { setSearching(false); }
    }, 400);
  }, []);

  const visibleNuggets = filteredNames === null
    ? nuggets
    : nuggets.filter(n => filteredNames.includes(n.name));

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Tabs */}
      <Tabs items={TABS} activeTab={activeTab} onTabChange={setActiveTab} style={{ marginBottom: '1.5rem' }} />

      {/* Message */}
      {message && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1rem',
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
            width: '260px', flexShrink: 0,
            background: 'var(--card-bg)', borderRadius: '1rem',
            padding: '1rem', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow)', overflow: 'hidden'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
                placeholder="🔍 qmd suchen..."
                style={{
                  width: '100%', padding: '0.5rem 0.75rem',
                  borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)',
                  fontSize: '0.85rem', background: 'var(--bg)', color: 'var(--text)',
                  boxSizing: 'border-box'
                }}
              />
              {searching && (
                <span style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', fontSize: '0.7rem', color: '#888' }}>
                  ⏳
                </span>
              )}
            </div>

            {/* Count + Reindex */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>
                {searching ? 'Suche...' : filteredNames !== null
                  ? `${visibleNuggets.length} von ${nuggets.length}`
                  : `${nuggets.length} Nuggets`}
              </div>
              <button
                onClick={handleReindex}
                disabled={reindexing}
                title="qmd update + embed (verbessert Suchergebnisse)"
                style={{
                  padding: '0.2rem 0.4rem', fontSize: '0.7rem', borderRadius: '0.35rem',
                  border: '1px solid rgba(0,0,0,0.15)', background: 'transparent',
                  cursor: reindexing ? 'wait' : 'pointer', color: '#888',
                  opacity: reindexing ? 0.5 : 1
                }}
              >
                {reindexing ? '⏳' : '🔄'}
              </button>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {loading && !nuggets.length ? (
                <div style={{ color: '#888', fontSize: '0.85rem' }}>Lade...</div>
              ) : visibleNuggets.length === 0 && filteredNames !== null ? (
                <div style={{ color: '#888', fontSize: '0.85rem' }}>Keine Treffer.</div>
              ) : (
                visibleNuggets.map(nugget => (
                  <button
                    key={nugget.name}
                    onClick={() => loadNuggetContent(nugget.name)}
                    style={{
                      width: '100%', padding: '0.6rem 0.75rem', marginBottom: '0.4rem',
                      borderRadius: '0.5rem',
                      border: selectedNugget === nugget.name ? '2px solid #ff99bb' : '1px solid rgba(0,0,0,0.1)',
                      background: selectedNugget === nugget.name ? 'rgba(255,153,187,0.1)' : 'transparent',
                      cursor: 'pointer', textAlign: 'left', fontSize: '0.85rem', transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{nugget.title || nugget.name}</div>
                    <div style={{ fontSize: '0.7rem', color: '#888', marginTop: '0.15rem' }}>{nugget.name}</div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right: Content / Editor */}
          <div style={{
            flex: 1, minWidth: 0,
            background: 'var(--card-bg)', borderRadius: '1rem', padding: '1.5rem',
            display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow)', minHeight: 0, overflow: 'hidden'
          }}>
            {!selectedNugget ? (
              <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>
                Nugget aus der Liste auswählen
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,0,0,0.1)',
                  flexShrink: 0
                }}>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{selectedNugget}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditing ? (
                      <>
                        <button onClick={() => { setIsEditing(false); setEditedContent(content); }}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '0.85rem' }}>
                          Abbrechen
                        </button>
                        <button onClick={handleSave} disabled={saving}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: '#ff99bb', color: 'white', cursor: 'pointer', fontSize: '0.85rem', opacity: saving ? 0.5 : 1 }}>
                          {saving ? 'Speichert...' : '💾 Speichern'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setIsEditing(true)}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.15)', cursor: 'pointer', fontSize: '0.85rem' }}>
                          ✏️ Bearbeiten
                        </button>
                        <button onClick={handleDelete} disabled={deleting}
                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1px solid #ff6b6b', color: '#ff6b6b', background: 'transparent', cursor: 'pointer', fontSize: '0.85rem', opacity: deleting ? 0.5 : 1 }}>
                          {deleting ? '...' : '🗑️ Löschen'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Content — single scroll context */}
                <div style={{
                  flex: 1, minHeight: 0,
                  display: 'flex', flexDirection: 'column',
                  overflow: isEditing ? 'hidden' : 'auto'
                }}>
                  {isEditing ? (
                    <textarea
                      value={editedContent}
                      onChange={e => setEditedContent(e.target.value)}
                      style={{
                        flex: 1, width: '100%',
                        border: '1px solid rgba(0,0,0,0.15)', borderRadius: '0.5rem',
                        padding: '1rem', fontSize: '0.875rem',
                        fontFamily: 'monospace', resize: 'none',
                        background: 'var(--bg)', color: 'var(--text)',
                        boxSizing: 'border-box', overflow: 'auto'
                      }}
                    />
                  ) : (
                    <div className="markdown-body"
                      style={{ lineHeight: 1.6, overflowWrap: 'break-word', wordBreak: 'break-word' }}>
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Git Status Sidebar */}
          {gitStatus.length > 0 && (
            <div style={{
              width: '250px', flexShrink: 0,
              background: 'var(--card-bg)', borderRadius: '1rem',
              padding: '1rem', boxShadow: 'var(--shadow)'
            }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '0.9rem', color: '#ff6b6b' }}>⚠️ Uncommitted</h3>
              <div style={{ fontSize: '0.75rem', marginBottom: '1rem', maxHeight: '150px', overflow: 'auto' }}>
                {gitStatus.map((change, i) => (
                  <div key={i} style={{ padding: '0.25rem 0', color: '#666' }}>{change}</div>
                ))}
              </div>
              <input type="text" value={commitMessage} onChange={e => setCommitMessage(e.target.value)}
                placeholder="Commit message..."
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(0,0,0,0.1)', marginBottom: '0.5rem', fontSize: '0.85rem', boxSizing: 'border-box' }}
              />
              <button onClick={handleCommitPush} disabled={saving || !commitMessage.trim()}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '0.5rem', border: 'none', background: '#4CAF50', color: 'white', cursor: 'pointer', opacity: saving || !commitMessage.trim() ? 0.5 : 1 }}>
                {saving ? 'Pushing...' : '🚀 Commit & Push'}
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'secrets' && (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>🔐 Secrets viewer coming soon...</div>
      )}
      {activeTab === 'logs' && (
        <div style={{ color: '#888', textAlign: 'center', marginTop: '3rem' }}>📋 Logs viewer coming soon...</div>
      )}
    </div>
  );
}
