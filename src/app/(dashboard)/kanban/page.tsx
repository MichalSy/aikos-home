'use client';

import { useEffect, useState } from 'react';

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

export default function KanbanPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="kanban-container p-8">
      <h1 className="text-3xl font-bold mb-6">
        <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quest Board
        </span>
        <span className="ml-2">📜</span>
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['todo', 'in-progress', 'done'].map(status => (
          <div key={status} className="glass p-4">
            <h2 className="text-xl font-semibold mb-4">
              {status.replace('-', ' ').toUpperCase()}
            </h2>
            <div className="space-y-3">
              {quests.filter(q => q.status === status).map(quest => (
                <div key={quest.id} className="glass p-3 cursor-pointer hover:bg-white/5">
                  <h3 className="font-medium">{quest.title}</h3>
                  {quest.description && (
                    <p className="text-sm text-gray-400 mt-1">{quest.description}</p>
                  )}
                  {quest.tasks && (
                    <div className="mt-2 text-xs text-gray-500">
                      {quest.tasks.length} tasks
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
