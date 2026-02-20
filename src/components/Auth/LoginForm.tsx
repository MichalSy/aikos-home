'use client';

import React, { useState } from 'react';

interface LoginFormProps {
  onLogin: (token: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      
      if (data.success) {
        onLogin(data.token);
      } else {
        setError(true);
      }
    } catch (e) {
      console.error(e);
      setError(true);
    }
  };

  return (
    <div className="login-overlay">
      <div className={`login-box ${error ? 'shake' : ''}`}>
        <div className="avatar-preview"></div>
        <h2>Okaeri! 🌸</h2>
        <p>Welcome back to Aiko's Home</p>
        
        <input 
          type="password" 
          className="login-input"
          placeholder="Password" 
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(false); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        
        {error && <p className="error-msg">Access Denied</p>}
      </div>
    </div>
  );
}
