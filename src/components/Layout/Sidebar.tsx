'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  status: string;
}

export default function Sidebar({ status }: SidebarProps) {
  const [frontImage, setFrontImage] = useState('/avatar.jpg');
  const [backImage, setBackImage] = useState('/avatar.jpg');
  const [showFront, setShowFront] = useState(true);
  const statusRef = useRef(status);

  const getPossibleImages = (s: string) => {
    if (s === 'thinking' || s === 'writing' || s === 'busy' || s === 'working') {
      return ['/avatar_thinking.jpg', '/avatar_working.jpg'];
    }
    return ['/avatar.jpg', '/avatar_idle_2.jpg'];
  };

  const transitionTo = (newUrl: string) => {
    const img = new Image();
    img.src = newUrl;
    img.onload = () => {
      if (showFront) {
        setBackImage(newUrl);
        requestAnimationFrame(() => setShowFront(false));
      } else {
        setFrontImage(newUrl);
        requestAnimationFrame(() => setShowFront(true));
      }
    };
  };

  useEffect(() => {
    statusRef.current = status;
    const possible = getPossibleImages(status);
    const currentUrl = showFront ? frontImage : backImage;
    
    if (!possible.includes(currentUrl)) {
      transitionTo(possible[0]);
    }
  }, [status]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const tick = () => {
      const delay = Math.floor(Math.random() * 1000) + 4000;
      
      timer = setTimeout(() => {
        const possible = getPossibleImages(statusRef.current);
        const currentUrl = showFront ? frontImage : backImage;
        
        const candidates = possible.filter(img => img !== currentUrl);
        if (candidates.length > 0) {
          const next = candidates[Math.floor(Math.random() * candidates.length)];
          transitionTo(next);
        }
        
        tick();
      }, delay);
    };

    tick();
    return () => clearTimeout(timer);
  }, [showFront, frontImage, backImage]);

  const pathname = usePathname();

  const navItems = [
    { href: '/kanban', icon: '📜', label: 'Quest Board' },
    { href: '/schedule', icon: '⏳', label: 'Timeline' },
    { href: '/analytics', icon: '📊', label: 'Stats & EXP' },
    { href: '/debug', icon: '🎯', label: 'Quest Debug' },
    { href: '/settings', icon: '🔧', label: 'Config' },
  ];

  return (
    <div className="sidebar">
      <div className="profile">
        <div className="avatar-container">
          <div 
            className="avatar" 
            style={{ backgroundImage: `url('${backImage}')`, zIndex: 1 }}
          ></div>
          <div 
            className="avatar" 
            style={{ 
              backgroundImage: `url('${frontImage}')`, 
              zIndex: 2,
              opacity: showFront ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out'
            }}
          ></div>
          <div className={`status-indicator ${status || 'disconnected'}`}></div>
        </div>
        <div className="brand">
          <span className="brand-text">Aiko's Home</span>
          <span className="brand-emoji">🌸</span>
        </div>
        <div className="status-text">
          <span className={`status-dot ${status || 'disconnected'}`}></span>
          {status === 'connected' || status === 'idle' ? 'Online & Ready ✨' : status || 'Offline'}
        </div>
      </div>
      
      {navItems.map(item => (
        <Link 
          key={item.href}
          href={item.href}
          className={`nav-item ${pathname === item.href ? 'active' : ''}`}
        >
          <span>{item.icon}</span> {item.label}
        </Link>
      ))}
      
      <div style={{flex: 1}}></div>
    </div>
  );
}
