interface TopbarProps {
  title: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
}

export function Topbar({ title, subtitle, icon, children }: TopbarProps) {
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
      {children && <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>{children}</div>}
    </div>
  );
}
