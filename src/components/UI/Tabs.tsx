'use client';

import React, { useState } from 'react';

interface TabsProps {
  items: Array<{ id: string; label: string; icon: string }>;
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const Tabs = ({ items, activeTab, onTabChange }: TabsProps) => {
  return (
    <div className="tabs-container">
      {items.map(item => (
        <button
          key={item.id}
          className={`tab-button ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => onTabChange(item.id)}
        >
          <span className="tab-icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
};
