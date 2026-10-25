import React from 'react';

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  badgeText,
  badgeType = 'cyan', // 'cyan', 'green', 'amber', 'rose', 'purple'
  icon: Icon,
  trend
}) {
  const badgeClasses = {
    green: 'badge-green',
    amber: 'badge-amber',
    cyan: 'badge-cyan',
    rose: 'badge-rose',
    purple: 'badge-purple'
  }[badgeType] || 'badge-cyan';

  const accentColors = {
    green: '#10B981',
    amber: '#F59E0B',
    cyan: '#06B6D4',
    rose: '#F43F5E',
    purple: '#8B5CF6'
  }[badgeType] || '#06B6D4';

  return (
    <div 
      className="glass-panel" 
      style={{ 
        padding: '20px', 
        position: 'relative', 
        overflow: 'hidden',
        background: 'linear-gradient(180deg, rgba(20, 31, 54, 0.75) 0%, rgba(13, 20, 36, 0.85) 100%)',
        borderTop: `2px solid ${accentColors}`
      }}
    >
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${accentColors}15 0%, transparent 70%)`,
        pointerEvents: 'none'
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{ 
            padding: '7px', 
            borderRadius: '9px', 
            background: 'rgba(255, 255, 255, 0.04)', 
            color: accentColors,
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <Icon size={17} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
        <span className="mono-num" style={{ fontSize: '28px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {unit}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        {subtitle && (
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontWeight: 500 }}>
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
