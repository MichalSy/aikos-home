'use client';

import { useState, useEffect, useRef } from 'react';
import '../../../components/UI/Button.css';
import '../../../components/UI/Tabs.css';

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
    { id: 'logs', label: '📄 Logs' },
    { id: 'database', label: '🗄️ Database' }
  ];

  const selectedQuest = quests.find(q => q.id === selectedQuestId);
  const questTasks = selectedQuest?.tasks || [];

  return (
    <div className="quest-debugger" style={{ padding: '1rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Control Bar */}
      <div className="debugger-controls" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        background: 'var(--card-bg)',
        borderRadius: '1rem',
        marginBottom: '1rem',
        gap: '1rem'
      }}>
        <div className="controls-group" style={{ display: 'flex', gap: '0.5rem' }}>
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
        
        <div className="controls-group" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoReload}
              onChange={(e) => setAutoReload(e.target.checked)}
            />
            <span>Auto-Reload</span>
          </label>
          <div style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '1rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            background: status === 'idle' ? '#e0e0e0' : status === 'running' ? '#74b9ff' : '#55efc4'
          }}>
            {status === 'idle' ? '● Idle' : status === 'running' ? '● Running' : '● Done'}
          </div>
        </div>
      </div>

      {/* Current State */}
      {currentState && (
        <div style={{
          background: 'var(--card-bg)',
          padding: '1rem',
          borderRadius: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Quest:</span>
            <span>#{currentState.quest?.id} — {currentState.quest?.title}</span>
            <span style={{
              padding: '0.25rem 0.5rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              background: currentState.quest?.is_ready ? '#55efc4' : '#ff7675'
            }}>
              {currentState.quest?.is_ready ? '✅ Ready' : '❌ Not Ready'}
            </span>
          </div>
          {currentState.task && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600 }}>Task:</span>
              <span>#{currentState.task?.id} — {currentState.task?.title}</span>
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                background: currentState.task?.is_ready ? '#55efc4' : '#ff7675'
              }}>
                {currentState.task?.is_ready ? '✅ Ready' : '❌ Not Ready'}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Action:</span>
            <span>{currentState.action}</span>
            {currentState.agentMode && (
              <span style={{
                padding: '0.25rem 0.5rem',
                borderRadius: '0.5rem',
                fontSize: '0.75rem',
                background: '#a18cd1'
              }}>
                {currentState.agentMode}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs-container" style={{ marginBottom: '1rem' }}>
        {tabItems.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'database') loadDatabaseState();
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'logs' && (
          <div className="glass" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0 }}>Execution Log</h3>
              <button className="aiko-btn btn-secondary" onClick={() => setLogs([])}>
                Clear
              </button>
            </div>
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem',
              fontFamily: 'monospace',
              fontSize: '0.85rem'
            }}>
              {logs.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                  No logs. Click Step to start.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} style={{
                    marginBottom: '0.25rem',
                    color: log.level === 'ERROR' ? '#ff6b6b' : log.level === 'WARN' ? '#feca57' : '#2c3e50'
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
          <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '1rem', height: '100%' }}>
            {/* Quests List */}
            <div className="glass" style={{ display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ padding: '1rem', margin: 0 }}>Quests</h3>
              <div style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem' }}>
                {quests.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                    No quests
                  </div>
                ) : (
                  quests.map(q => (
                    <div
                      key={q.id}
                      style={{
                        padding: '0.75rem',
                        marginBottom: '0.5rem',
                        background: selectedQuestId === q.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '0.75rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setSelectedQuestId(q.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>#{q.id}</span>
                        <span>{getStatusBadge(q)}</span>
                      </div>
                      <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{q.title}</div>
                      <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.5rem',
                          background: q.status === 'done' ? '#55efc4' : q.status === 'in-progress' ? '#74b9ff' : '#e0e0e0'
                        }}>
                          {q.status}
                        </span>
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          borderRadius: '0.5rem',
                          background: q.is_ready ? '#55efc4' : '#ff7675'
                        }}>
                          {q.is_ready ? 'Ready' : 'Not Ready'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem' }}>
                        {(q.tasks || []).length} tasks
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quest Details */}
            <div className="glass" style={{ display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
              {selectedQuest ? (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <h2 style={{ margin: '0 0 0.5rem 0' }}>{selectedQuest.title}</h2>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.75rem',
                        background: selectedQuest.status === 'done' ? '#55efc4' : selectedQuest.status === 'in-progress' ? '#74b9ff' : '#e0e0e0'
                      }}>
                        {selectedQuest.status}
                      </span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '0.75rem',
                        background: selectedQuest.is_ready ? '#55efc4' : '#ff7675'
                      }}>
                        {selectedQuest.is_ready ? '✅ Ready' : '❌ Not Ready'}
                      </span>
                      <button
                        className="aiko-btn btn-danger"
                        onClick={() => resetQuest(selectedQuest.id)}
                        style={{ marginLeft: 'auto' }}
                      >
                        🔄 Reset
                      </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1rem', color: '#666' }}>
                    <p>{selectedQuest.description || 'No description'}</p>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', margin: '1rem 0' }} />

                  <div style={{ flex: 1, overflowY: 'auto' }}>
                    <h3 style={{ marginTop: 0 }}>Tasks ({questTasks.length})</h3>
                    {questTasks.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>
                        No tasks
                      </div>
                    ) : (
                      questTasks.map((task: any) => (
                        <div key={task.id} style={{
                          padding: '0.75rem',
                          marginBottom: '0.5rem',
                          background: 'rgba(255,255,255,0.3)',
                          borderRadius: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ fontWeight: 600 }}>#{task.id}</span>
                            <span>{getTaskStatusBadge(task)}</span>
                          </div>
                          <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{task.title}</div>
                          {task.description && (
                            <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
                              {task.description}
                            </div>
                          )}
                          {task.result && (
                            <div style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                              <strong>Result:</strong> {task.result}
                            </div>
                          )}
                          <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.5rem',
                              background: task.status === 'done' ? '#55efc4' : task.status === 'in-progress' ? '#74b9ff' : '#e0e0e0'
                            }}>
                              {task.status}
                            </span>
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              borderRadius: '0.5rem',
                              background: task.is_ready ? '#55efc4' : '#ff7675'
                            }}>
                              {task.is_ready ? 'Ready' : 'Not Ready'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', color: '#888', padding: '4rem' }}>
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
