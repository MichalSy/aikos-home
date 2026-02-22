'use client';

import { useTopbarActions } from '@/contexts/TopbarActionsContext';

interface TopbarProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function Topbar({ title, subtitle, icon }: TopbarProps) {
  const { actions } = useTopbarActions();

  return (
    <div className="topbar">
      <div>
        <h1>
          <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
          </span>
          {icon && <span style={{ marginLeft: '0.5rem' }}>{icon}</span>}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}
