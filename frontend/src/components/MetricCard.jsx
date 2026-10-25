import React from 'react';

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeType = 'cyan', // 'cyan', 'green', 'amber', 'rose'
  icon: Icon,
  trend
}) {
  const badgeClasses = {
    green: 'badge-green',
    amber: 'badge-amber',
    cyan: 'badge-cyan',
    rose: 'badge-rose'
  }[badgeType] || 'badge-cyan';

  return (
    <div className="glass-panel" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--accent-cyan)' }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span className="mono-num" style={{ fontSize: '28px', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
            {subtitle}
          </span>
        )}
        {badgeText && (
          <span className={`badge-status ${badgeClasses}`}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
