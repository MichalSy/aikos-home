'use client';

import { useState, useEffect } from 'react';

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('aiko_token');
    setToken(storedToken);
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem('aiko_token', newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem('aiko_token');
    setToken(null);
  };

  return { token, loading, login, logout };
}
