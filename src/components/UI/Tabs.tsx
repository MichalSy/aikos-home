'use client';

import { useEffect, useRef, useState } from 'react';
import './Tabs.css';

interface TabItem {
  id: string;
  label: string;
  icon?: string;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Tabs({ items, activeTab, onTabChange, className = '', style }: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    // Find active tab and position indicator
    if (tabsRef.current) {
      const activeIndex = items.findIndex(tab => tab.id === activeTab);
      const tabButtons = tabsRef.current.querySelectorAll('.tab-button');
      
      if (tabButtons[activeIndex]) {
        const button = tabButtons[activeIndex] as HTMLElement;
        setIndicatorStyle({
          left: button.offsetLeft,
          width: button.offsetWidth,
        });
      }
    }
  }, [activeTab, items]);

  return (
    <div className={`tabs-container ${className}`} style={style}>
      <div className="tabs-header" ref={tabsRef}>
        {items.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon && <span className="tab-icon">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
        <div className="tab-indicator" style={indicatorStyle} />
      </div>
    </div>
  );
}
