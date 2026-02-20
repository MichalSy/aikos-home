'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [selectedQuest, setSelectedQuest] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

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
    }
  };

  const runQuest = async (questId: number) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting quest ${questId}...`]);
    
    try {
      const token = localStorage.getItem('aiko_token');
      const res = await fetch(`/api/quests/${questId}/run`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Quest completed: ${JSON.stringify(data)}`]);
      } else {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: Failed to run quest`]);
      }
    } catch (error) {
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${error}`]);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quest Debugger
        </span>
        <span style={{ marginLeft: '0.5rem' }}>🎯</span>
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        {/* Quest List */}
        <div className="glass p-4">
          <h2 className="text-lg font-semibold mb-4">Quests</h2>
          <div className="space-y-2">
            {quests.map(quest => (
              <div
                key={quest.id}
                className={`p-3 rounded-lg cursor-pointer transition ${
                  selectedQuest?.id === quest.id 
                    ? 'bg-white/20' 
                    : 'bg-white/5 hover:bg-white/10'
                }`}
                onClick={() => setSelectedQuest(quest)}
              >
                <div className="font-medium">{quest.title}</div>
                <div className="text-sm text-gray-500">{quest.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quest Details */}
        <div className="glass p-6">
          {selectedQuest ? (
            <>
              <h2 className="text-xl font-semibold mb-4">{selectedQuest.title}</h2>
              <div className="space-y-3 mb-6">
                <div>
                  <span className="font-medium">Status:</span> {selectedQuest.status}
                </div>
                <div>
                  <span className="font-medium">Priority:</span> {selectedQuest.priority}
                </div>
                {selectedQuest.description && (
                  <div>
                    <span className="font-medium">Description:</span>
                    <p className="mt-1 text-gray-600">{selectedQuest.description}</p>
                  </div>
                )}
              </div>

              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={() => runQuest(selectedQuest.id)}
              >
                ▶️ Run Quest
              </button>
            </>
          ) : (
            <p className="text-gray-500">Select a quest to debug</p>
          )}

          {/* Logs */}
          {logs.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Logs</h3>
              <div className="bg-black/10 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
                {logs.map((log, i) => (
                  <div key={i} className="mb-1">{log}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
