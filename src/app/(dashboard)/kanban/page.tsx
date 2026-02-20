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
  const [counts, setCounts] = useState({ todo: 0, 'in-progress': 0, done: 0 });

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
        
        const newCounts = { todo: 0, 'in-progress': 0, done: 0 };
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

  return (
    <div className="board-container">
      <div className="board">
        {['todo', 'in-progress', 'done'].map(status => (
          <div 
            key={status} 
            className={`column col-${status}`}
          >
            <div className="column-header">
              {status.replace('-', ' ').toUpperCase()} 
              <span className="count-badge">{counts[status as keyof typeof counts]}</span>
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
                  {quest.tasks && quest.tasks.length > 0 && (
                    <div className="card-footer">
                      <span>{quest.tasks.length} tasks</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
