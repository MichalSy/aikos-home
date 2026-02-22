'use client';

import { useState, useEffect, useRef } from 'react';
import '@/components/UI/Button.css';
import { Tabs } from '@/components/UI/Tabs';

export default function DebugPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [status, setStatus] = useState('idle');
  const [autoReload, setAutoReload] = useState(true);
  const [currentState, setCurrentState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [quests, setQuests] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedQuestId, setSelectedQuestId] = useState<number | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const loadDatabaseState = async () => {
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch('/api/quests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        data.sort((a: any, b: any) => b.id - a.id);
        setQuests(data);
        const allTasks = data.flatMap((q: any) => q.tasks || []);
        setTasks(allTasks);
      }
    } catch (e) {
      console.error('DB load error:', e);
    }
  };

  useEffect(() => {
    if (!autoReload) return;
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('aiko_token');
        const res = await fetch('/api/quests/logs/latest', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.lines) {
            setLogs(data.lines.map((line: string, i: number) => ({ id: i, text: line })));
          }
        }
      } catch (e) {
        console.error('Auto-reload error:', e);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [autoReload]);

  const executeStep = async () => {
    setLoading(true);
    setStatus('running');
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch('/api/quests/step', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        const newLogs = result.log?.map((e: any, i: number) => ({
          id: i,
          text: `[${e.timestamp}] [${e.level}] [${e.event}] ${e.message}`,
          level: e.level,
          event: e.event
        })) || [];
        setLogs(newLogs);
        
        setCurrentState({
          quest: result.quest,
          task: result.task,
          action: result.action,
          agentMode: result.agentMode
        });
        
        setTimeout(loadDatabaseState, 500);
      }
    } catch (e) {
      console.error('Step error:', e);
    }
    setLoading(false);
    setStatus('done');
  };

  const dryRun = async () => {
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch('/api/quests/step/dry-run', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        alert(`Next: ${result.action}\nReason: ${result.reason}`);
      }
    } catch (e) {
      console.error('Dry-run error:', e);
    }
  };

  const resetQuest = async (questId: number) => {
    if (!confirm('Are you sure? This will delete all tasks and reset the quest to TODO.')) return;
    
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch(`/api/quests/${questId}/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Quest reset successfully!');
        loadDatabaseState();
      } else {
        alert('Failed to reset quest');
      }
    } catch (e) {
      console.error('Reset error:', e);
      alert('Error resetting quest');
    }
  };

  const reloadLogs = async () => {
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch('/api/quests/logs/latest', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.lines) {
          setLogs(data.lines.map((line: string, i: number) => ({
            id: i,
            text: line,
            level: line.includes('[WARN]') ? 'WARN' : line.includes('[ERROR]') ? 'ERROR' : line.includes('[DEBUG]') ? 'DEBUG' : 'INFO'
          })));
        }
      }
    } catch (e) {
      console.error('Reload error:', e);
    }
  };

  const getStatusBadge = (quest: any) => {
    if (quest.status === 'done') return '✅';
    if (quest.status === 'in-progress') return '⏳';
    return '❌';
  };

  const getTaskStatusBadge = (task: any) => {
    if (task.status === 'done') return '✅';
    if (task.status === 'in-progress') return '⏳';
    return '❌';
  };

  const tabItems = [
    { id: 'logs', label: 'Logs', icon: '📄' },
    { id: 'database', label: 'Database', icon: '🗄️' }
  ];

  const selectedQuest = quests.find(q => q.id === selectedQuestId);
  const questTasks = selectedQuest?.tasks || [];

  return (
    <div className="quest-debugger" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Control Bar */}
      <div className="debugger-controls" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem',
        padding: '1rem 1.25rem',
        background: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 'var(--border-radius)',
        border: '1px solid rgba(255, 255, 255, 0.4)',
        flexWrap: 'wrap'
      }}>
        <div className="controls-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="aiko-btn btn-primary"
            onClick={executeStep}
            disabled={loading}
          >
            {loading ? '⏳ Running...' : '▶️ Step'}
          </button>
          <button className="aiko-btn btn-secondary" onClick={dryRun}>
            🔍 Dry-Run
          </button>
          <button className="aiko-btn btn-secondary" onClick={reloadLogs}>
            📋 Reload
          </button>
          <button className="aiko-btn btn-secondary" onClick={loadDatabaseState}>
            🔄 Refresh DB
          </button>
        </div>
        
        <div className="controls-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
            <input
              type="checkbox"
              checked={autoReload}
              onChange={(e) => setAutoReload(e.target.checked)}
              style={{ cursor: 'pointer', width: '1rem', height: '1rem' }}
            />
            <span>Auto-Reload</span>
          </label>
          <div style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '0.5rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            color: status === 'idle' ? 'var(--text-tertiary)' : status === 'running' ? '#f59e0b' : '#10b981',
            background: status === 'idle' ? 'rgba(0, 0, 0, 0.05)' : status === 'running' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)'
          }}>
            {status === 'idle' ? '● Idle' : status === 'running' ? '● Running' : '● Done'}
          </div>
        </div>
      </div>

      {/* Current State */}
      {currentState && (
        <div style={{
          padding: '1rem 1.25rem',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: 'var(--border-radius)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          fontSize: '0.9rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '6rem' }}>Quest:</span>
            <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 'fit-content' }}>
              #{currentState.quest?.id} — {currentState.quest?.title}
            </span>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '0.375rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              background: currentState.quest?.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: currentState.quest?.is_ready ? '#059669' : '#dc2626'
            }}>
              {currentState.quest?.is_ready ? '✅ Ready' : '❌ Not Ready'}
            </span>
          </div>
          {currentState.task && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '6rem' }}>Task:</span>
              <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 'fit-content' }}>
                #{currentState.task?.id} — {currentState.task?.title}
              </span>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: currentState.task?.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                color: currentState.task?.is_ready ? '#059669' : '#dc2626'
              }}>
                {currentState.task?.is_ready ? '✅ Ready' : '❌ Not Ready'}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', minWidth: '6rem' }}>Action:</span>
            <span style={{ color: 'var(--text-secondary)', flex: 1, minWidth: 'fit-content' }}>{currentState.action}</span>
            {currentState.agentMode && (
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '0.375rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#2563eb'
              }}>
                {currentState.agentMode}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs 
        items={tabItems}
        activeTab={activeTab}
        onTabChange={(id) => {
          setActiveTab(id);
          if (id === 'database') loadDatabaseState();
        }}
        style={{ marginBottom: 0 }}
      />

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '1rem' }}>
        {activeTab === 'logs' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Execution Log</h3>
              <button className="aiko-btn btn-secondary" onClick={() => setLogs([])}>
                Clear
              </button>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              fontFamily: "'Courier New', monospace",
              fontSize: '0.8rem',
              lineHeight: '1.6'
            }}>
              {logs.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  No logs. Click Step to start.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} style={{
                    padding: '0.35rem 0.5rem',
                    wordBreak: 'break-word',
                    color: log.level === 'ERROR' ? '#ef4444' : log.level === 'WARN' ? '#f59e0b' : log.level === 'DEBUG' ? '#9ca3af' : 'var(--text-secondary)'
                  }}>
                    {log.text}
                  </div>
                ))
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', height: '100%', overflow: 'hidden' }}>
            {/* Quests List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.25)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1rem' }}>
              <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>Quests</h3>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {quests.length === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                    No quests
                  </div>
                ) : (
                  quests.map(q => (
                    <div
                      key={q.id}
                      style={{
                        padding: '0.875rem',
                        background: selectedQuestId === q.id ? 'linear-gradient(135deg, rgba(255, 154, 158, 0.2), rgba(255, 183, 107, 0.1))' : 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '0.5rem',
                        border: selectedQuestId === q.id ? '1px solid rgba(255, 154, 158, 0.5)' : '1px solid rgba(255, 255, 255, 0.4)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: selectedQuestId === q.id ? 'inset 0 0 8px rgba(255, 154, 158, 0.1)' : 'none'
                      }}
                      onClick={() => setSelectedQuestId(q.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: "'Courier New', monospace" }}>#{q.id}</span>
                        <span style={{ fontSize: '1.1rem' }}>{getStatusBadge(q)}</span>
                      </div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.3' }}>{q.title}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          textTransform: 'capitalize',
                          letterSpacing: '0.4px',
                          background: q.status === 'done' ? 'rgba(16, 185, 129, 0.15)' : q.status === 'in-progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                          color: q.status === 'done' ? '#065f46' : q.status === 'in-progress' ? '#92400e' : '#4b5563'
                        }}>
                          {q.status}
                        </span>
                        <span style={{
                          padding: '0.3rem 0.6rem',
                          borderRadius: '0.35rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          background: q.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: q.is_ready ? '#065f46' : '#7f1d1d'
                        }}>
                          {q.is_ready ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                        {(q.tasks || []).length} tasks
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quest Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.25)', borderRadius: 'var(--border-radius)', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '1.5rem' }}>
              {selectedQuest ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                    <h2 style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-primary)', flex: 1 }}>{selectedQuest.title}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        letterSpacing: '0.4px',
                        background: selectedQuest.status === 'done' ? 'rgba(16, 185, 129, 0.15)' : selectedQuest.status === 'in-progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                        color: selectedQuest.status === 'done' ? '#065f46' : selectedQuest.status === 'in-progress' ? '#92400e' : '#4b5563'
                      }}>
                        {selectedQuest.status}
                      </span>
                      <span style={{
                        padding: '0.3rem 0.6rem',
                        borderRadius: '0.35rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: selectedQuest.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: selectedQuest.is_ready ? '#065f46' : '#7f1d1d'
                      }}>
                        {selectedQuest.is_ready ? '✅ Ready' : '❌ Not Ready'}
                      </span>
                      <button
                        className="aiko-btn btn-danger"
                        onClick={() => resetQuest(selectedQuest.id)}
                        style={{ marginLeft: '10px' }}
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    <p style={{ margin: 0 }}>{selectedQuest.description || 'No description'}</p>
                  </div>

                  <div style={{ height: '1px', background: 'rgba(0, 0, 0, 0.1)' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflow: 'hidden', flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 600 }}>Tasks ({questTasks.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1 }}>
                      {questTasks.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                          No tasks
                        </div>
                      ) : (
                        questTasks.map((task: any) => (
                          <div key={task.id} style={{
                            padding: '0.875rem',
                            background: 'rgba(255, 255, 255, 0.4)',
                            borderRadius: '0.5rem',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                            transition: 'all 0.2s ease'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', fontFamily: "'Courier New', monospace" }}>#{task.id}</span>
                              <span style={{ fontSize: '1rem' }}>{getTaskStatusBadge(task)}</span>
                            </div>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: '1.3' }}>{task.title}</div>
                            {task.description && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: '1.3' }}>{task.description}</div>
                            )}
                            {task.result && (
                              <div style={{
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: '0.375rem',
                                padding: '0.5rem 0.75rem',
                                fontSize: '0.85rem',
                                color: '#10b981',
                                marginBottom: '0.75rem',
                                lineHeight: '1.4',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                              }}>
                                <strong style={{ display: 'block', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.25rem', color: '#059669', fontWeight: 700 }}>Result:</strong>
                                {task.result}
                              </div>
                            )}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <span style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textTransform: 'capitalize',
                                letterSpacing: '0.4px',
                                background: task.status === 'done' ? 'rgba(16, 185, 129, 0.15)' : task.status === 'in-progress' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(156, 163, 175, 0.15)',
                                color: task.status === 'done' ? '#065f46' : task.status === 'in-progress' ? '#92400e' : '#4b5563'
                              }}>
                                {task.status}
                              </span>
                              <span style={{
                                padding: '0.3rem 0.6rem',
                                borderRadius: '0.35rem',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                background: task.is_ready ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                color: task.is_ready ? '#065f46' : '#7f1d1d'
                              }}>
                                {task.is_ready ? 'Ready' : 'Not Ready'}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                  Select a quest to view details
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
