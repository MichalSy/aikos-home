'use client';

import React, { useState } from 'react';
import './NewTaskModal.css';

interface NewTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export const NewTaskModal = ({ onClose, onCreated }: NewTaskModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('aiko_token');
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ title, description, priority })
    });

    if (res.ok) {
      onCreated();
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass" onClick={e => e.stopPropagation()}>
        <h2>Create New Quest</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Quest Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            className="modal-input"
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="modal-textarea"
          />
          <select value={priority} onChange={e => setPriority(e.target.value)} className="modal-select">
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-submit">Create Quest</button>
          </div>
        </form>
      </div>
    </div>
  );
};
