'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useWebSocket(token: string | null) {
  const [status, setStatus] = useState('disconnected');
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('disconnected');
      return;
    }

    const newSocket = io({
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setStatus('connected');
    });

    newSocket.on('status-update', (data) => {
      setStatus(data.status);
    });

    newSocket.on('disconnect', () => {
      setStatus('disconnected');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  return { status, socket };
}
