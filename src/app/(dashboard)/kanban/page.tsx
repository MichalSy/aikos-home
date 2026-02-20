'use client';

import { useEffect, useState } from 'react';
import '../../../components/Board/KanbanBoard.css';
import '../../../components/Board/Card.css';

interface Task {
  id: number;
  quest_id: number;
  title: string;
  description?: string;
  status: string;
  is_ready: number;
  sort_order: number;
  result?: string;
}

interface Quest {
  id: number;
  title: string;
  description?: string;
  status: string;
  is_ready: number;
  priority: string;
  tasks: Task[];
}

export default function KanbanPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlocked, setShowBlocked] = useState(false);
  const [counts, setCounts] = useState({
    todo: 0,
    ready: 0,
    'in-progress': 0,
    blocked: 0,
    done: 0
  });

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch('/api/quests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuests(data);
        
        const newCounts = {
          todo: 0,
          ready: 0,
          'in-progress': 0,
          blocked: 0,
          done: 0
        };
        data.forEach((q: Quest) => {
          if (newCounts[q.status as keyof typeof newCounts] !== undefined) {
            newCounts[q.status as keyof typeof newCounts]++;
          }
        });
        setCounts(newCounts);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  const statuses = showBlocked 
    ? ['todo', 'ready', 'in-progress', 'done', 'blocked'] as const
    : ['todo', 'ready', 'in-progress', 'done'] as const;

  return (
    <>
      {/* Topbar */}
      <div className="topbar">
        <div>
          <h1>Quest Board <span>⚔️</span></h1>
          <p>Ready for adventure? ✨</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button className="glass px-4 py-2 rounded-lg font-semibold hover:bg-white/20 transition">
            ✨ New Quest
          </button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input 
              type="checkbox" 
              checked={showBlocked}
              onChange={(e) => setShowBlocked(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Show Blocked
          </label>
        </div>
      </div>

      {/* Board Container */}
      <div className="board-container">
        <div className="board">
          {statuses.map(status => (
            <div 
              key={status} 
              className={`column col-${status}`}
            >
              <div className="column-header">
                {status.replace('-', ' ').toUpperCase()} 
                <span className="count-badge">{counts[status]}</span>
              </div>
              <div className="task-list">
                {quests.filter(q => q.status === status).map(quest => (
                  <div key={quest.id} className="card">
                    <div className="card-header">
                      <div className="card-title">{quest.title}</div>
                    </div>
                    {quest.description && (
                      <div className="card-desc">{quest.description}</div>
                    )}
                    <div className="card-footer">
                      <span className={`priority-dot p-${quest.priority}`}></span>
                      <span>{quest.priority}</span>
                      {quest.tasks && quest.tasks.length > 0 && (
                        <span style={{marginLeft: 'auto'}}>{quest.tasks.length} tasks</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
